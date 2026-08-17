"use client";

import { motion } from "framer-motion";

interface ScoreCircleProps {
  score: number;
  potential?: string | null;
  size?: number;
}

const RADIUS = 54;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ScoreCircle({ score, potential, size = 160 }: ScoreCircleProps) {
  const clamped = Math.max(0, Math.min(100, score));
  const offset = CIRCUMFERENCE - (clamped / 100) * CIRCUMFERENCE;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="10"
          />
          <motion.circle
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke="var(--color-brand-500)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tracking-tight text-foreground">
            {clamped}
          </span>
          <span className="text-xs text-zinc-500">/ 100</span>
        </div>
      </div>
      {potential && (
        <p className="text-sm text-zinc-600">
          Potencial de crecimiento: <span className="font-medium text-foreground">{potential}</span>
        </p>
      )}
    </div>
  );
}
