import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Registra un evento real del funnel (auditoría iniciada, misión completada,
 * mejora solicitada, checkout completado...). Nunca lanza: la analítica no
 * debe romper la funcionalidad real si falla.
 */
export async function trackEvent(
  supabase: Client,
  eventName: string,
  businessId: string | null,
  properties?: Record<string, unknown>,
) {
  try {
    await supabase.from("analytics_events").insert({
      business_id: businessId,
      event_name: eventName,
      properties: properties ?? null,
    });
  } catch {
    // silencioso a propósito
  }
}
