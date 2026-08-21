"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getMissionsForBusiness, addBonusDailyMission } from "@/services/mission.service";
import { getTodayChest, rollChestReward, recordChestOpen } from "@/services/chest.service";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";

export interface OpenChestResult {
  alreadyOpened: boolean;
  rewardType?: "xp" | "bonus_mission";
  xpAwarded?: number;
  missionTitle?: string;
}

export async function openDailyChestAction(): Promise<OpenChestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("No autenticado");

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) throw new Error("Negocio no encontrado");

  const existing = await getTodayChest(supabase, business.id);
  if (existing) {
    return {
      alreadyOpened: true,
      rewardType: existing.reward_type,
      xpAwarded: existing.xp_awarded ?? undefined,
    };
  }

  const reward = rollChestReward();

  if (reward.type === "xp") {
    const { error } = await supabase.rpc("increment_business_xp", {
      p_business_id: business.id,
      p_amount: reward.xp,
    });
    if (error) throw error;
    await recordChestOpen(supabase, business.id, "xp", reward.xp);
    revalidatePath("/dashboard");
    return { alreadyOpened: false, rewardType: "xp", xpAwarded: reward.xp };
  }

  let missionTitle: string | undefined;
  if ((BUSINESS_TYPES as readonly string[]).includes(business.business_type)) {
    const existingMissions = await getMissionsForBusiness(supabase, business.id);
    const template = await addBonusDailyMission(
      supabase,
      business.id,
      business.business_type as BusinessType,
      existingMissions,
    );
    missionTitle = template?.title;
  }
  await recordChestOpen(supabase, business.id, "bonus_mission", null);
  revalidatePath("/dashboard");
  return { alreadyOpened: false, rewardType: "bonus_mission", missionTitle };
}
