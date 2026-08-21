import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Devuelve casos de éxito reales para una mejora concreta. La tabla empieza
 * vacía a propósito — se rellena solo con casos reales de clientes, nunca con
 * datos inventados. Mientras esté vacía, el llamador simplemente no muestra
 * la sección (no hay nada que ocultar artificialmente).
 */
export async function getCaseStudiesForOpportunity(supabase: Client, opportunityId: string) {
  const { data, error } = await supabase
    .from("case_studies")
    .select("*")
    .eq("opportunity_id", opportunityId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}
