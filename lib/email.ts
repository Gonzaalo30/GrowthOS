const NOTIFICATION_EMAIL = process.env.NOTIFICATION_EMAIL ?? "hola@gonzalomarketinglab.com";
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL ?? "GrowthOS <onboarding@resend.dev>";

/**
 * Envía un email real vía la API de Resend. Si `RESEND_API_KEY` no está
 * configurada, o si Resend falla, no lanza — quien llama decide si eso
 * bloquea o no el flujo (normalmente no debería: el formulario ya se guardó
 * en la base de datos, el email es solo una notificación extra).
 */
export async function sendNotificationEmail({
  subject,
  text,
}: {
  subject: string;
  text: string;
}): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [NOTIFICATION_EMAIL],
        subject,
        text,
      }),
    });
    return response.ok;
  } catch {
    return false;
  }
}
