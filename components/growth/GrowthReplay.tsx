import { GrowthCard } from "@/components/growth/GrowthCard";
import { formatDate } from "@/lib/formatDate";
import type { GrowthScorePoint } from "@/services/audit.service";
import type { DateFormat } from "@/types/database.types";

interface CompletedMission {
  id: string;
  title: string;
  completed_at: string | null;
}

/**
 * Antes/después real del Growth Score, con las misiones completadas en medio.
 * Solo se muestra si hay al menos 2 puntos de historial — sin eso no hay
 * "replay" honesto que enseñar todavía.
 */
export function GrowthReplay({
  timeline,
  completedMissions,
  dateFormat = "long",
}: {
  timeline: GrowthScorePoint[];
  completedMissions: CompletedMission[];
  dateFormat?: DateFormat;
}) {
  if (timeline.length < 2) return null;

  const first = timeline[0];
  const last = timeline[timeline.length - 1];
  const delta = last.score - first.score;

  return (
    <GrowthCard className="flex flex-col gap-4">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Growth Replay</h2>

      <div className="flex items-center justify-center gap-6">
        <div className="text-center">
          <p className="text-xs text-zinc-500">Antes · {formatDate(first.recordedAt, dateFormat)}</p>
          <p className="text-3xl font-semibold text-zinc-400">{first.score}</p>
        </div>
        <span className="text-2xl text-zinc-300">→</span>
        <div className="text-center">
          <p className="text-xs text-zinc-500">Ahora · {formatDate(last.recordedAt, dateFormat)}</p>
          <p className="text-3xl font-semibold text-foreground">{last.score}</p>
        </div>
        {delta !== 0 && (
          <span
            className={
              delta > 0
                ? "rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-semibold text-emerald-700"
                : "rounded-full bg-zinc-100 px-2.5 py-1 text-sm font-semibold text-zinc-600"
            }
          >
            {delta > 0 ? "+" : ""}
            {delta}
          </span>
        )}
      </div>

      {completedMissions.length > 0 && (
        <div>
          <p className="mb-1.5 text-xs font-medium text-zinc-500">Misiones completadas en este tramo</p>
          <ul className="flex flex-col gap-1">
            {completedMissions.map((m) => (
              <li key={m.id} className="flex items-center gap-2 text-sm text-zinc-600">
                <span className="text-emerald-600">✓</span>
                {m.title}
              </li>
            ))}
          </ul>
        </div>
      )}
    </GrowthCard>
  );
}
