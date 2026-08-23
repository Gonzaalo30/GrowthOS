"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckItem } from "@/components/growth/CheckItem";
import type { QuickAuditCheck } from "@/lib/quickAudit";
import { SCORE_CATEGORY_LABELS, type ScoreCategory } from "@/lib/scoreCategories";

const CATEGORY_ORDER: ScoreCategory[] = ["seo", "confianza", "velocidad", "local", "conversion"];

export function ScoreBreakdown({ checks }: { checks: QuickAuditCheck[] }) {
  const [open, setOpen] = useState(false);

  if (checks.length === 0) return null;

  const passedCount = checks.filter((c) => c.passed).length;
  const byCategory = CATEGORY_ORDER.map((category) => ({
    category,
    checks: checks.filter((c) => c.category === category),
  })).filter(({ checks: c }) => c.length > 0);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="text-xs font-medium text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-foreground"
      >
        {open
          ? "Ocultar el detalle"
          : `Ver el detalle de cada comprobación · Cumples ${passedCount} de ${checks.length}`}
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-3 flex flex-col gap-4 rounded-xl bg-surface-muted p-4">
              {byCategory.map(({ category, checks: categoryChecks }) => (
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
                Local y Conversión todavía no las medimos — llegan cuando ampliemos el motor de auditoría y
                conectemos Google Business.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
