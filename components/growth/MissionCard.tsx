"use client";

import { useState, useTransition } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { completeMissionAction } from "@/app/actions/missions";
import type { Database } from "@/types/database.types";

type Mission = Database["public"]["Tables"]["missions"]["Row"];

const DIFFICULTY_LABEL: Record<Mission["difficulty"], string> = {
  easy: "Fácil",
  medium: "Media",
  hard: "Alta",
};

export function MissionCard({ mission }: { mission: Mission }) {
  const [isPending, startTransition] = useTransition();
  const [justCompleted, setJustCompleted] = useState(false);
  const isCompleted = Boolean(mission.completed_at) || justCompleted;

  function handleComplete() {
    startTransition(async () => {
      await completeMissionAction(mission.id);
      setJustCompleted(true);
    });
  }

  return (
    <GrowthCard className={cn("relative overflow-visible", isCompleted && "bg-brand-50/40")}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{mission.type === "daily" ? "Misión diaria" : "Misión semanal"}</span>
            <span>·</span>
            <span>{DIFFICULTY_LABEL[mission.difficulty]}</span>
            <span>·</span>
            <span>{mission.time_estimate_minutes} min</span>
          </div>
          <h3 className="mt-1 font-medium text-foreground">{mission.title}</h3>
          <p className="mt-1 text-sm text-zinc-600">{mission.description}</p>
          {mission.expected_impact && (
            <p className="mt-2 text-xs font-medium text-brand-600">
              {mission.expected_impact}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 sm:flex-col sm:items-end">
          <span className="text-xs font-semibold text-brand-600">+{mission.xp_reward} XP</span>
          <Button
            variant={isCompleted ? "secondary" : "primary"}
            disabled={isCompleted || isPending}
            onClick={handleComplete}
          >
            {isCompleted ? "Completada" : isPending ? "Guardando…" : "Marcar como hecha"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {justCompleted && (
          <motion.span
            initial={{ opacity: 0, y: 0, scale: 0.8 }}
            animate={{ opacity: 1, y: -24, scale: 1.1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="pointer-events-none absolute right-4 top-0 text-sm font-semibold text-brand-500"
          >
            +{mission.xp_reward} XP
          </motion.span>
        )}
      </AnimatePresence>
    </GrowthCard>
  );
}
