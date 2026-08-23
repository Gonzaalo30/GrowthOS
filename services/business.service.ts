import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getProfile } from "@/services/profile.service";

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

/** Todos los negocios de una cuenta (una persona puede tener varios), ordenados por antigüedad. */
export async function getBusinessesByOwner(supabase: Client, ownerId: string) {
  const { data, error } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

/**
 * El negocio que el usuario está viendo ahora mismo. Se basa en
 * profiles.active_business_id (persiste entre dispositivos); si no hay
 * ninguno guardado, o ya no le pertenece, se usa el más reciente en vez de
 * romper la página. Devuelve null si la cuenta todavía no tiene ningún negocio.
 */
export async function getActiveBusiness(supabase: Client, userId: string) {
  const [businesses, profile] = await Promise.all([
    getBusinessesByOwner(supabase, userId),
    getProfile(supabase, userId),
  ]);
  if (businesses.length === 0) return null;
  return businesses.find((b) => b.id === profile.active_business_id) ?? businesses[businesses.length - 1];
}

export async function getBusinessById(supabase: Client, businessId: string) {
  const { data, error } = await supabase.from("businesses").select("*").eq("id", businessId).single();

  if (error) throw error;
  return data;
}

export interface UpdateBusinessInput {
  domain: string;
  businessType: string;
  city: string;
  companySize: string;
}

export async function updateBusiness(supabase: Client, businessId: string, input: UpdateBusinessInput) {
  const { error } = await supabase
    .from("businesses")
    .update({
      domain: input.domain,
      business_type: input.businessType,
      city: input.city,
      company_size: input.companySize,
    })
    .eq("id", businessId);

  if (error) throw error;
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
