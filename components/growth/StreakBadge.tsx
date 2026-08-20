import { cn } from "@/lib/utils";

export function StreakBadge({ days, className }: { days: number; className?: string }) {
  if (days <= 0) return null;

  const milestone = days >= 30 ? "30" : days >= 7 ? "7" : null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
        milestone === "30" ? "bg-amber-100 text-amber-700" : "bg-orange-50 text-orange-700",
        className,
      )}
      title={
        milestone === "30"
          ? "¡Insignia de 30 días! Constancia excepcional."
          : milestone === "7"
            ? "¡Racha de 7 días! Sigue así."
            : undefined
      }
    >
      <span aria-hidden>🔥</span>
      {days} {days === 1 ? "día" : "días"} seguidos
    </span>
  );
}
