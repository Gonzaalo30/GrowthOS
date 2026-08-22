"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { QuickAuditCheck } from "@/lib/quickAudit";
import { SCORE_CATEGORY_LABELS, type ScoreCategory } from "@/lib/scoreCategories";

const CATEGORY_ORDER: ScoreCategory[] = ["seo", "confianza", "velocidad", "local", "conversion"];

const CATEGORY_ICONS: Record<ScoreCategory, string> = {
  seo: "🔍",
  confianza: "🛡️",
  velocidad: "⚡",
  local: "📍",
  conversion: "🎯",
};

function barColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-brand-500";
  return "bg-red-400";
}

/**
 * Puntuación por área, siempre visible (no escondida detrás de un toggle) —
 * es lo que hace que el Growth Score global se sienta respaldado por datos
 * reales y no una cifra suelta. Las áreas que todavía no medimos se marcan
 * honestamente con "—", nunca con un número inventado.
 */
export function CategoryScores({ checks }: { checks: QuickAuditCheck[] }) {
  if (checks.length === 0) return null;

  const byCategory = CATEGORY_ORDER.map((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    const score =
      categoryChecks.length > 0
        ? Math.round((categoryChecks.filter((c) => c.passed).length / categoryChecks.length) * 100)
        : null;
    return { category, score };
  });

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {byCategory.map(({ category, score }) => (
        <div key={category} className="rounded-xl border border-border bg-white p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm">{CATEGORY_ICONS[category]}</span>
            <span
              className={cn(
                "text-lg font-semibold",
                score === null ? "text-zinc-500" : "text-foreground",
              )}
            >
              {score === null ? "—" : score}
            </span>
          </div>
          <p className="mt-1 text-[11px] font-medium text-zinc-500">{SCORE_CATEGORY_LABELS[category]}</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            {score !== null && (
              <motion.div
                className={cn("h-full rounded-full", barColor(score))}
                initial={{ width: 0 }}
                animate={{ width: `${score}%` }}
                transition={{ duration: 0.7, ease: "easeOut" }}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
