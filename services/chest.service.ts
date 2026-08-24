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

const XP_REWARD_OPTIONS: Record<"base" | "mid" | "high", number[]> = {
  base: [5, 10, 15, 20],
  mid: [10, 15, 20, 25],
  high: [15, 20, 25, 30],
};

/**
 * Cofre diario: mismas tres recompensas reales para todos, pero mejores
 * probabilidades (y XP más alta) a partir del nivel 5 y otra vez del 8 — uno
 * de los beneficios reales de subir de nivel.
 */
export function rollChestReward(
  level: number,
): { type: "xp"; xp: number } | { type: "bonus_mission" } | { type: "template" } {
  const tier = level >= 8 ? "high" : level >= 5 ? "mid" : "base";
  const odds = tier === "high" ? { xp: 0.65, bonusMission: 0.95 } : tier === "mid" ? { xp: 0.6, bonusMission: 0.92 } : { xp: 0.5, bonusMission: 0.8 };

  const roll = Math.random();
  if (roll < odds.xp) {
    const options = XP_REWARD_OPTIONS[tier];
    const xp = options[Math.floor(Math.random() * options.length)];
    return { type: "xp", xp };
  }
  if (roll < odds.bonusMission) {
    return { type: "bonus_mission" };
  }
  return { type: "template" };
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
  rewardType: "xp" | "bonus_mission" | "template",
  xpAwarded: number | null,
  templateId: string | null = null,
) {
  const { data, error } = await supabase
    .from("daily_chests")
    .insert({
      business_id: businessId,
      opened_date: todayDate(),
      reward_type: rewardType,
      xp_awarded: xpAwarded,
      template_id: templateId,
    })
    .select("*")
    .single();

  if (error) throw error;
  return data;
}
