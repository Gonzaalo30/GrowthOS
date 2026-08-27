export interface Level {
  name: string;
  minXp: number;
  /**
   * Quick Wins pendientes extra respecto al tope base del plan (acumulado,
   * no por nivel individual). Deliberadamente solo sube en 2 hitos (5 y 10)
   * para que el plan Gratis nunca se acerque al tope de Growth/Autopilot,
   * aunque alguien llegue al nivel máximo sin pagar.
   */
  bonusQuickWins: number;
}

// Duolingo-style progression: cada nivel requiere más XP que el anterior.
// Nombres pensados para el negocio local real que usa GrowthOS (clínica,
// restaurante, taller...), no jerga de startups financiadas (nada de
// "Pre-Seed"/"Series A" — no es el idioma de quien lleva un negocio local).
export const LEVELS: Level[] = [
  { name: "Arranque", minXp: 0, bonusQuickWins: 0 },
  { name: "En marcha", minXp: 100, bonusQuickWins: 0 },
  { name: "Constante", minXp: 300, bonusQuickWins: 0 },
  { name: "Consolidado", minXp: 700, bonusQuickWins: 0 },
  { name: "Referencia", minXp: 1500, bonusQuickWins: 1 },
  { name: "Destacado", minXp: 2500, bonusQuickWins: 1 },
  { name: "Sólido", minXp: 4000, bonusQuickWins: 1 },
  { name: "Avanzado", minXp: 6000, bonusQuickWins: 1 },
  { name: "Experto", minXp: 8500, bonusQuickWins: 1 },
  { name: "Líder", minXp: 12000, bonusQuickWins: 2 },
];

/** Nivel (1-10) de una cuenta según su XP — usado para tramos de cofre y prioridad de admin. */
export function getLevelNumber(xp: number): number {
  let idx = 0;
  for (let i = 0; i < LEVELS.length; i++) {
    if (xp >= LEVELS[i].minXp) idx = i;
  }
  return idx + 1;
}

export type ChestTier = "base" | "mid" | "high";

/**
 * Tramo de probabilidades del cofre diario según el nivel (1-10) — mejores
 * probabilidades y más XP a partir del nivel 5, y otra vez del nivel 8. Única
 * fuente de verdad: la usan tanto `chest.service.ts` (para tirar la
 * recompensa real) como cualquier vista que explique los niveles al usuario.
 */
export function getChestTier(level: number): ChestTier {
  return level >= 8 ? "high" : level >= 5 ? "mid" : "base";
}

export interface LevelProgress {
  level: Level;
  next: Level | null;
  /** 0-1, progreso dentro del nivel actual hacia el siguiente */
  progress: number;
  xpToNext: number | null;
}

export function getLevelProgress(xp: number): LevelProgress {
  let current = LEVELS[0];
  for (const level of LEVELS) {
    if (xp >= level.minXp) current = level;
  }

  const idx = LEVELS.indexOf(current);
  const next = LEVELS[idx + 1] ?? null;

  if (!next) {
    return { level: current, next: null, progress: 1, xpToNext: null };
  }

  const progress = (xp - current.minXp) / (next.minXp - current.minXp);
  return { level: current, next, progress, xpToNext: next.minXp - xp };
}

// Color del anillo del avatar según el nivel real — escalada dentro de la
// paleta de marca, con azul/morado/rosa en los tramos altos y un acento
// dorado reservado solo para el nivel máximo.
const LEVEL_RING_CLASSES: Record<string, string> = {
  Arranque: "ring-zinc-300",
  "En marcha": "ring-zinc-400",
  Constante: "ring-brand-300",
  Consolidado: "ring-brand-400",
  Referencia: "ring-brand-500",
  Destacado: "ring-brand-600",
  "Sólido": "ring-sky-500",
  Avanzado: "ring-violet-500",
  Experto: "ring-rose-500",
  Líder: "ring-amber-400",
};

export function getLevelRingClass(levelName: string): string {
  return LEVEL_RING_CLASSES[levelName] ?? "ring-zinc-300";
}

// Mismo criterio de color que el anillo, en versión insignia (fondo suave +
// texto + punto), para que LevelBadge también escale visualmente por nivel.
const LEVEL_BADGE_CLASSES: Record<string, string> = {
  Arranque: "bg-zinc-100 text-zinc-700",
  "En marcha": "bg-zinc-100 text-zinc-800",
  Constante: "bg-brand-50 text-brand-600",
  Consolidado: "bg-brand-50 text-brand-700",
  Referencia: "bg-brand-100 text-brand-700",
  Destacado: "bg-brand-100 text-brand-800",
  "Sólido": "bg-sky-50 text-sky-700",
  Avanzado: "bg-violet-50 text-violet-700",
  Experto: "bg-rose-50 text-rose-700",
  Líder: "bg-amber-50 text-amber-700",
};

const LEVEL_DOT_CLASSES: Record<string, string> = {
  Arranque: "bg-zinc-400",
  "En marcha": "bg-zinc-500",
  Constante: "bg-brand-300",
  Consolidado: "bg-brand-400",
  Referencia: "bg-brand-500",
  Destacado: "bg-brand-600",
  "Sólido": "bg-sky-500",
  Avanzado: "bg-violet-500",
  Experto: "bg-rose-500",
  Líder: "bg-amber-500",
};

export function getLevelBadgeClasses(levelName: string): { badge: string; dot: string } {
  return {
    badge: LEVEL_BADGE_CLASSES[levelName] ?? "bg-brand-50 text-brand-700",
    dot: LEVEL_DOT_CLASSES[levelName] ?? "bg-brand-500",
  };
}
