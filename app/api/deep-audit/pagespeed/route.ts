import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { fetchPageSpeedScore, buildPageSpeedCheck } from "@/lib/pageSpeed";
import { reportDeepAuditStep, type DeepAuditStep } from "@/lib/deepAuditCoordinator";

// PageSpeed real (Lighthouse) puede tardar 15-45s por estrategia — por eso
// móvil y escritorio son peticiones separadas, cada una con su propio
// presupuesto de 60s, en vez de compartir una sola función.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { businessId, domain, strategy } = await request.json();
  if (!businessId || !domain || (strategy !== "mobile" && strategy !== "desktop")) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  const step: DeepAuditStep = strategy === "mobile" ? "pagespeed-mobile" : "pagespeed-desktop";

  try {
    const result = await fetchPageSpeedScore(`https://${domain}`, strategy);
    const check = buildPageSpeedCheck(result, strategy);
    await reportDeepAuditStep(supabase, businessId, step, check ? [check] : []);
    return NextResponse.json({ ok: true, score: result?.score ?? null });
  } catch {
    try {
      await reportDeepAuditStep(supabase, businessId, step, []);
    } catch {
      // si ni siquiera esto funciona, el reintento del ciclo diario lo recogerá
    }
    return NextResponse.json({ error: "No se pudo completar PageSpeed." }, { status: 500 });
  }
}
