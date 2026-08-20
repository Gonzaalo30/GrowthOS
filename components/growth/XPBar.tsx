"use client";

import { motion } from "framer-motion";
import type { LevelProgress } from "@/lib/levels";

export function XPBar({ xp, progress }: { xp: number; progress: LevelProgress }) {
  const percent = Math.round(progress.progress * 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs text-zinc-500">
        <span>{xp} XP</span>
        <span>
          {progress.next ? `${progress.xpToNext} XP para ${progress.next.name}` : "Nivel máximo"}
        </span>
      </div>
      <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-surface-muted">
        <motion.div
          className="h-full rounded-full bg-brand-500"
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
