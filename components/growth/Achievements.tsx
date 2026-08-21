import { GrowthCard } from "@/components/growth/GrowthCard";
import { cn } from "@/lib/utils";
import type { Achievement } from "@/lib/achievements";

export function Achievements({ achievements }: { achievements: Achievement[] }) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <GrowthCard>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Logros</h2>
        <span className="text-xs text-zinc-500">
          {unlockedCount} / {achievements.length}
        </span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {achievements.map((a) => (
          <div
            key={a.id}
            title={a.description}
            className={cn(
              "flex flex-col items-center gap-1 rounded-xl border p-3 text-center",
              a.unlocked ? "border-brand-200 bg-brand-50" : "border-border bg-surface-muted opacity-50",
            )}
          >
            <span className={cn("text-2xl", !a.unlocked && "grayscale")}>{a.emoji}</span>
            <span className="text-[11px] font-medium leading-tight text-foreground">{a.title}</span>
          </div>
        ))}
      </div>
    </GrowthCard>
  );
}
