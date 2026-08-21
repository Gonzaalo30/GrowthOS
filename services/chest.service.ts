import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

export async function getTodayChest(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("daily_chests")
    .select("*")
    .eq("business_id", businessId)
    .eq("opened_date", todayDate())
    .maybeSingle();

  if (error) throw error;
  return data;
}

const XP_REWARD_OPTIONS = [5, 10, 15, 20];

export function rollChestReward(): { type: "xp"; xp: number } | { type: "bonus_mission" } {
  // 60% XP, 40% misión extra — ambas recompensas son reales, sin nada inventado.
  if (Math.random() < 0.6) {
    const xp = XP_REWARD_OPTIONS[Math.floor(Math.random() * XP_REWARD_OPTIONS.length)];
    return { type: "xp", xp };
  }
  return { type: "bonus_mission" };
}

export async function countChestsOpened(supabase: Client, businessId: string): Promise<number> {
  const { count, error } = await supabase
    .from("daily_chests")
    .select("id", { count: "exact", head: true })
    .eq("business_id", businessId);
  if (error) throw error;
  return count ?? 0;
}

export async function recordChestOpen(
  supabase: Client,
  businessId: string,
  rewardType: "xp" | "bonus_mission",
  xpAwarded: number | null,
) {
  const { data, error } = await supabase
    .from("daily_chests")
    .insert({ business_id: businessId, opened_date: todayDate(), reward_type: rewardType, xp_awarded: xpAwarded })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
