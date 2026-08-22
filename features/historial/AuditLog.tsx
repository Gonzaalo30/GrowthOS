import { formatDate } from "@/lib/formatDate";
import { cn } from "@/lib/utils";
import type { DateFormat } from "@/types/database.types";

export interface AuditLogEntry {
  id: string;
  date: string;
  kind: "mission" | "score" | "purchase";
  title: string;
  meta: string;
  isWeekly?: boolean;
}

function dotColor(entry: AuditLogEntry) {
  if (entry.kind === "score") {
    if (entry.meta.startsWith("+")) return "bg-emerald-500";
    if (entry.meta.startsWith("-")) return "bg-zinc-400";
    return "bg-zinc-300";
  }
  if (entry.kind === "purchase") return "bg-zinc-900";
  return entry.isWeekly ? "bg-brand-600" : "bg-brand-400";
}

function metaColor(entry: AuditLogEntry) {
  if (entry.kind === "score") {
    if (entry.meta.startsWith("+")) return "text-emerald-700";
    if (entry.meta.startsWith("-")) return "text-zinc-600";
    return "text-zinc-500";
  }
  return "text-zinc-500";
}

export function AuditLog({ entries, dateFormat }: { entries: AuditLogEntry[]; dateFormat: DateFormat }) {
  if (entries.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-surface p-8 text-center">
        <p className="text-sm text-zinc-600">
          Todavía no hay nada que registrar. En cuanto completes tu primer Quick Win, aparece aquí.
        </p>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col">
      {entries.map((entry, i) => (
        <div key={entry.id} className="relative flex gap-4 pb-6">
          {i < entries.length - 1 && (
            <span className="absolute left-[5px] top-3 h-full w-px bg-border" aria-hidden />
          )}
          <span className={cn("relative mt-1.5 h-[11px] w-[11px] shrink-0 rounded-full", dotColor(entry))} />
          <div className="flex flex-1 flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">
                {entry.kind === "purchase" && "Compraste: "}
                {entry.title}
              </p>
              <p className="text-xs text-zinc-500">{formatDate(entry.date, dateFormat)}</p>
            </div>
            <span className={cn("shrink-0 text-sm font-semibold", metaColor(entry))}>{entry.meta}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
