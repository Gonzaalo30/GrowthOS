"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness, getBusinessesByOwner } from "@/services/business.service";
import { getMissionsForBusiness } from "@/services/mission.service";
import { canRefreshOnDemand } from "@/lib/plans";

export interface CommandPaletteMission {
  id: string;
  title: string;
  xpReward: number;
  type: "daily" | "weekly";
}

export interface CommandPaletteBusiness {
  id: string;
  domain: string;
}

export interface CommandPaletteContext {
  missions: CommandPaletteMission[];
  canRefresh: boolean;
  otherBusinesses: CommandPaletteBusiness[];
}

export async function getCommandPaletteContextAction(): Promise<CommandPaletteContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { missions: [], canRefresh: false, otherBusinesses: [] };

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) return { missions: [], canRefresh: false, otherBusinesses: [] };

  const [missions, allBusinesses] = await Promise.all([
    getMissionsForBusiness(supabase, business.id),
    getBusinessesByOwner(supabase, user.id),
  ]);
  return {
    missions: missions
      .filter((m) => !m.completed_at)
      .map((m) => ({ id: m.id, title: m.title, xpReward: m.xp_reward, type: m.type })),
    canRefresh: canRefreshOnDemand(business.plan),
    otherBusinesses: allBusinesses.filter((b) => b.id !== business.id).map((b) => ({ id: b.id, domain: b.domain })),
  };
}
