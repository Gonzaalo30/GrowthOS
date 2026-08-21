"use client";

import { useState } from "react";
import { CheckItem } from "@/components/growth/CheckItem";
import { cn } from "@/lib/utils";
import type { QuickAuditCheck } from "@/lib/quickAudit";
import { SCORE_CATEGORY_LABELS, type ScoreCategory } from "@/lib/scoreCategories";

const CATEGORY_ORDER: ScoreCategory[] = ["seo", "confianza", "velocidad", "conversion", "local"];

export function ScoreBreakdown({ checks }: { checks: QuickAuditCheck[] }) {
  const [open, setOpen] = useState(false);

  if (checks.length === 0) return null;

  const passedCount = checks.filter((c) => c.passed).length;

  const byCategory = CATEGORY_ORDER.map((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const categoryScore =
      categoryChecks.length > 0
        ? Math.round((categoryChecks.filter((c) => c.passed).length / categoryChecks.length) * 100)
        : null;
    return { category, checks: categoryChecks, score: categoryScore };
  });

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
        <div className="mt-3 flex flex-col gap-4 rounded-xl bg-surface-muted p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
            En qué nos basamos hoy
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {byCategory.map(({ category, score }) => (
              <div key={category} className="rounded-lg bg-white px-2 py-2 text-center">
                <p
                  className={cn(
                    "text-sm font-semibold",
                    score === null ? "text-zinc-300" : "text-foreground",
                  )}
                >
                  {score === null ? "—" : `${score}`}
                </p>
                <p className="text-[11px] text-zinc-500">{SCORE_CATEGORY_LABELS[category]}</p>
              </div>
            ))}
          </div>

          {byCategory
            .filter(({ checks: c }) => c.length > 0)
            .map(({ category, checks: categoryChecks }) => (
              <div key={category}>
                <p className="text-xs font-semibold text-brand-600">{SCORE_CATEGORY_LABELS[category]}</p>
                <div className="divide-y divide-border">
                  {categoryChecks.map((check) => (
                    <CheckItem key={check.id} check={check} />
                  ))}
                </div>
              </div>
            ))}

          <p className="text-xs text-zinc-500">
            Las categorías marcadas con &ldquo;—&rdquo; (Local, Conversión) todavía no las medimos —
            llegan cuando ampliemos el motor de auditoría y conectemos Google Business.
          </p>
        </div>
      )}
    </div>
  );
}
