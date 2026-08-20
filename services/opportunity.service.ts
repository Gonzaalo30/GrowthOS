import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { Opportunity } from "@/lib/opportunities";

type Client = SupabaseClient<Database>;

export async function getRequestsForBusiness(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("opportunity_requests")
    .select("*")
    .eq("business_id", businessId);

  if (error) throw error;
  return data;
}

export async function requestOpportunity(supabase: Client, businessId: string, opportunity: Opportunity) {
  const { error } = await supabase.from("opportunity_requests").insert({
    business_id: businessId,
    opportunity_id: opportunity.id,
    title: opportunity.title,
    price_cents: opportunity.priceCents,
  });

  if (error) throw error;
}
