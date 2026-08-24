"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { requestCustomPlan } from "@/services/customPlan.service";
import { trackEvent } from "@/lib/analytics";

export interface CustomPlanState {
  error?: string;
  success?: boolean;
}

export async function requestCustomPlanAction(
  _prevState: CustomPlanState,
  formData: FormData,
): Promise<CustomPlanState> {
  const name = String(formData.get("name") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();
  const contactEmail = String(formData.get("contactEmail") ?? "").trim();

  if (!name || !details || !contactEmail) {
    return { error: "Completa tu nombre, qué necesitas y un email de contacto." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Si ya tiene cuenta y negocio, se enlaza — pero no es obligatorio: quien
  // todavía no sabe qué plan le conviene tampoco tiene por qué haberse dado
  // de alta ya.
  let businessId: string | null = null;
  if (user) {
    const business = await getActiveBusiness(supabase, user.id);
    businessId = business?.id ?? null;
  }

  try {
    await requestCustomPlan(supabase, { name, details, contactEmail, businessId });
  } catch {
    return { error: "No hemos podido enviar tu solicitud. Inténtalo de nuevo en un momento." };
  }

  await trackEvent(supabase, "custom_plan_requested", businessId);
  return { success: true };
}
