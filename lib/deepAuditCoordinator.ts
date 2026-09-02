import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { growthPotentialLabel, type QuickAuditCheck } from "@/lib/quickAudit";
import { createNotification } from "@/services/notification.service";

type Client = SupabaseClient<Database>;

export const DEEP_AUDIT_STEPS = ["pages", "pagespeed-mobile", "pagespeed-desktop", "responsive"] as const;
export type DeepAuditStep = (typeof DEEP_AUDIT_STEPS)[number];

/** Si un análisis lleva "analizando" más de esto, se considera atascado (petición perdida, función caída a mitad) y se deja retomar. */
export const STALE_ANALYZING_MINUTES = 15;

export function isAnalyzingStale(analyzingSince: string | null): boolean {
  if (!analyzingSince) return false;
  const minutesSince = (Date.now() - new Date(analyzingSince).getTime()) / (1000 * 60);
  return minutesSince > STALE_ANALYZING_MINUTES;
}

/**
 * Marca el negocio como "analizando" y limpia cualquier resto de una tanda
 * anterior — se llama justo antes de disparar los 4 pasos en paralelo.
 */
export async function startDeepAudit(supabase: Client, businessId: string) {
  const { error } = await supabase
    .from("businesses")
    .update({
      growth_score_status: "analyzing",
      growth_score_analyzing_since: new Date().toISOString(),
      growth_score_pending: [],
      growth_score_pending_steps: [],
    })
    .eq("id", businessId);
  if (error) throw error;
}

/**
 * Cada paso de la auditoría profunda llama a esto al terminar su parte
 * (aunque no haya podido aportar ninguna comprobación real). Sin cola
 * externa — coordinación simple por columnas en `businesses`, pensada para
 * caber en el límite de 60s por función de Vercel Hobby: cada paso es su
 * propia función, disparada en paralelo con las otras 3 (ver
 * `lib/deepAuditTrigger.ts`). El que ve que ya han llegado los 4 pasos
 * esperados es el que finaliza de verdad: calcula el score final, lo mueve
 * al historial real, y notifica.
 */
export async function reportDeepAuditStep(
  supabase: Client,
  businessId: string,
  step: DeepAuditStep,
  checks: QuickAuditCheck[],
) {
  const { data: business, error } = await supabase
    .from("businesses")
    .select("growth_score, growth_score_pending, growth_score_pending_steps")
    .eq("id", businessId)
    .single();
  if (error) throw error;

  const alreadyDone = new Set(business.growth_score_pending_steps ?? []);
  // Reintento del mismo paso (ej. un timeout que igualmente llegó a terminar):
  // no se duplican sus comprobaciones.
  const previousChecks = Array.isArray(business.growth_score_pending)
    ? (business.growth_score_pending as unknown as QuickAuditCheck[])
    : [];
  const merged = alreadyDone.has(step) ? previousChecks : [...previousChecks, ...checks];
  alreadyDone.add(step);

  const allStepsDone = DEEP_AUDIT_STEPS.every((s) => alreadyDone.has(s));

  if (!allStepsDone) {
    const { error: updateError } = await supabase
      .from("businesses")
      .update({
        growth_score_pending: merged as unknown as never,
        growth_score_pending_steps: [...alreadyDone],
      })
      .eq("id", businessId);
    if (updateError) throw updateError;
    return;
  }

  // Los 4 pasos han llegado (con o sin comprobaciones reales cada uno): se
  // finaliza de verdad. Si por lo que sea no hay ninguna comprobación (los 4
  // pasos fallaron), no se toca el score anterior — mejor mantener el último
  // dato real que sustituirlo por un 0 que no significa nada.
  const previousScore = business.growth_score;
  const finalScore =
    merged.length > 0 ? Math.round((merged.filter((c) => c.passed).length / merged.length) * 100) : previousScore;

  const { error: finalizeError } = await supabase
    .from("businesses")
    .update({
      growth_score: finalScore,
      growth_potential: growthPotentialLabel(finalScore),
      growth_score_status: "idle",
      growth_score_pending: null,
      growth_score_pending_steps: [],
      growth_score_analyzing_since: null,
    })
    .eq("id", businessId);
  if (finalizeError) throw finalizeError;

  if (merged.length > 0) {
    const { error: historyError } = await supabase
      .from("growth_score_history")
      .insert({ business_id: businessId, score: finalScore, checks: merged as unknown as never });
    if (historyError) throw historyError;
  }

  if (finalScore > previousScore) {
    await createNotification(
      supabase,
      businessId,
      `🎉 Terminamos de analizar tu web a fondo — tu Growth Score subió de ${previousScore} a ${finalScore}.`,
    );
  } else {
    await createNotification(
      supabase,
      businessId,
      `✅ Terminamos de analizar tu web a fondo. Tu Growth Score es ${finalScore}.`,
    );
  }
}
