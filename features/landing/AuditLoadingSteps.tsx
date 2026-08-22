"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GrowthCard } from "@/components/growth/GrowthCard";

const STEPS = [
  "Analizando velocidad y adaptación a móvil…",
  "Revisando SEO y contenido de la página…",
  "Comprobando seguridad y confianza…",
];

const STEP_MS = 900;

export function AuditLoadingSteps({ domain }: { domain: string }) {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return;
    const timer = setTimeout(() => setActiveStep((s) => s + 1), STEP_MS);
    return () => clearTimeout(timer);
  }, [activeStep]);

  return (
    <GrowthCard className="mx-auto flex max-w-lg flex-col gap-3 text-left">
      <p className="text-sm text-zinc-500">Analizando {domain}…</p>
      {STEPS.map((label, i) => {
        const done = i < activeStep;
        const current = i === activeStep;
        return (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: i <= activeStep ? 1 : 0.35, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex items-center gap-3 text-sm"
          >
            <span
              className={
                done
                  ? "flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-xs text-white"
                  : "flex h-5 w-5 items-center justify-center rounded-full border border-border"
              }
            >
              {done ? "✓" : current ? (
                <span className="h-2 w-2 animate-pulse rounded-full bg-brand-500" />
              ) : null}
            </span>
            <span className={done ? "text-zinc-500 line-through" : "text-foreground"}>{label}</span>
          </motion.div>
        );
      })}
    </GrowthCard>
  );
}
