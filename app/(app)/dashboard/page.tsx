import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
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
import { getTodayChest, countChestsOpened } from "@/services/chest.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";
import { computeAchievements } from "@/lib/achievements";
import { computeMomentumScore } from "@/lib/momentum";
import { computeWeeklyBrief } from "@/lib/weeklyBrief";
import { dailyQuickWinCap } from "@/lib/plans";

const CALENDAR_WEEKS = 12;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string }>;
}) {
  const { bienvenida } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  let business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const scoreRefresh = await refreshGrowthScoreIfStale(supabase, business.id, business.domain);
  if (scoreRefresh.refreshed) {
    business = await getActiveBusiness(supabase, user.id);
    if (!business) redirect("/onboarding");
  }

  let missions = await getMissionsForBusiness(supabase, business.id);
  const scoreBreakdown = await getLatestScoreBreakdown(supabase, business.id);

  if ((BUSINESS_TYPES as readonly string[]).includes(business.business_type)) {
    const businessType = business.business_type as BusinessType;
    // Los checks que fallan de verdad hoy, para que la rotación priorice misiones
    // que atacan un problema real detectado, no una elección a ciegas.
    const failedChecks = new Set((scoreBreakdown ?? []).filter((c) => !c.passed).map((c) => c.id));
    await ensureDailyMissions(
      supabase,
      business.id,
      businessType,
      failedChecks,
      missions,
      dailyQuickWinCap(business.plan),
    );
    missions = await getMissionsForBusiness(supabase, business.id);
  }

  const momentum = computeMomentumScore(missions);
  const weeklyBrief = computeWeeklyBrief(missions);

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

  // Los logros son un extra: si algo falla al calcularlos, el resto del
  // dashboard debe seguir funcionando igualmente.
  let achievements: ReturnType<typeof computeAchievements> = [];
  try {
    const [chestsOpened, requests] = await Promise.all([
      countChestsOpened(supabase, business.id),
      getRequestsForBusiness(supabase, business.id),
    ]);
    achievements = computeAchievements({
      xp: business.xp,
      longestStreak: business.longest_streak,
      hasCompletedDaily: missions.some((m) => m.type === "daily" && m.completed_at !== null),
      hasCompletedWeekly: missions.some((m) => m.type === "weekly" && m.completed_at !== null),
      chestsOpened,
      opportunityRequests: requests.length,
      scoreImproved: scoreTimeline.length >= 2 && scoreTimeline[scoreTimeline.length - 1].score > scoreTimeline[0].score,
    });
  } catch {
    // dashboard sigue funcionando sin la sección de logros
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
      todayChest={
        todayChest
          ? { rewardType: todayChest.reward_type, xpAwarded: todayChest.xp_awarded, templateId: todayChest.template_id }
          : null
      }
      achievements={achievements}
      dateFormat={profile.date_format}
      welcomeMissionId={bienvenida}
      momentum={momentum}
      weeklyBrief={weeklyBrief}
    />
  );
}
