import { cn } from "@/lib/utils";
import type { PlanId } from "@/lib/plans";

export function PlanBadge({ planId, className }: { planId: PlanId; className?: string }) {
  if (!planId || planId === "starter") return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-zinc-900 px-3 py-1 text-xs font-semibold text-white",
        className,
      )}
    >
      ⚡ {planId === "autopilot" ? "Autopilot" : "Growth"}
    </span>
  );
}
