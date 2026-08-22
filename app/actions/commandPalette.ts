"use server";

import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getMissionsForBusiness } from "@/services/mission.service";

export interface CommandPaletteMission {
  id: string;
  title: string;
  xpReward: number;
  type: "daily" | "weekly";
}

export async function getCommandPaletteMissionsAction(): Promise<CommandPaletteMission[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) return [];

  const missions = await getMissionsForBusiness(supabase, business.id);
  return missions
    .filter((m) => !m.completed_at)
    .map((m) => ({ id: m.id, title: m.title, xpReward: m.xp_reward, type: m.type }));
}
