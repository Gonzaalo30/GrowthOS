export interface Level {
  name: string;
  minXp: number;
}

// Duolingo-style progression: cada nivel requiere más XP que el anterior.
export const LEVELS: Level[] = [
  { name: "Starter", minXp: 0 },
  { name: "Explorer", minXp: 100 },
  { name: "Optimizer", minXp: 300 },
  { name: "Growth Pro", minXp: 700 },
  { name: "Scale", minXp: 1500 },
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
