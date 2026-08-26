"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { requestGrowthSprint } from "@/services/growthSprint.service";
import { sendNotificationEmail } from "@/lib/email";
import { trackEvent } from "@/lib/analytics";

export interface GrowthSprintState {
  error?: string;
  success?: boolean;
}

export async function requestGrowthSprintAction(
  _prevState: GrowthSprintState,
  formData: FormData,
): Promise<GrowthSprintState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const details = String(formData.get("details") ?? "").trim();

  if (!name || !email || !details) {
    return { error: "Completa tu nombre, tu email y cuéntanos tu situación." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let businessId: string | null = null;
  if (user) {
    const business = await getActiveBusiness(supabase, user.id);
    businessId = business?.id ?? null;
  }

  try {
    await requestGrowthSprint(supabase, { name, email, details, businessId });
  } catch {
    return { error: "No hemos podido enviar tu solicitud. Inténtalo de nuevo en un momento." };
  }

  // La solicitud ya quedó guardada — si el email de aviso falla, no rompe el envío.
  await sendNotificationEmail({
    subject: `Nueva solicitud de Growth Sprint — ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${details}`,
  });

  await trackEvent(supabase, "growth_sprint_requested", businessId);
  return { success: true };
}
