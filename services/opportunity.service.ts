import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function getRequestsForBusiness(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("opportunity_requests")
    .select("*")
    .eq("business_id", businessId);

  if (error) throw error;
  return data;
}
