import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function requestCustomPlan(
  supabase: Client,
  data: { name: string; details: string; contactEmail: string; businessId: string | null },
) {
  const { error } = await supabase.from("custom_plan_requests").insert({
    business_id: data.businessId,
    name: data.name,
    details: data.details,
    contact_email: data.contactEmail,
  });
  if (error) throw error;
}
