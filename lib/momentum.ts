export interface MomentumResult {
  /** 0-100 */
  score: number;
  completed: number;
  available: number;
}

interface MissionLike {
  type: string;
  created_at: string;
  completed_at: string | null;
}

/**
 * Momentum Score: qué porcentaje de los Quick Wins que ha tenido disponibles
 * en los últimos 7 días ha completado de verdad. "Disponible esta semana" =
 * se le asignó esta semana, o se completó esta semana aunque se asignara
 * antes (si lo completó, estaba disponible). Mide ritmo reciente real, no
 * solo si sigue la racha de días seguidos (que ya se muestra aparte).
 */
export function computeMomentumScore(
  missions: MissionLike[],
  referenceDate: Date = new Date(),
): MomentumResult | null {
  const sevenDaysAgo = new Date(referenceDate);
  sevenDaysAgo.setUTCDate(sevenDaysAgo.getUTCDate() - 7);
  const cutoff = sevenDaysAgo.toISOString();

  const availableThisWeek = missions.filter(
    (m) => m.type === "daily" && (m.created_at >= cutoff || (m.completed_at !== null && m.completed_at >= cutoff)),
  );
  if (availableThisWeek.length === 0) return null;

  const completedThisWeek = availableThisWeek.filter((m) => m.completed_at !== null && m.completed_at >= cutoff);

  return {
    score: Math.round((completedThisWeek.length / availableThisWeek.length) * 100),
    completed: completedThisWeek.length,
    available: availableThisWeek.length,
  };
}
