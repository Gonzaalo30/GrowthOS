"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { forceRefreshGrowthScore } from "@/services/audit.service";
import { canRefreshOnDemand } from "@/lib/plans";

export interface ForceRefreshResult {
  success: boolean;
  error?: string;
}

export async function forceRefreshGrowthScoreAction(): Promise<ForceRefreshResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Tu sesión ha caducado, inicia sesión de nuevo." };

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) return { success: false, error: "No tienes un negocio asociado." };

  if (!canRefreshOnDemand(business.plan)) {
    return { success: false, error: "Reanalizar cuando quieras es una ventaja de los planes Growth y Autopilot." };
  }

  const result = await forceRefreshGrowthScore(supabase, business.id, business.domain);
  if (!result.refreshed) {
    return { success: false, error: "No hemos podido analizar tu web ahora mismo. Inténtalo de nuevo en un momento." };
  }

  revalidatePath("/dashboard");
  return { success: true };
}
