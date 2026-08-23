export interface BriefMission {
  id: string;
  title: string;
  xpReward: number;
  isWeekly: boolean;
}

export interface WeeklyBrief {
  xpLastWeek: number;
  missions: BriefMission[];
}

interface MissionLike {
  id: string;
  title: string;
  type: string;
  xp_reward: number;
  sequence_number: number | null;
  completed_at: string | null;
}

/**
 * XP real ganada en los últimos 7 días (suma de xp_reward de lo completado —
 * no cuenta el multiplicador ×2 puntual, que no se guarda por misión) y las
 * hasta 3 misiones pendientes que más importan: la semanal primero (ya es la
 * de mayor impacto por diseño), luego las diarias pendientes en el mismo
 * orden de prioridad con el que se asignaron.
 */
export function computeWeeklyBrief(missions: MissionLike[], referenceDate: Date = new Date()): WeeklyBrief {
  const sevenDaysAgo = new Date(referenceDate);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  const cutoff = sevenDaysAgo.toISOString();

  const xpLastWeek = missions
    .filter((m) => m.completed_at !== null && m.completed_at >= cutoff)
    .reduce((sum, m) => sum + m.xp_reward, 0);

  const pendingWeekly = missions.filter((m) => m.type === "weekly" && !m.completed_at);
  const pendingDaily = missions
    .filter((m) => m.type === "daily" && !m.completed_at)
    .sort((a, b) => (a.sequence_number ?? 0) - (b.sequence_number ?? 0));

  const missionsList: BriefMission[] = [...pendingWeekly, ...pendingDaily]
    .slice(0, 3)
    .map((m) => ({ id: m.id, title: m.title, xpReward: m.xp_reward, isWeekly: m.type === "weekly" }));

  return { xpLastWeek, missions: missionsList };
}
