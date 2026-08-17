import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { DEFAULT_DAILY_MISSIONS, DEFAULT_WEEKLY_MISSION } from "@/lib/missionTemplates";

type Client = SupabaseClient<Database>;

export async function seedDefaultMissions(supabase: Client, businessId: string) {
  const rows = [
    ...DEFAULT_DAILY_MISSIONS.map((m) => ({
      business_id: businessId,
      type: "daily" as const,
      title: m.title,
      description: m.description,
      difficulty: m.difficulty,
      time_estimate_minutes: m.timeEstimateMinutes,
      xp_reward: m.xpReward,
      expected_impact: m.expectedImpact,
    })),
    {
      business_id: businessId,
      type: "weekly" as const,
      title: DEFAULT_WEEKLY_MISSION.title,
      description: DEFAULT_WEEKLY_MISSION.description,
      difficulty: DEFAULT_WEEKLY_MISSION.difficulty,
      time_estimate_minutes: DEFAULT_WEEKLY_MISSION.timeEstimateMinutes,
      xp_reward: DEFAULT_WEEKLY_MISSION.xpReward,
      expected_impact: DEFAULT_WEEKLY_MISSION.expectedImpact,
    },
  ];

  const { error } = await supabase.from("missions").insert(rows);
  if (error) throw error;
}

export async function getMissionsForBusiness(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function completeMission(supabase: Client, missionId: string) {
  const { error } = await supabase
    .from("missions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", missionId)
    .is("completed_at", null);

  if (error) throw error;
}
