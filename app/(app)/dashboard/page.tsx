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
import { getSectorBenchmark } from "@/services/benchmark.service";
import { ensureGoogleSignalMission } from "@/services/googleSignalMission.service";
import { getChecklist } from "@/services/googleBusinessChecklist.service";
import { getIntegration } from "@/services/googleIntegration.service";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";
import { computeAchievements } from "@/lib/achievements";
import { computeMomentumScore } from "@/lib/momentum";
import { computeWeeklyBrief } from "@/lib/weeklyBrief";
import { dailyQuickWinCap, getPlan, canUseGoogleIntegrations } from "@/lib/plans";
import { PlanPurchaseCelebration } from "@/features/dashboard/PlanPurchaseCelebration";

const CALENDAR_WEEKS = 12;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ bienvenida?: string; plan?: string }>;
}) {
  const { bienvenida, plan: planPurchaseParam } = await searchParams;
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

  // Como mucho 1 misión al día basada en datos reales de Google (si el
  // negocio tiene la integración conectada) — se genera antes de rellenar el
  // resto del cupo diario con plantillas, para que cuente como una más del
  // cupo en vez de sumarse aparte.
  try {
    await ensureGoogleSignalMission(supabase, business.id, business.plan, missions);
    missions = await getMissionsForBusiness(supabase, business.id);
  } catch {
    // si falla, el dashboard sigue funcionando solo con misiones de plantilla
  }

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
      dailyQuickWinCap(business.plan, business.xp),
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
  let purchaseCount = 0;
  try {
    const [chestsOpened, requests] = await Promise.all([
      countChestsOpened(supabase, business.id),
      getRequestsForBusiness(supabase, business.id),
    ]);
    purchaseCount = business.plan_purchase_count + requests.length;
    achievements = computeAchievements({
      xp: business.xp,
      longestStreak: business.longest_streak,
      hasCompletedDaily: missions.some((m) => m.type === "daily" && m.completed_at !== null),
      hasCompletedWeekly: missions.some((m) => m.type === "weekly" && m.completed_at !== null),
      chestsOpened,
      opportunityRequests: requests.length,
      scoreImproved: scoreTimeline.length >= 2 && scoreTimeline[scoreTimeline.length - 1].score > scoreTimeline[0].score,
      purchaseCount,
    });
  } catch {
    // dashboard sigue funcionando sin la sección de logros
  }

  // Justo tras comprar un plan (redirect real de Stripe, ver
  // createPlanCheckoutAction): si esta compra cruzó exactamente un hito de
  // compras, se lo enseñamos junto con la celebración — nunca inventado, solo
  // si el contador real coincide con el hito en este momento.
  const justUnlockedAchievement =
    planPurchaseParam === "success"
      ? (achievements.find(
          (a) =>
            (a.id === "first-purchase" && purchaseCount === 1) ||
            (a.id === "purchases-5" && purchaseCount === 5) ||
            (a.id === "purchases-10" && purchaseCount === 10),
        ) ?? null)
      : null;

  // Benchmark sectorial real: solo se calcula y se muestra si hay suficientes
  // negocios reales de ese tipo (ver MIN_SAMPLE_SIZE en benchmark.service.ts)
  // — con pocos datos sería un número inventado, no un benchmark de verdad.
  let sectorBenchmark = null;
  try {
    sectorBenchmark = await getSectorBenchmark(supabase, business.business_type, business.id);
  } catch {
    // se oculta el benchmark en vez de romper la página
  }

  // Puntuación "Local"/"Conversión" del desglose por área: solo tiene sentido
  // consultarlas si el plan da acceso a las integraciones de Google — si no,
  // el componente ya las muestra como "de pago" sin necesitar estos datos.
  let localScore: number | null = null;
  let hasAnalyticsConnected = false;
  if (canUseGoogleIntegrations(business.plan)) {
    try {
      const checklist = await getChecklist(supabase, business.id);
      if (checklist) {
        const items = [
          checklist.has_complete_hours,
          checklist.has_enough_photos,
          checklist.has_correct_category,
          checklist.has_contact_info,
          checklist.responds_to_reviews,
        ];
        localScore = Math.round((items.filter(Boolean).length / items.length) * 100);
      }
    } catch {
      // se muestra como "conecta tu ficha" en vez de romper la página
    }
    try {
      const integration = await getIntegration(supabase, business.id);
      hasAnalyticsConnected = Boolean(integration?.ga4_property_id);
    } catch {
      // se muestra como "conecta" en vez de romper la página
    }
  }

  return (
    <>
      {planPurchaseParam === "success" && business.plan !== "starter" && (
        <PlanPurchaseCelebration plan={getPlan(business.plan)} justUnlockedAchievement={justUnlockedAchievement} />
      )}
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
        sectorBenchmark={sectorBenchmark}
        localScore={localScore}
        hasAnalyticsConnected={hasAnalyticsConnected}
      />
    </>
  );
}
