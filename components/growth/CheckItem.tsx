import { cn } from "@/lib/utils";
import type { QuickAuditCheck } from "@/lib/quickAudit";

export function CheckItem({ check }: { check: QuickAuditCheck }) {
  return (
    <div className="flex items-start gap-3 py-3">
      <span
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-xs font-bold",
          check.passed ? "bg-emerald-100 text-emerald-700" : "bg-brand-100 text-brand-700",
        )}
      >
        {check.passed ? "✓" : "!"}
      </span>
      <div>
        <p className="text-sm font-medium text-foreground">
          {check.label}
          {check.pageUrl && (
            <span className="ml-2 truncate text-xs font-normal text-zinc-400">{check.pageUrl}</span>
          )}
        </p>
        <p className="text-sm text-zinc-600">{check.detail}</p>
      </div>
    </div>
  );
}
