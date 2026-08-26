import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getIntegration } from "@/services/googleIntegration.service";
import { getNextSequenceNumber } from "@/services/mission.service";
import { detectBestSignal } from "@/lib/googleSignalMissions";
import { canUseGoogleIntegrations } from "@/lib/plans";
import { createNotification } from "@/services/notification.service";
import type { SearchConsoleSummary, AnalyticsSummary } from "@/lib/googleApis";

type Client = SupabaseClient<Database>;
type MissionRow = Database["public"]["Tables"]["missions"]["Row"];

function todayDateStr(): string {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Añade, como mucho, 1 misión diaria basada en datos reales de Google
 * Search Console/Analytics — se queda especial en vez de copar el día.
 * Solo para negocios con plan Growth/Autopilot que ya tengan datos
 * sincronizados; nunca dispara una llamada a Google (usa el último snapshot
 * ya guardado, igual que el resto del dashboard).
 */
export async function ensureGoogleSignalMission(
  supabase: Client,
  businessId: string,
  plan: string,
  existingMissions: MissionRow[],
) {
  if (!canUseGoogleIntegrations(plan)) return;

  const today = todayDateStr();
  const alreadyHasSignalToday = existingMissions.some(
    (m) =>
      m.type === "daily" &&
      m.template_id?.endsWith(today) &&
      (m.template_id.startsWith("gsc-") || m.template_id.startsWith("ga4-")),
  );
  if (alreadyHasSignalToday) return;

  const integration = await getIntegration(supabase, businessId);
  if (!integration?.search_console_data && !integration?.analytics_data) return;

  const signal = detectBestSignal(
    (integration.search_console_data as unknown as SearchConsoleSummary | null) ?? null,
    (integration.analytics_data as unknown as AnalyticsSummary | null) ?? null,
    today,
  );
  if (!signal) return;

  const sequenceNumber = await getNextSequenceNumber(supabase, businessId);
  const { error } = await supabase.from("missions").insert({
    business_id: businessId,
    type: "daily",
    title: signal.title,
    description: signal.description,
    difficulty: "medium",
    time_estimate_minutes: signal.timeEstimateMinutes,
    xp_reward: signal.xpReward,
    expected_impact: signal.expectedImpact,
    template_id: signal.id,
    sequence_number: sequenceNumber,
  });
  if (error) throw error;

  await createNotification(supabase, businessId, `🔍 Nueva misión basada en tus datos reales de Google: ${signal.title}`);
}
