import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import type { QuickAuditCheck } from "@/lib/quickAudit";
import { triggerDeepAudit } from "@/lib/deepAuditTrigger";
import { isAnalyzingStale } from "@/lib/deepAuditCoordinator";

type Client = SupabaseClient<Database>;
type BusinessRow = Database["public"]["Tables"]["businesses"]["Row"];

const REFRESH_INTERVAL_DAYS = 7;

export interface GrowthScoreRefreshResult {
  /** true si esta visita acaba de disparar una auditoría profunda nueva — no si ya ha terminado, eso llega por notificación. */
  triggered: boolean;
}

export async function recordGrowthScoreBaseline(
  supabase: Client,
  businessId: string,
  score: number,
  checks: QuickAuditCheck[],
) {
  const { error } = await supabase
    .from("growth_score_history")
    .insert({ business_id: businessId, score, checks: checks as unknown as never });
  if (error) throw error;
}

/**
 * Si han pasado 7+ días desde el último análisis guardado (o el anterior
 * quedó atascado, ver `isAnalyzingStale`), dispara una auditoría profunda
 * real en segundo plano — nunca ejecuta el análisis dentro de esta llamada,
 * así que nunca bloquea la carga del dashboard. El resultado final (score
 * actualizado, con las comprobaciones multi-página, PageSpeed y responsive
 * reales) llega vía notificación cuando termina — ver
 * `lib/deepAuditCoordinator.ts`.
 */
export async function refreshGrowthScoreIfStale(
  supabase: Client,
  business: Pick<BusinessRow, "id" | "domain" | "growth_score_status" | "growth_score_analyzing_since">,
): Promise<GrowthScoreRefreshResult> {
  const alreadyAnalyzing =
    business.growth_score_status === "analyzing" && !isAnalyzingStale(business.growth_score_analyzing_since);
  if (alreadyAnalyzing) {
    return { triggered: false };
  }

  const { data: history, error } = await supabase
    .from("growth_score_history")
    .select("recorded_at")
    .eq("business_id", business.id)
    .order("recorded_at", { ascending: false })
    .limit(1);
  if (error) throw error;

  const last = history?.[0];
  if (last) {
    const daysSinceLast = (Date.now() - new Date(last.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast < REFRESH_INTERVAL_DAYS) {
      return { triggered: false };
    }
  }

  await triggerDeepAudit(supabase, business.id, business.domain);
  return { triggered: true };
}

/**
 * Reanaliza ya, sin esperar el ciclo de 7 días — reservado a planes de pago
 * (Growth/Autopilot). Es la misma auditoría profunda real, solo que el
 * usuario decide cuándo en vez de esperar al ciclo automático.
 */
export async function forceRefreshGrowthScore(
  supabase: Client,
  business: Pick<BusinessRow, "id" | "domain">,
): Promise<GrowthScoreRefreshResult> {
  await triggerDeepAudit(supabase, business.id, business.domain);
  return { triggered: true };
}

export interface GrowthScorePoint {
  score: number;
  recordedAt: string;
}

/** Historial completo (primero -> último) para el "Growth Replay" antes/después. */
export async function getGrowthScoreTimeline(
  supabase: Client,
  businessId: string,
): Promise<GrowthScorePoint[]> {
  const { data, error } = await supabase
    .from("growth_score_history")
    .select("score, recorded_at")
    .eq("business_id", businessId)
    .order("recorded_at", { ascending: true });

  if (error) throw error;
  return data.map((row) => ({ score: row.score, recordedAt: row.recorded_at }));
}

export async function getLatestScoreBreakdown(
  supabase: Client,
  businessId: string,
): Promise<QuickAuditCheck[] | null> {
  const { data, error } = await supabase
    .from("growth_score_history")
    .select("checks")
    .eq("business_id", businessId)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  if (!data?.checks) return null;
  return data.checks as QuickAuditCheck[];
}
