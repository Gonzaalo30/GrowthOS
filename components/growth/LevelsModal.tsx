"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { LEVELS, getChestTier, getLevelBadgeClasses, type ChestTier } from "@/lib/levels";
import { cn } from "@/lib/utils";

const CHEST_TIER_LABEL: Record<ChestTier, string> = {
  base: "Cofre diario con probabilidades base",
  mid: "Cofre diario con mejores probabilidades y más XP",
  high: "Cofre diario con las mejores probabilidades y XP más alta",
};

/**
 * Lista real de los 10 niveles y sus beneficios acumulados — nada de "niveles
 * secretos" ni beneficios inventados, son exactamente los mismos números que
 * usa `lib/levels.ts` para calcular el tope diario de Quick Wins y
 * `chest.service.ts` para las probabilidades reales del cofre.
 */
export function LevelsModal({
  currentLevelIndex,
  onClose,
}: {
  /** Índice (0-9) del nivel actual, o null en el contexto público de marketing (sin usuario). */
  currentLevelIndex: number | null;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.35 }}
        className="relative flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="border-b border-border p-6 pb-4">
          <h2 className="text-lg font-semibold text-foreground">Todos los niveles</h2>
          <p className="mt-1 text-sm text-zinc-600">
            Subes de nivel ganando XP al completar misiones. Estos son los beneficios reales de cada uno.
          </p>
        </div>

        <ul className="flex flex-col gap-2 overflow-y-auto p-6 pt-4">
          {LEVELS.map((level, i) => {
            const levelNumber = i + 1;
            const isCurrent = i === currentLevelIndex;
            const reached = currentLevelIndex !== null && i <= currentLevelIndex;
            const tier = getChestTier(levelNumber);
            const { badge, dot } = getLevelBadgeClasses(level.name);

            return (
              <li
                key={level.name}
                className={cn(
                  "rounded-xl border p-3",
                  isCurrent ? "border-brand-400 bg-brand-50" : "border-border",
                  currentLevelIndex !== null && !reached && "opacity-50",
                )}
              >
                <div className="flex items-center justify-between gap-3">
                  <span
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold",
                      badge,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
                    {levelNumber}. {level.name}
                  </span>
                  <span className="text-xs text-zinc-500">{level.minXp.toLocaleString("es-ES")} XP</span>
                </div>
                <ul className="mt-2 flex flex-col gap-0.5 pl-1 text-xs text-zinc-600">
                  <li>· {CHEST_TIER_LABEL[tier]}</li>
                  {level.bonusQuickWins > 0 && (
                    <li>
                      · +{level.bonusQuickWins} Quick Win{level.bonusQuickWins > 1 ? "s" : ""} extra al día
                    </li>
                  )}
                </ul>
                {isCurrent && (
                  <p className="mt-2 text-xs font-medium text-brand-600">Tu nivel actual</p>
                )}
              </li>
            );
          })}
        </ul>

        <div className="border-t border-border p-4">
          <Button onClick={onClose} variant="secondary" className="w-full">
            Cerrar
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
