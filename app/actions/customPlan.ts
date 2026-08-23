"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { requestCustomPlan } from "@/services/customPlan.service";

export interface CustomPlanState {
  error?: string;
  success?: boolean;
}

export async function requestCustomPlanAction(
  _prevState: CustomPlanState,
  formData: FormData,
): Promise<CustomPlanState> {
  const details = String(formData.get("details") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!details || !contactEmail) {
    return { error: "Cuéntanos qué necesitas y déjanos un email de contacto." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Inicia sesión primero para que sepamos qué negocio es." };

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) return { error: "No tienes un negocio asociado todavía." };

  await requestCustomPlan(supabase, business.id, details, contactEmail);
  return { success: true };
}
