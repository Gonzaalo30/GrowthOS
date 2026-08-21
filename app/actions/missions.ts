"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { completeMission, getMissionById } from "@/services/mission.service";
import { getBusinessById } from "@/services/business.service";
import { findTemplateById } from "@/lib/missionTemplates";
import { runQuickAudit } from "@/lib/quickAudit";
import { trackEvent } from "@/lib/analytics";

export interface CompleteMissionResult {
  success: boolean;
  error?: string;
  xpAwarded?: number;
  multiplierApplied?: boolean;
}

export async function completeMissionAction(missionId: string): Promise<CompleteMissionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("No autenticado");

  const mission = await getMissionById(supabase, missionId);
  if (mission.completed_at) {
    return { success: true };
  }

  // Las misiones ligadas a un hallazgo real del análisis (título, descripción,
  // SSL, móvil) se verifican de verdad antes de darlas por completadas — no basta
  // con que el usuario diga que ya lo hizo. Las que no se pueden comprobar así
  // (responder una reseña, subir una foto) siguen siendo de confianza por ahora:
  // verificarlas de verdad requeriría acceso a la API de Google Business (Sprint 5).
  const template = findTemplateById(mission.template_id);
  if (template?.auditTrigger) {
    const business = await getBusinessById(supabase, mission.business_id);
    const audit = await runQuickAudit(business.domain);
    const check = audit.checks.find((c) => c.id === template.auditTrigger);
    if (check && !check.passed) {
      return {
        success: false,
        error:
          "Todavía no detectamos este cambio en tu web. A veces tarda unos minutos en reflejarse — vuelve a intentarlo en un rato.",
      };
    }
  }

  const outcome = await completeMission(supabase, missionId);
  await trackEvent(supabase, "mission_completed", mission.business_id, { missionId, type: mission.type });
  revalidatePath("/dashboard");
  return { success: true, xpAwarded: outcome?.xpAwarded, multiplierApplied: outcome?.multiplierApplied };
}
