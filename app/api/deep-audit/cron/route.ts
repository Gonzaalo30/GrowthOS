import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { triggerDeepAudit } from "@/lib/deepAuditTrigger";
import { isAnalyzingStale } from "@/lib/deepAuditCoordinator";

export const maxDuration = 60;

const REFRESH_INTERVAL_DAYS = 7;

/** Vercel Cron manda `Authorization: Bearer $CRON_SECRET` si esa variable está configurada — evita que cualquiera dispare el ciclo desde fuera. */
function isAuthorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return true;
  return request.headers.get("authorization") === `Bearer ${secret}`;
}

/**
 * Disparado una vez al día por Vercel Cron (ver `vercel.json`) — busca
 * negocios con 7+ días desde su último análisis real (o cuyo análisis
 * anterior quedó atascado más de 15 minutos, ver `isAnalyzingStale`) y
 * lanza la auditoría profunda de cada uno.
 */
export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, domain, growth_score_status, growth_score_analyzing_since");
  if (error) {
    return NextResponse.json({ error: "No se pudo leer los negocios." }, { status: 500 });
  }

  let triggered = 0;
  for (const business of businesses ?? []) {
    const stuck =
      business.growth_score_status === "analyzing" && isAnalyzingStale(business.growth_score_analyzing_since);
    // Ya hay un análisis real en marcha para este negocio: no se duplica.
    if (business.growth_score_status === "analyzing" && !stuck) continue;

    const { data: lastHistory } = await supabase
      .from("growth_score_history")
      .select("recorded_at")
      .eq("business_id", business.id)
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const daysSinceLast = lastHistory
      ? (Date.now() - new Date(lastHistory.recorded_at).getTime()) / (1000 * 60 * 60 * 24)
      : Infinity;

    if (daysSinceLast >= REFRESH_INTERVAL_DAYS) {
      try {
        await triggerDeepAudit(supabase, business.id, business.domain);
        triggered++;
      } catch {
        // un negocio que falla al disparar no debe frenar el resto del ciclo diario
      }
    }
  }

  return NextResponse.json({ ok: true, triggered, checked: businesses?.length ?? 0 });
}
