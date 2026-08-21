import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { runQuickAudit, growthPotentialLabel, type QuickAuditCheck } from "@/lib/quickAudit";
import { createNotification } from "@/services/notification.service";

type Client = SupabaseClient<Database>;

const REFRESH_INTERVAL_DAYS = 7;

export interface GrowthScoreRefreshResult {
  refreshed: boolean;
  previousScore: number | null;
  currentScore: number;
}

export async function recordGrowthScoreBaseline(
  supabase: Client,
  businessId: string,
  score: number,
  checks: QuickAuditCheck[],
) {
  const { error } = await supabase
    .from("growth_score_history")
    .insert({ business_id: businessId, score, checks });
  if (error) throw error;
}

/**
 * Si han pasado 7+ días desde el último análisis guardado, vuelve a analizar el
 * dominio y actualiza el Growth Score. Si no, no hace nada (evita golpear el
 * dominio del negocio en cada visita al dashboard).
 */
export async function refreshGrowthScoreIfStale(
  supabase: Client,
  businessId: string,
  domain: string,
): Promise<GrowthScoreRefreshResult> {
  const { data: history, error } = await supabase
    .from("growth_score_history")
    .select("score, recorded_at")
    .eq("business_id", businessId)
    .order("recorded_at", { ascending: false })
    .limit(1);

  if (error) throw error;

  const last = history?.[0];
  const currentScoreFallback = last?.score ?? 0;

  if (last) {
    const daysSinceLast = (Date.now() - new Date(last.recorded_at).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSinceLast < REFRESH_INTERVAL_DAYS) {
      return { refreshed: false, previousScore: null, currentScore: currentScoreFallback };
    }
  }

  return runAndPersistAudit(supabase, businessId, domain, last?.score ?? null, currentScoreFallback);
}

/**
 * Reanaliza ya, sin esperar el ciclo de 7 días — reservado a planes de pago
 * (Growth/Autopilot). Es el mismo análisis real, solo que el usuario decide
 * cuándo, en vez de esperar al ciclo automático.
 */
export async function forceRefreshGrowthScore(
  supabase: Client,
  businessId: string,
  domain: string,
): Promise<GrowthScoreRefreshResult> {
  const { data: history, error } = await supabase
    .from("growth_score_history")
    .select("score, recorded_at")
    .eq("business_id", businessId)
    .order("recorded_at", { ascending: false })
    .limit(1);
  if (error) throw error;

  const last = history?.[0];
  return runAndPersistAudit(supabase, businessId, domain, last?.score ?? null, last?.score ?? 0);
}

async function runAndPersistAudit(
  supabase: Client,
  businessId: string,
  domain: string,
  previousScore: number | null,
  fallbackScore: number,
): Promise<GrowthScoreRefreshResult> {
  const audit = await runQuickAudit(domain);
  if (audit.unreachable) {
    // No penalizamos ni actualizamos si el dominio no respondió esta vez.
    return { refreshed: false, previousScore: null, currentScore: fallbackScore };
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ growth_score: audit.score, growth_potential: growthPotentialLabel(audit.score) })
    .eq("id", businessId);
  if (updateError) throw updateError;

  const { error: insertError } = await supabase
    .from("growth_score_history")
    .insert({ business_id: businessId, score: audit.score, checks: audit.checks });
  if (insertError) throw insertError;

  if (previousScore !== null && audit.score > previousScore) {
    await createNotification(
      supabase,
      businessId,
      `🎉 Tu Growth Score subió de ${previousScore} a ${audit.score}.`,
    );
  }

  return {
    refreshed: true,
    previousScore,
    currentScore: audit.score,
  };
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
