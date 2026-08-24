"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { VictoryModal } from "@/components/growth/VictoryModal";
import { FocusMode } from "@/components/growth/FocusMode";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { completeMissionAction } from "@/app/actions/missions";
import { findTemplateById } from "@/lib/missionTemplates";
import type { Database } from "@/types/database.types";

type Mission = Database["public"]["Tables"]["missions"]["Row"];

const DIFFICULTY_LABEL: Record<Mission["difficulty"], string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Alta",
};

export function MissionCard({
  mission,
  quickWinNumber,
  celebrateWithModal = false,
}: {
  mission: Mission;
  quickWinNumber?: number;
  /** Misión de la semana y activaciones especiales: pantalla de victoria con confeti en vez del "+XP" flotante habitual. */
  celebrateWithModal?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const [awardedXp, setAwardedXp] = useState<number | null>(null);
  const [multiplierApplied, setMultiplierApplied] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const [showVictoryModal, setShowVictoryModal] = useState(false);
  const [showFocusMode, setShowFocusMode] = useState(false);
  const isCompleted = Boolean(mission.completed_at) || justCompleted;

  const isWeekly = mission.type === "weekly";
  const template = findTemplateById(mission.template_id);
  const isVerified = Boolean(template?.auditTrigger);
  const isGoogleSignal = Boolean(
    mission.template_id && (mission.template_id.startsWith("gsc-") || mission.template_id.startsWith("ga4-")),
  );

  function handleComplete() {
    setVerifyError(null);
    startTransition(async () => {
      const result = await completeMissionAction(mission.id);
      if (result.success) {
        setJustCompleted(true);
        setAwardedXp(result.xpAwarded ?? mission.xp_reward);
        setMultiplierApplied(Boolean(result.multiplierApplied));
        // En modo enfoque ya se ve la propia pantalla de completada con
        // confeti y XP — el Victory Screen aparte sería una doble celebración.
        if (celebrateWithModal && !showFocusMode) setShowVictoryModal(true);
      } else {
        setVerifyError(result.error ?? "No hemos podido verificar esta misión. Inténtalo de nuevo.");
      }
    });
  }

  return (
    <GrowthCard
      className={cn(
        "relative overflow-visible",
        isWeekly && "border-2 border-brand-400 bg-gradient-to-br from-brand-50 to-transparent p-6 shadow-md",
        isCompleted && "bg-brand-50/40",
      )}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className={cn("flex items-center gap-2 text-zinc-500", isWeekly ? "text-sm" : "text-xs")}>
            <span className={cn(isWeekly && "text-base font-bold text-brand-600")}>
              {isWeekly ? "👑 MISIÓN DE LA SEMANA · Alto impacto" : `Quick Win${quickWinNumber ? ` #${quickWinNumber}` : ""}`}
            </span>
            {!isWeekly && (
              <>
                <span>·</span>
                <span>{DIFFICULTY_LABEL[mission.difficulty]}</span>
              </>
            )}
            <span>·</span>
            <span>{mission.time_estimate_minutes} min</span>
          </div>
          <h3 className={cn("mt-1 font-medium text-foreground", isWeekly && "text-lg font-semibold")}>
            {mission.title}
          </h3>
          {isGoogleSignal && (
            <span className="mt-1 inline-flex items-center gap-1 text-xs font-medium text-brand-600">
              🔍 Basado en tus datos reales de Google
            </span>
          )}
          <p className="mt-1 text-sm text-zinc-600">{mission.description}</p>
          {mission.expected_impact && (
            <p className="mt-2 text-xs font-medium text-brand-600">
              {mission.expected_impact}
            </p>
          )}

          <div className="mt-2 flex items-center gap-3">
            {template && (
              <button
                type="button"
                onClick={() => setShowTutorial((v) => !v)}
                className="text-xs font-medium text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                {showTutorial ? "Ocultar cómo hacerlo" : "¿Cómo lo hago?"}
              </button>
            )}
            {!isCompleted && (
              <button
                type="button"
                onClick={() => setShowFocusMode(true)}
                className="text-xs font-medium text-zinc-500 underline decoration-dotted underline-offset-2 hover:text-foreground"
              >
                Modo enfoque
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
          <span className={cn("font-semibold text-brand-600", isWeekly ? "text-xl" : "text-xs")}>
            +{mission.xp_reward} XP
          </span>
          <Button
            variant={isCompleted ? "secondary" : "primary"}
            disabled={isCompleted || isPending}
            onClick={handleComplete}
          >
            {isCompleted
              ? "Completada"
              : isPending
                ? isVerified
                  ? "Verificando…"
                  : "Guardando…"
                : isVerified
                  ? "Verificar y marcar como hecha"
                  : "Marcar como hecha"}
          </Button>
        </div>
      </div>

      {verifyError && <p className="mt-2 text-sm text-red-600">{verifyError}</p>}

      <AnimatePresence initial={false}>
        {template && showTutorial && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="mt-4 rounded-xl bg-surface-muted p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Hazlo tú, paso a paso</p>
              <ol className="mt-2 flex flex-col gap-2">
                {template.tutorial.map((step, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-600">
                    <span className="font-semibold text-brand-600">{i + 1}.</span>
                    {step}
                  </li>
                ))}
              </ol>
              {template.tip && (
                <p className="mt-3 rounded-lg bg-brand-50 p-3 text-sm text-brand-800">💡 {template.tip}</p>
              )}
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm text-zinc-600">
                  ¿Prefieres no ocuparte de esto?{" "}
                  <Link href="/plan-autopilot" className="font-medium text-brand-600 underline underline-offset-2">
                    Que lo hagamos nosotros por ti
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {justCompleted && !celebrateWithModal && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -24, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute right-4 top-0 text-sm font-semibold text-brand-500"
          >
            +{awardedXp ?? mission.xp_reward} XP{multiplierApplied ? " ×2 🔥" : ""}
          </motion.span>
        )}
      </AnimatePresence>

      {showVictoryModal && (
        <VictoryModal
          title={mission.title}
          xpAwarded={awardedXp ?? mission.xp_reward}
          onClose={() => setShowVictoryModal(false)}
        />
      )}

      {showFocusMode && (
        <FocusMode
          mission={mission}
          template={template}
          isCompleted={isCompleted}
          isPending={isPending}
          isVerified={isVerified}
          awardedXp={awardedXp}
          verifyError={verifyError}
          onComplete={handleComplete}
          onClose={() => setShowFocusMode(false)}
        />
      )}
    </GrowthCard>
  );
}
