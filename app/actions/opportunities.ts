"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { requestOpportunity } from "@/services/opportunity.service";
import { OPPORTUNITIES } from "@/lib/opportunities";

export async function requestOpportunityAction(opportunityId: string) {
  const opportunity = OPPORTUNITIES.find((o) => o.id === opportunityId);
  if (!opportunity) throw new Error("Mejora no encontrada");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) throw new Error("No tienes un negocio asociado");

  await requestOpportunity(supabase, business.id, opportunity);
  revalidatePath("/marketplace");
}
