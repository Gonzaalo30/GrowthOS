import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { selectDailyMissions, selectWeeklyMission, type BusinessType } from "@/lib/missionTemplates";
import type { QuickAuditResult } from "@/lib/quickAudit";

type Client = SupabaseClient<Database>;

export async function seedMissionsForBusiness(
  supabase: Client,
  businessId: string,
  businessType: BusinessType,
  audit: QuickAuditResult,
) {
  const failedChecks = new Set(audit.checks.filter((c) => !c.passed).map((c) => c.id));
  const dailyMissions = selectDailyMissions(businessType, failedChecks);
  const weeklyMission = selectWeeklyMission(businessType, failedChecks);

  const rows = [
    ...dailyMissions.map((m) => ({
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
      title: weeklyMission.title,
      description: weeklyMission.description,
      difficulty: weeklyMission.difficulty,
      time_estimate_minutes: weeklyMission.timeEstimateMinutes,
      xp_reward: weeklyMission.xpReward,
      expected_impact: weeklyMission.expectedImpact,
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
