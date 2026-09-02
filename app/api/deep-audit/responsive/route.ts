import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { runResponsiveChecks } from "@/lib/responsiveCheck";
import { reportDeepAuditStep } from "@/lib/deepAuditCoordinator";

// Arranque de Chromium (~2-5s) + 2 renders (tablet/móvil) — su propio
// presupuesto de 60s, separado del resto para no competir por tiempo.
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  const { businessId, domain } = await request.json();
  if (!businessId || !domain) {
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });
  }

  const supabase = createAdminClient();
  try {
    const checks = await runResponsiveChecks(`https://${domain}`);
    await reportDeepAuditStep(supabase, businessId, "responsive", checks);
    return NextResponse.json({ ok: true });
  } catch {
    try {
      await reportDeepAuditStep(supabase, businessId, "responsive", []);
    } catch {
      // si ni siquiera esto funciona, el reintento del ciclo diario lo recogerá
    }
    return NextResponse.json({ error: "No se pudo completar la comprobación responsive." }, { status: 500 });
  }
}
