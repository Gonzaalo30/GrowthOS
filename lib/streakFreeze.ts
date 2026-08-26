/** Comodines de racha disponibles al mes — ver `register_business_activity` en la migración 0028. */
export const MAX_STREAK_FREEZES_PER_MONTH = 2;

/**
 * Cuántos comodines quedan este mes. `streak_freeze_month`/`streak_freezes_used`
 * en la fila del negocio se actualizan de forma perezosa (solo al registrar
 * actividad real), así que aquí se recalcula para el mes actual en vez de
 * fiarse ciegamente del valor guardado si todavía no hubo actividad este mes.
 */
export function getStreakFreezesRemaining(streakFreezeMonth: string, streakFreezesUsed: number): number {
  const currentMonth = new Date().toISOString().slice(0, 7);
  const storedMonth = streakFreezeMonth.slice(0, 7);
  const used = storedMonth === currentMonth ? streakFreezesUsed : 0;
  return Math.max(0, MAX_STREAK_FREEZES_PER_MONTH - used);
}
