import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Activa/desactiva funcionalidades sin redeploy: se editan filas en
 * `feature_flags` directamente en Supabase. Sin panel de admin todavía — eso
 * es un paso más, esto es la base real para no tener que tocar código.
 */
export async function isFeatureEnabled(supabase: Client, key: string, fallback = false): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("feature_flags")
      .select("enabled")
      .eq("key", key)
      .maybeSingle();
    if (error || !data) return fallback;
    return data.enabled;
  } catch {
    return fallback;
  }
}
