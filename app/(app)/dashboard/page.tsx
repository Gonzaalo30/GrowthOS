import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import {
  ensureDailyMissions,
  getMissionsForBusiness,
  getDailyCompletionCounts,
  getCompletedMissionsSince,
} from "@/services/mission.service";
import {
  refreshGrowthScoreIfStale,
  getLatestScoreBreakdown,
  getGrowthScoreTimeline,
} from "@/services/audit.service";
import { getTodayChest } from "@/services/chest.service";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";

const CALENDAR_WEEKS = 12;

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  let business = await getBusinessByOwner(supabase, user.id);
  if (!business) redirect("/onboarding");

  const scoreRefresh = await refreshGrowthScoreIfStale(supabase, business.id, business.domain);
  if (scoreRefresh.refreshed) {
    business = await getBusinessByOwner(supabase, user.id);
    if (!business) redirect("/onboarding");
  }

  let missions = await getMissionsForBusiness(supabase, business.id);

  if ((BUSINESS_TYPES as readonly string[]).includes(business.business_type)) {
    const businessType = business.business_type as BusinessType;
    await ensureDailyMissions(supabase, business.id, businessType, new Set(), missions);
    missions = await getMissionsForBusiness(supabase, business.id);
  }

  const scoreBreakdown = await getLatestScoreBreakdown(supabase, business.id);
  const profile = await getProfile(supabase, user.id);

  const calendarSince = new Date();
  calendarSince.setUTCDate(calendarSince.getUTCDate() - CALENDAR_WEEKS * 7);
  const dailyCounts = await getDailyCompletionCounts(supabase, business.id, calendarSince);

  const scoreTimeline = await getGrowthScoreTimeline(supabase, business.id);
  const replayMissions =
    scoreTimeline.length >= 2
      ? await getCompletedMissionsSince(supabase, business.id, new Date(scoreTimeline[0].recordedAt))
      : [];

  // El cofre diario es un extra de gamificación: si algo falla al leerlo, el
  // resto del dashboard debe seguir funcionando igualmente.
  let todayChest = null;
  try {
    todayChest = await getTodayChest(supabase, business.id);
  } catch {
    // se trata como "cofre no abierto todavía" en vez de romper la página
  }

  return (
    <DashboardView
      business={business}
      missions={missions}
      scoreRefresh={scoreRefresh}
      scoreBreakdown={scoreBreakdown}
      profileName={profile.name}
      dailyCounts={Object.fromEntries(dailyCounts)}
      scoreTimeline={scoreTimeline}
      replayMissions={replayMissions}
      chestOpenedToday={Boolean(todayChest)}
    />
  );
}
