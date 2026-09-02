import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runDeepPageAudit } from "@/lib/deepAudit";
import { reportDeepAuditStep } from "@/lib/deepAuditCoordinator";

// Sitemap + hasta 20 páginas reales, fetches en paralelo — el paso más
// pesado en número de peticiones, pero ninguna tarda tanto como PageSpeed.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { businessId, domain } = await request.json();
  if (!businessId || !domain) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  try {
    const result = await runDeepPageAudit(domain);
    await reportDeepAuditStep(supabase, businessId, "pages", result.checks);
    return NextResponse.json({ ok: true, pagesAnalyzed: result.pagesAnalyzed, pagesFound: result.pagesFound });
  } catch {
    // Aunque falle, se reporta el paso vacío para no dejar a los otros 3
    // esperando para siempre a un paso que nunca llega.
    try {
      await reportDeepAuditStep(supabase, businessId, "pages", []);
    } catch {
      // si ni siquiera esto funciona, el reintento del ciclo diario lo recogerá
    }
    return NextResponse.json({ error: "No se pudo completar el rastreo del sitemap." }, { status: 500 });
  }
}
