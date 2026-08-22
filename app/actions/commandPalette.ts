"use server";

import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getMissionsForBusiness } from "@/services/mission.service";
import { canRefreshOnDemand } from "@/lib/plans";

export interface CommandPaletteMission {
  id: string;
  title: string;
  xpReward: number;
  type: "daily" | "weekly";
}

export interface CommandPaletteContext {
  missions: CommandPaletteMission[];
  canRefresh: boolean;
}

export async function getCommandPaletteContextAction(): Promise<CommandPaletteContext> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { missions: [], canRefresh: false };

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) return { missions: [], canRefresh: false };

  const missions = await getMissionsForBusiness(supabase, business.id);
  return {
    missions: missions
      .filter((m) => !m.completed_at)
      .map((m) => ({ id: m.id, title: m.title, xpReward: m.xp_reward, type: m.type })),
    canRefresh: canRefreshOnDemand(business.plan),
  };
}
