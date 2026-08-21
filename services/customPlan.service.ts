import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function requestCustomPlan(
  supabase: Client,
  businessId: string,
  details: string,
  contactEmail: string,
) {
  const { error } = await supabase
    .from("custom_plan_requests")
    .insert({ business_id: businessId, details, contact_email: contactEmail });
  if (error) throw error;
}
