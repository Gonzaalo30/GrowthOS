"use client";

import { motion } from "framer-motion";
import { ConfettiBurst } from "@/components/growth/ConfettiBurst";
import { Mascot } from "@/components/growth/Mascot";
import { Button } from "@/components/ui/Button";

export function VictoryModal({
  title,
  xpAwarded,
  onClose,
}: {
  title: string;
  xpAwarded: number;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4 }}
        className="relative w-full max-w-sm overflow-visible rounded-2xl border border-brand-200 bg-white p-8 text-center shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <ConfettiBurst />
        <Mascot size={56} className="mx-auto" />
        <p className="mt-3 text-lg font-semibold text-foreground">¡Misión completada!</p>
        <p className="mt-1 text-sm text-zinc-600">{title}</p>
        <p className="mt-4 text-3xl font-bold text-brand-600">+{xpAwarded} XP</p>
        <Button onClick={onClose} className="mt-6 w-full">
          Seguir
        </Button>
      </motion.div>
    </div>
  );
}
