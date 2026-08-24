import type { Level } from "@/lib/levels";
import { getLevelBadgeClasses } from "@/lib/levels";
import { cn } from "@/lib/utils";

export function LevelBadge({ level, className }: { level: Level; className?: string }) {
  const { badge, dot } = getLevelBadgeClasses(level.name);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        badge,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
      {level.name}
    </span>
  );
}
