"use client";

import { motion } from "framer-motion";

export function ScoreCelebration({ delta }: { delta: number }) {
  if (delta <= 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
    >
      🎉 <span className="font-semibold">¡Enhorabuena!</span> Tu Growth Score subió {delta}{" "}
      {delta === 1 ? "punto" : "puntos"} esta semana.
    </motion.div>
  );
}
