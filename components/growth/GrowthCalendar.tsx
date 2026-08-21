import { cn } from "@/lib/utils";
import { GrowthCard } from "@/components/growth/GrowthCard";

const WEEKS = 12;

function levelForCount(count: number) {
  if (count <= 0) return 0;
  if (count === 1) return 1;
  if (count === 2) return 2;
  return 3;
}

const LEVEL_CLASSES = [
  "bg-surface-muted",
  "bg-brand-100",
  "bg-brand-400",
  "bg-brand-600",
];

/** `counts`: fecha YYYY-MM-DD (según servidor) -> nº de misiones completadas ese día. */
export function GrowthCalendar({ counts }: { counts: Record<string, number> }) {
  const today = new Date();
  const totalDays = WEEKS * 7;

  const days: { date: string; count: number }[] = [];
  for (let i = totalDays - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, count: counts[key] ?? 0 });
  }

  const weeks: { date: string; count: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const totalCompleted = days.reduce((sum, d) => sum + d.count, 0);

  return (
    <GrowthCard>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Calendario de crecimiento
        </h2>
        <span className="text-xs text-zinc-500">{totalCompleted} misiones en {WEEKS} semanas</span>
      </div>
      <div className="flex gap-1 overflow-x-auto pb-1">
        {weeks.map((week, i) => (
          <div key={i} className="flex flex-col gap-1">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} ${day.count === 1 ? "misión" : "misiones"}`}
                className={cn("h-3 w-3 rounded-sm", LEVEL_CLASSES[levelForCount(day.count)])}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-[11px] text-zinc-500">
        <span>Menos</span>
        {LEVEL_CLASSES.map((cls) => (
          <span key={cls} className={cn("h-3 w-3 rounded-sm", cls)} />
        ))}
        <span>Más</span>
      </div>
    </GrowthCard>
  );
}
