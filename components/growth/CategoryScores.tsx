"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { canUseGoogleIntegrations } from "@/lib/plans";
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

type CategoryState =
  | { kind: "score"; value: number }
  | { kind: "locked" }
  | { kind: "connect" }
  | { kind: "viewData" }
  | { kind: "unmeasured" };

/**
 * Puntuación por área, siempre visible (no escondida detrás de un toggle) —
 * es lo que hace que el Growth Score global se sienta respaldado por datos
 * reales y no una cifra suelta. "Local" sale de tu checklist real de ficha
 * de Google Business (% de ítems reales completados) — nunca inventamos una
 * fórmula de "conversión" sin datos reales que la respalden: si tienes
 * Analytics conectado, enlazamos a tus datos reales en vez de mostrar un
 * número inventado.
 */
export function CategoryScores({
  checks,
  planId,
  localScore = null,
  hasAnalyticsConnected = false,
  lockedHref = "/precios",
}: {
  checks: QuickAuditCheck[];
  /** Plan del negocio, o null si es el visitante anónimo del analizador público. */
  planId?: string | null;
  /** % real de ítems completados del checklist de ficha de Google Business (0-100), o null si no se ha rellenado. */
  localScore?: number | null;
  /** Si el negocio ya tiene Search Console/Analytics conectado. */
  hasAnalyticsConnected?: boolean;
  /** A dónde enlaza el estado "de pago" (distinto en el analizador público vs. el dashboard). */
  lockedHref?: string;
}) {
  if (checks.length === 0) return null;

  const isPaidPlan = canUseGoogleIntegrations(planId);

  const byCategory = CATEGORY_ORDER.map((category) => {
    const categoryChecks = checks.filter((c) => c.category === category);
    if (categoryChecks.length > 0) {
      const value = Math.round((categoryChecks.filter((c) => c.passed).length / categoryChecks.length) * 100);
      return { category, state: { kind: "score", value } as CategoryState };
    }

    if (category === "local") {
      if (!isPaidPlan) return { category, state: { kind: "locked" } as CategoryState };
      if (localScore !== null) return { category, state: { kind: "score", value: localScore } as CategoryState };
      return { category, state: { kind: "connect" } as CategoryState };
    }

    if (category === "conversion") {
      if (!isPaidPlan) return { category, state: { kind: "locked" } as CategoryState };
      if (hasAnalyticsConnected) return { category, state: { kind: "viewData" } as CategoryState };
      return { category, state: { kind: "connect" } as CategoryState };
    }

    return { category, state: { kind: "unmeasured" } as CategoryState };
  });

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
      {byCategory.map(({ category, state }) => (
        <CategoryCard key={category} category={category} state={state} lockedHref={lockedHref} />
      ))}
    </div>
  );
}

function CategoryCard({
  category,
  state,
  lockedHref,
}: {
  category: ScoreCategory;
  state: CategoryState;
  lockedHref: string;
}) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="text-sm">{CATEGORY_ICONS[category]}</span>
        {state.kind === "score" ? (
          <span className="text-lg font-semibold text-foreground">{state.value}</span>
        ) : state.kind === "locked" ? (
          <span className="text-sm">🔒</span>
        ) : (
          <span className="text-lg font-semibold text-zinc-500">—</span>
        )}
      </div>
      <p className="mt-1 text-[11px] font-medium text-zinc-500">{SCORE_CATEGORY_LABELS[category]}</p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
        {state.kind === "score" && (
          <motion.div
            className={cn("h-full rounded-full", barColor(state.value))}
            initial={{ width: 0 }}
            animate={{ width: `${state.value}%` }}
            transition={{ duration: 0.7, ease: "easeOut" }}
          />
        )}
      </div>
      {state.kind === "locked" && <p className="mt-1.5 text-[11px] font-medium text-brand-600">Plan de pago</p>}
      {state.kind === "connect" && <p className="mt-1.5 text-[11px] font-medium text-brand-600">Conectar →</p>}
      {state.kind === "viewData" && <p className="mt-1.5 text-[11px] font-medium text-brand-600">Ver datos →</p>}
    </>
  );

  const className = "rounded-xl border border-border bg-white p-3";

  if (state.kind === "locked") {
    return (
      <Link href={lockedHref} className={cn(className, "block transition-colors hover:border-brand-300")}>
        {content}
      </Link>
    );
  }

  if (state.kind === "connect" || state.kind === "viewData") {
    return (
      <Link href="/integraciones" className={cn(className, "block transition-colors hover:border-brand-300")}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}
