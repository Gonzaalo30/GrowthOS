"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "@/services/business.service";
import { updateActiveBusiness } from "@/services/profile.service";
import {
  seedMissionsForBusiness,
  getMissionsForBusiness,
  addBonusDailyMission,
} from "@/services/mission.service";
import { recordGrowthScoreBaseline } from "@/services/audit.service";
import { normalizeDomain } from "@/lib/utils";
import { runQuickAudit, growthPotentialLabel } from "@/lib/quickAudit";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import { findTemplateById, type BusinessType } from "@/lib/missionTemplates";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const businessTypeRaw = String(formData.get("businessType") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const companySize = String(formData.get("companySize") ?? "").trim();

  if (!domain || !businessTypeRaw || !city || !companySize) {
    return { error: "Completa todos los campos para continuar." };
  }

  if (!(BUSINESS_TYPES as readonly string[]).includes(businessTypeRaw)) {
    return { error: "Selecciona un tipo de negocio válido." };
  }
  const businessType = businessTypeRaw as BusinessType;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };
  }

  const audit = await runQuickAudit(domain);

  const business = await createBusiness(supabase, {
    ownerId: user.id,
    domain,
    businessType,
    city,
    companySize,
    growthScore: audit.unreachable ? 50 : audit.score,
    growthPotential: audit.unreachable ? "Alto" : growthPotentialLabel(audit.score),
  });

  await seedMissionsForBusiness(supabase, business.id, businessType, audit);
  await recordGrowthScoreBaseline(supabase, business.id, business.growth_score, audit.unreachable ? [] : audit.checks);
  // El negocio recién creado pasa a ser el activo, para que el dashboard al
  // que redirige lo muestre a él (relevante sobre todo al añadir un segundo
  // negocio, no solo el primero).
  await updateActiveBusiness(supabase, user.id, business.id);

  // Elegimos, si existe, una misión de activación que no necesite verificación
  // real (autodeclarada) — así el primer "gana XP ahora mismo" en el dashboard
  // es un acierto garantizado, no una comprobación que puede fallar porque el
  // negocio acaba de crearse y no ha corregido nada todavía. Las 3 misiones
  // diarias iniciales priorizan problemas reales detectados (por diseño,
  // Sprint 3.9), así que puede que ninguna sea autodeclarada — en ese caso
  // añadimos una misión extra solo para esto.
  let missions = await getMissionsForBusiness(supabase, business.id);
  let dailyMissions = missions.filter((m) => m.type === "daily");
  let activationMission = dailyMissions.find((m) => !findTemplateById(m.template_id)?.auditTrigger);

  if (!activationMission) {
    const bonusTemplate = await addBonusDailyMission(supabase, business.id, businessType, missions, {
      selfReportOnly: true,
    });
    if (bonusTemplate) {
      missions = await getMissionsForBusiness(supabase, business.id);
      dailyMissions = missions.filter((m) => m.type === "daily");
      activationMission = dailyMissions.find((m) => m.template_id === bonusTemplate.id);
    }
  }

  activationMission = activationMission ?? dailyMissions[0];

  // La activación se completa ya en el dashboard, no aquí: llamar a una Server
  // Action (como marcar la misión hecha) desde /onboarding revalida esta misma
  // ruta, y su guardia ("si ya existe negocio, redirige") nos echaría a mitad
  // de la interacción, cortando la confirmación antes de que se vea.
  redirect(activationMission ? `/dashboard?bienvenida=${activationMission.id}` : "/dashboard");
}
