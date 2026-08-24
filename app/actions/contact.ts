"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { sendContactMessage } from "@/services/contact.service";
import { trackEvent } from "@/lib/analytics";
import { sendNotificationEmail } from "@/lib/email";

export interface ContactFormState {
  error?: string;
  success?: boolean;
}

export async function sendContactMessageAction(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  if (!name || !email || !message) {
    return { error: "Completa tu nombre, email y el mensaje." };
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
    await sendContactMessage(supabase, { name, email, message, businessId });
  } catch {
    return { error: "No hemos podido enviar tu mensaje. Inténtalo de nuevo en un momento." };
  }

  // El mensaje ya quedó guardado — si el email de aviso falla, no rompe el envío.
  await sendNotificationEmail({
    subject: `Nuevo mensaje de contacto — ${name}`,
    text: `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
  });

  await trackEvent(supabase, "contact_message_sent", businessId);
  return { success: true };
}
