import Link from "next/link";
import { ScoreCircle } from "@/components/growth/ScoreCircle";
import { MissionCard } from "@/components/growth/MissionCard";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { XPBar } from "@/components/growth/XPBar";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { ScoreCelebration } from "@/components/growth/ScoreCelebration";
import { ScoreBreakdown } from "@/components/growth/ScoreBreakdown";
import { CategoryScores } from "@/components/growth/CategoryScores";
import { GrowthCalendar } from "@/components/growth/GrowthCalendar";
import { GrowthReplay } from "@/components/growth/GrowthReplay";
import { DailyChest } from "@/components/growth/DailyChest";
import { MascotMessage } from "@/components/growth/Mascot";
import { Achievements } from "@/components/growth/Achievements";
import { PlanBadge } from "@/components/growth/PlanBadge";
import { RefreshScoreButton } from "@/components/growth/RefreshScoreButton";
import { Greeting } from "@/features/dashboard/Greeting";
import { getLevelProgress } from "@/lib/levels";
import { canRefreshOnDemand } from "@/lib/plans";
import type { Database } from "@/types/database.types";
import type { GrowthScoreRefreshResult, GrowthScorePoint } from "@/services/audit.service";
import type { QuickAuditCheck } from "@/lib/quickAudit";
import type { Achievement } from "@/lib/achievements";
import type { DateFormat } from "@/types/database.types";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Mission = Database["public"]["Tables"]["missions"]["Row"];

export function DashboardView({
  business,
  missions,
  scoreRefresh,
  scoreBreakdown,
  profileName,
  dailyCounts,
  scoreTimeline,
  replayMissions,
  chestOpenedToday,
  achievements,
  dateFormat,
  welcomeMissionId,
}: {
  business: Business;
  missions: Mission[];
  scoreRefresh?: GrowthScoreRefreshResult;
  scoreBreakdown?: QuickAuditCheck[] | null;
  profileName: string;
  dailyCounts: Record<string, number>;
  scoreTimeline: GrowthScorePoint[];
  replayMissions: Pick<Mission, "id" | "title" | "completed_at">[];
  chestOpenedToday: boolean;
  achievements: Achievement[];
  dateFormat: DateFormat;
  welcomeMissionId?: string;
}) {
  const today = new Date().toISOString().slice(0, 10);
  const allDailyMissions = missions
    .filter((m) => m.type === "daily")
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  // "Misiones de hoy" solo muestra lo pendiente + lo completado hoy: las
  // completadas en días anteriores viven en el calendario, no aquí, para que
  // esta lista no crezca sin límite con el tiempo.
  const dailyMissionsToday = allDailyMissions.filter(
    (m) => !m.completed_at || m.completed_at.slice(0, 10) === today,
  );
  const welcomeMission = welcomeMissionId
    ? missions.find((m) => m.id === welcomeMissionId)
    : undefined;
  // Mientras se muestra el spotlight de bienvenida, esa misión no se repite
  // también en la lista normal — evita la misma tarjeta duplicada en pantalla.
  const visibleDailyMissionsToday = welcomeMission
    ? dailyMissionsToday.filter((m) => m.id !== welcomeMission.id)
    : dailyMissionsToday;
  const weeklyMission = missions.find((m) => m.type === "weekly");
  const pendingDaily = dailyMissionsToday.filter((m) => !m.completed_at).length;
  const xpAvailableToday =
    dailyMissionsToday.filter((m) => !m.completed_at).reduce((sum, m) => sum + m.xp_reward, 0) +
    (weeklyMission && !weeklyMission.completed_at ? weeklyMission.xp_reward : 0);
  const levelProgress = getLevelProgress(business.xp);
  const canLevelUpToday =
    levelProgress.next !== null && business.xp + xpAvailableToday >= levelProgress.next.minXp;
  const scoreDelta =
    scoreRefresh?.refreshed && scoreRefresh.previousScore !== null
      ? scoreRefresh.currentScore - scoreRefresh.previousScore
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div>
        <Greeting name={profileName} />
        <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-zinc-600">
          {business.streak_count > 0 && (
            <span className="font-medium text-orange-600">🔥 Racha: {business.streak_count} días</span>
          )}
          {xpAvailableToday > 0 && <span>Hoy puedes ganar {xpAvailableToday} XP.</span>}
        </p>
      </div>

      {welcomeMission && (
        <div>
          <GrowthCard className="border-2 border-brand-400 bg-gradient-to-br from-brand-50 to-transparent shadow-md">
            <p className="text-sm font-medium text-brand-600">🎉 ¡Bienvenido a GrowthOS!</p>
            <h2 className="mt-1 font-semibold text-foreground">
              Complétala en un minuto y consigue tus primeros XP
            </h2>
          </GrowthCard>
          <div className="mt-3">
            <MissionCard mission={welcomeMission} quickWinNumber={welcomeMission.sequence_number ?? undefined} />
          </div>
        </div>
      )}

      {scoreDelta > 0 && <ScoreCelebration delta={scoreDelta} />}

      {canLevelUpToday && levelProgress.next && (
        <MascotMessage message={`Hoy puedes subir al nivel ${levelProgress.next.name} si completas tus Quick Wins.`} />
      )}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:items-start">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <GrowthCard className="flex flex-col gap-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
              <ScoreCircle score={business.growth_score} potential={business.growth_potential} />
              <div className="text-center sm:text-left">
                <div className="flex flex-col items-center gap-2 sm:flex-row">
                  <h1 className="text-lg font-semibold text-foreground">{business.domain}</h1>
                  <LevelBadge level={levelProgress.level} />
                  <StreakBadge days={business.streak_count} />
                  <PlanBadge planId={business.plan} />
                </div>
                <p className="mt-1 text-sm text-zinc-600">
                  Hoy tienes <span className="font-medium text-foreground">{pendingDaily} Quick Wins</span>
                  {weeklyMission && !weeklyMission.completed_at && (
                    <> y <span className="font-medium text-foreground">1 misión semanal</span></>
                  )}
                  .
                </p>
              </div>
            </div>

            <XPBar xp={business.xp} progress={levelProgress} />

            {scoreBreakdown && scoreBreakdown.length > 0 && (
              <>
                <CategoryScores checks={scoreBreakdown} />
                <ScoreBreakdown checks={scoreBreakdown} />
              </>
            )}

            {canRefreshOnDemand(business.plan) && <RefreshScoreButton />}
          </GrowthCard>

          <div>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              Quick Wins de hoy
            </h2>
            <div className="flex flex-col gap-3">
              {visibleDailyMissionsToday.map((mission) => (
                <MissionCard
                  key={mission.id}
                  mission={mission}
                  quickWinNumber={mission.sequence_number ?? undefined}
                />
              ))}
            </div>
          </div>

          {weeklyMission && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Misión de la semana
              </h2>
              <MissionCard mission={weeklyMission} />
            </div>
          )}

          <GrowthCalendar counts={dailyCounts} />
        </div>

        <div className="flex flex-col gap-6">
          <DailyChest alreadyOpenedToday={chestOpenedToday} />

          <GrowthReplay timeline={scoreTimeline} completedMissions={replayMissions} dateFormat={dateFormat} />

          {achievements.length > 0 && <Achievements achievements={achievements} />}

          <Link href="/marketplace">
            <GrowthCard className="flex items-center justify-between transition-colors hover:border-brand-400">
              <div>
                <h2 className="font-medium text-foreground">Centro de Mejoras</h2>
                <p className="mt-1 text-sm text-zinc-600">
                  Mejoras con precio cerrado, cuando quieras ir más rápido.
                </p>
              </div>
              <span className="text-brand-600">→</span>
            </GrowthCard>
          </Link>
        </div>
      </div>
    </div>
  );
}
