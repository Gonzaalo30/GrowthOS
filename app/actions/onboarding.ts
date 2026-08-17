"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createBusiness } from "@/services/business.service";
import { seedDefaultMissions } from "@/services/mission.service";
import { normalizeDomain } from "@/lib/utils";

export interface OnboardingState {
  error?: string;
}

export async function completeOnboardingAction(
  _prevState: OnboardingState,
  formData: FormData,
): Promise<OnboardingState> {
  const domain = normalizeDomain(String(formData.get("domain") ?? ""));
  const businessType = String(formData.get("businessType") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const companySize = String(formData.get("companySize") ?? "").trim();

  if (!domain || !businessType || !city || !companySize) {
    return { error: "Completa todos los campos para continuar." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Tu sesión ha caducado, inicia sesión de nuevo." };
  }

  const business = await createBusiness(supabase, {
    ownerId: user.id,
    domain,
    businessType,
    city,
    companySize,
  });

  await seedDefaultMissions(supabase, business.id);

  redirect("/dashboard");
}
