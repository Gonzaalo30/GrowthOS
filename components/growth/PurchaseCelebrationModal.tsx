"use client";

import { motion } from "framer-motion";
import { ConfettiBurst } from "@/components/growth/ConfettiBurst";
import { Mascot } from "@/components/growth/Mascot";
import { Button } from "@/components/ui/Button";
import { PLAN_UNLOCK_TIPS } from "@/lib/planUnlocks";
import type { Plan } from "@/lib/plans";
import type { Opportunity } from "@/lib/opportunities";
import type { Achievement } from "@/lib/achievements";

type Content = { kind: "plan"; plan: Plan } | { kind: "opportunity"; opportunity: Opportunity };

export function PurchaseCelebrationModal({
  content,
  justUnlockedAchievement,
  onClose,
}: {
  content: Content;
  justUnlockedAchievement?: Achievement | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-md overflow-visible rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ConfettiBurst />
        <Mascot size={56} className="mx-auto" />

        {content.kind === "plan" ? (
          <PlanContent plan={content.plan} />
        ) : (
          <OpportunityContent opportunity={content.opportunity} />
        )}

        {justUnlockedAchievement && (
          <div className="mt-5 flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-left">
            <span className="text-2xl" aria-hidden>
              {justUnlockedAchievement.emoji}
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Logro desbloqueado</p>
              <p className="text-sm font-medium text-foreground">{justUnlockedAchievement.title}</p>
            </div>
          </div>
        )}

        <Button onClick={onClose} className="mt-6 w-full">
          Entendido
        </Button>
      </motion.div>
    </div>
  );
}

function PlanContent({ plan }: { plan: Plan }) {
  const tips = PLAN_UNLOCK_TIPS[plan.id] ?? [];
  return (
    <>
      <p className="mt-3 text-lg font-semibold text-foreground">¡Bienvenido a {plan.name}!</p>
      <p className="mt-1 text-sm text-zinc-600">Gracias por tu compra — esto es lo que acabas de desbloquear.</p>

      <ul className="mt-5 flex flex-col gap-3 text-left">
        {tips.map((t) => (
          <li key={t.title} className="rounded-lg border border-border bg-surface px-3 py-2">
            <p className="text-sm font-medium text-foreground">{t.title}</p>
            <p className="mt-0.5 text-xs text-zinc-600">{t.tip}</p>
          </li>
        ))}
      </ul>
    </>
  );
}

function OpportunityContent({ opportunity }: { opportunity: Opportunity }) {
  return (
    <>
      <p className="mt-3 text-lg font-semibold text-foreground">¡Gracias por tu compra!</p>
      <p className="mt-1 text-sm text-zinc-600">{opportunity.title}</p>

      <div className="mt-5 rounded-lg border border-border bg-surface px-3 py-3 text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Impacto esperado</p>
        <p className="mt-1 text-sm text-foreground">{opportunity.expectedImpact}</p>
      </div>

      <p className="mt-4 text-xs text-zinc-500">
        En menos de 24-48h laborables te contactamos por email o teléfono para pedirte los accesos que
        necesitemos y ponernos manos a la obra.
      </p>
    </>
  );
}
