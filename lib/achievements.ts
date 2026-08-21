import { LEVELS } from "@/lib/levels";

export interface Achievement {
  id: string;
  emoji: string;
  title: string;
  description: string;
  unlocked: boolean;
}

export interface AchievementInput {
  xp: number;
  longestStreak: number;
  hasCompletedDaily: boolean;
  hasCompletedWeekly: boolean;
  chestsOpened: number;
  opportunityRequests: number;
  scoreImproved: boolean;
}

/**
 * Todos los logros se derivan de datos que ya guardamos de verdad — nada se
 * marca como conseguido sin un hecho real detrás.
 */
export function computeAchievements(input: AchievementInput): Achievement[] {
  const levelAchievements: Achievement[] = LEVELS.filter((l) => l.minXp > 0).map((l) => ({
    id: `level-${l.name.toLowerCase().replace(/\s+/g, "-")}`,
    emoji: "🚀",
    title: `Nivel ${l.name}`,
    description: `Consigue ${l.minXp} XP.`,
    unlocked: input.xp >= l.minXp,
  }));

  return [
    {
      id: "first-quick-win",
      emoji: "🎯",
      title: "Primer Quick Win",
      description: "Completa tu primera misión diaria.",
      unlocked: input.hasCompletedDaily,
    },
    {
      id: "first-weekly",
      emoji: "⭐",
      title: "Primera misión semanal",
      description: "Completa tu primera misión semanal.",
      unlocked: input.hasCompletedWeekly,
    },
    {
      id: "streak-7",
      emoji: "🔥",
      title: "Racha de 7 días",
      description: "Alcanza 7 días seguidos de actividad.",
      unlocked: input.longestStreak >= 7,
    },
    {
      id: "streak-30",
      emoji: "🏆",
      title: "Racha de 30 días",
      description: "Alcanza 30 días seguidos de actividad.",
      unlocked: input.longestStreak >= 30,
    },
    ...levelAchievements,
    {
      id: "score-improved",
      emoji: "📈",
      title: "Growth Score en subida",
      description: "Mejora tu Growth Score respecto a tu primer análisis.",
      unlocked: input.scoreImproved,
    },
    {
      id: "chest-5",
      emoji: "🎁",
      title: "Cazador de cofres",
      description: "Abre 5 cofres diarios.",
      unlocked: input.chestsOpened >= 5,
    },
    {
      id: "first-opportunity",
      emoji: "🛒",
      title: "Primera mejora solicitada",
      description: "Solicita tu primera mejora del Centro de Mejoras.",
      unlocked: input.opportunityRequests >= 1,
    },
  ];
}
