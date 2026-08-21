"use client";

import { useState } from "react";
import { CheckItem } from "@/components/growth/CheckItem";
import type { QuickAuditCheck } from "@/lib/quickAudit";

export function ScoreBreakdown({ checks }: { checks: QuickAuditCheck[] }) {
  const [open, setOpen] = useState(false);

  if (checks.length === 0) return null;

  const passedCount = checks.filter((c) => c.passed).length;

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-foreground"
      >
        {open
          ? "Ocultar desglose"
          : `¿Por qué esta puntuación? Cumples ${passedCount} de ${checks.length}`}
      </button>

      {open && (
        <div className="mt-3 rounded-xl bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            En qué nos basamos hoy
          </p>
          <div className="divide-y divide-border">
            {checks.map((check) => (
              <CheckItem key={check.id} check={check} />
            ))}
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Iremos ampliando este análisis (velocidad real, Schema, Google Business...) en próximas
            actualizaciones.
          </p>
        </div>
      )}
    </div>
  );
}
