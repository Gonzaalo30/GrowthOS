import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export interface CreateBusinessInput {
  ownerId: string;
  domain: string;
  businessType: string;
  city: string;
  companySize: string;
  growthScore: number;
  growthPotential: string;
}

export async function getBusinessByOwner(supabase: Client, ownerId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function getBusinessById(supabase: Client, businessId: string) {
  const { data, error } = await supabase.from("businesses").select("*").eq("id", businessId).single();

  if (error) throw error;
  return data;
}

export async function createBusiness(supabase: Client, input: CreateBusinessInput) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: input.ownerId,
      domain: input.domain,
      business_type: input.businessType,
      city: input.city,
      company_size: input.companySize,
      growth_score: input.growthScore,
      growth_potential: input.growthPotential,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
