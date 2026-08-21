"use client";

import { useState, useTransition } from "react";
import { motion } from "framer-motion";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { openDailyChestAction, type OpenChestResult } from "@/app/actions/chest";

export function DailyChest({ alreadyOpenedToday }: { alreadyOpenedToday: boolean }) {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<OpenChestResult | null>(null);
  const opened = alreadyOpenedToday || result !== null;

  function handleOpen() {
    startTransition(async () => {
      const res = await openDailyChestAction();
      setResult(res);
    });
  }

  return (
    <GrowthCard className="flex flex-col items-center gap-3 text-center">
      <motion.div
        key="chest"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col items-center gap-2"
      >
        {!opened ? (
          <>
            <span className="text-4xl">🎁</span>
            <p className="text-sm text-zinc-600">Tienes un cofre diario esperando.</p>
            <Button onClick={handleOpen} disabled={isPending}>
              {isPending ? "Abriendo…" : "Abrir cofre"}
            </Button>
          </>
        ) : (
          <>
            <span className="text-3xl">{result?.rewardType === "bonus_mission" ? "🎯" : "✨"}</span>
            {result?.rewardType === "xp" && (
              <p className="text-sm font-medium text-foreground">+{result.xpAwarded} XP de regalo</p>
            )}
            {result?.rewardType === "bonus_mission" && (
              <p className="text-sm font-medium text-foreground">
                Nuevo Quick Win{result.missionTitle ? `: ${result.missionTitle}` : " desbloqueado"}
              </p>
            )}
            {!result && <p className="text-sm text-zinc-500">Ya has abierto tu cofre de hoy. Vuelve mañana.</p>}
            <p className="text-xs text-zinc-400">Vuelve mañana a por otro</p>
          </>
        )}
      </motion.div>
    </GrowthCard>
  );
}
