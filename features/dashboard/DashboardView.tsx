import Link from "next/link";
import { ScoreCircle } from "@/components/growth/ScoreCircle";
import { MissionCard } from "@/components/growth/MissionCard";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { XPBar } from "@/components/growth/XPBar";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { ScoreCelebration } from "@/components/growth/ScoreCelebration";
import { ScoreBreakdown } from "@/components/growth/ScoreBreakdown";
import { getLevelProgress } from "@/lib/levels";
import type { Database } from "@/types/database.types";
import type { GrowthScoreRefreshResult } from "@/services/audit.service";
import type { QuickAuditCheck } from "@/lib/quickAudit";

type Business = Database["public"]["Tables"]["businesses"]["Row"];
type Mission = Database["public"]["Tables"]["missions"]["Row"];

export function DashboardView({
  business,
  missions,
  scoreRefresh,
  scoreBreakdown,
}: {
  business: Business;
  missions: Mission[];
  scoreRefresh?: GrowthScoreRefreshResult;
  scoreBreakdown?: QuickAuditCheck[] | null;
}) {
  const dailyMissions = missions.filter((m) => m.type === "daily");
  const weeklyMission = missions.find((m) => m.type === "weekly");
  const pendingDaily = dailyMissions.filter((m) => !m.completed_at).length;
  const levelProgress = getLevelProgress(business.xp);
  const scoreDelta =
    scoreRefresh?.refreshed && scoreRefresh.previousScore !== null
      ? scoreRefresh.currentScore - scoreRefresh.previousScore
      : 0;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      {scoreDelta > 0 && <ScoreCelebration delta={scoreDelta} />}

      <GrowthCard className="flex flex-col gap-6">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <ScoreCircle score={business.growth_score} potential={business.growth_potential} />
          <div className="text-center sm:text-left">
            <div className="flex flex-col items-center gap-2 sm:flex-row">
              <h1 className="text-lg font-semibold text-foreground">{business.domain}</h1>
              <LevelBadge level={levelProgress.level} />
              <StreakBadge days={business.streak_count} />
            </div>
            <p className="mt-1 text-sm text-zinc-600">
              Hoy tienes <span className="font-medium text-foreground">{pendingDaily} misiones diarias</span>
              {weeklyMission && !weeklyMission.completed_at && (
                <> y <span className="font-medium text-foreground">1 misión semanal</span></>
              )}
              .
            </p>
          </div>
        </div>

        <XPBar xp={business.xp} progress={levelProgress} />

        {scoreBreakdown && scoreBreakdown.length > 0 && <ScoreBreakdown checks={scoreBreakdown} />}
      </GrowthCard>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Misiones de hoy
        </h2>
        <div className="flex flex-col gap-3">
          {dailyMissions.map((mission) => (
            <MissionCard key={mission.id} mission={mission} />
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

      <Link href="/marketplace">
        <GrowthCard className="flex items-center justify-between transition-colors hover:border-brand-300">
          <div>
            <h2 className="font-medium text-foreground">Marketplace</h2>
            <p className="mt-1 text-sm text-zinc-600">Mejoras con precio cerrado, cuando quieras ir más rápido.</p>
          </div>
          <span className="text-brand-600">→</span>
        </GrowthCard>
      </Link>
    </div>
  );
}
