import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { runQuickAudit, growthPotentialLabel } from "@/lib/quickAudit";

type Client = SupabaseClient<Database>;

const REFRESH_INTERVAL_DAYS = 7;

export interface GrowthScoreRefreshResult {
  refreshed: boolean;
  previousScore: number | null;
  currentScore: number;
}

export async function recordGrowthScoreBaseline(supabase: Client, businessId: string, score: number) {
  const { error } = await supabase.from("growth_score_history").insert({ business_id: businessId, score });
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

  const audit = await runQuickAudit(domain);
  if (audit.unreachable) {
    // No penalizamos ni actualizamos si el dominio no respondió esta vez.
    return { refreshed: false, previousScore: null, currentScore: currentScoreFallback };
  }

  const { error: updateError } = await supabase
    .from("businesses")
    .update({ growth_score: audit.score, growth_potential: growthPotentialLabel(audit.score) })
    .eq("id", businessId);
  if (updateError) throw updateError;

  const { error: insertError } = await supabase
    .from("growth_score_history")
    .insert({ business_id: businessId, score: audit.score });
  if (insertError) throw insertError;

  return {
    refreshed: true,
    previousScore: last?.score ?? null,
    currentScore: audit.score,
  };
}
