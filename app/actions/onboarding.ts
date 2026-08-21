"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "@/services/business.service";
import { seedMissionsForBusiness } from "@/services/mission.service";
import { recordGrowthScoreBaseline } from "@/services/audit.service";
import { normalizeDomain } from "@/lib/utils";
import { runQuickAudit, growthPotentialLabel } from "@/lib/quickAudit";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";

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
  await recordGrowthScoreBaseline(supabase, business.id, business.growth_score);

  redirect("/dashboard");
}
