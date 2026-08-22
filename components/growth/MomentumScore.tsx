"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { MomentumResult } from "@/lib/momentum";

function scoreColor(score: number) {
  if (score >= 70) return "bg-emerald-500";
  if (score >= 40) return "bg-brand-500";
  return "bg-zinc-400";
}

export function MomentumScore({ data }: { data: MomentumResult | null }) {
  if (!data) return null;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span className="font-medium text-foreground">Momentum Score</span>
        <span>
          {data.completed} de {data.available} Quick Wins esta semana
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          className={cn("h-full rounded-full", scoreColor(data.score))}
          initial={{ width: 0 }}
          animate={{ width: `${data.score}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
