export interface Level {
  name: string;
  minXp: number;
}

// Duolingo-style progression: cada nivel requiere más XP que el anterior.
// Nombres pensados para el negocio local real que usa GrowthOS (clínica,
// restaurante, taller...), no jerga de startups financiadas (nada de
// "Pre-Seed"/"Series A" — no es el idioma de quien lleva un negocio local).
export const LEVELS: Level[] = [
  { name: "Arranque", minXp: 0 },
  { name: "En marcha", minXp: 100 },
  { name: "Consolidado", minXp: 300 },
  { name: "Referencia", minXp: 700 },
  { name: "Líder", minXp: 1500 },
];

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

// Color del anillo del avatar según el nivel real — dentro de la paleta de
// marca (naranja), con un acento dorado solo para el nivel máximo.
const LEVEL_RING_CLASSES: Record<string, string> = {
  Arranque: "ring-zinc-300",
  "En marcha": "ring-brand-300",
  Consolidado: "ring-brand-500",
  Referencia: "ring-brand-600",
  Líder: "ring-amber-400",
};

export function getLevelRingClass(levelName: string): string {
  return LEVEL_RING_CLASSES[levelName] ?? "ring-zinc-300";
}
