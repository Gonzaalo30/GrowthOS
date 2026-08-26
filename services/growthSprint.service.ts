import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function requestGrowthSprint(
  supabase: Client,
  data: { name: string; email: string; details: string; businessId: string | null },
) {
  const { error } = await supabase.from("growth_sprint_requests").insert({
    business_id: data.businessId,
    name: data.name,
    email: data.email,
    details: data.details,
  });
  if (error) throw error;
}
