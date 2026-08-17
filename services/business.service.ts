import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export interface CreateBusinessInput {
  ownerId: string;
  domain: string;
  businessType: string;
  city: string;
  companySize: string;
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

export async function createBusiness(supabase: Client, input: CreateBusinessInput) {
  const { data, error } = await supabase
    .from("businesses")
    .insert({
      owner_id: input.ownerId,
      domain: input.domain,
      business_type: input.businessType,
      city: input.city,
      company_size: input.companySize,
      // Growth Score real llega con el motor de auditoría (Sprint 3).
      // Valor de partida neutro para que el usuario tenga algo que mejorar desde el día 1.
      growth_score: 50,
      growth_potential: "Alto",
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
