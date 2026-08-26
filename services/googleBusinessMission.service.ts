import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getNextSequenceNumber } from "@/services/mission.service";
import { GOOGLE_BUSINESS_CHECKLIST } from "@/lib/googleBusinessChecklist";
import { createNotification } from "@/services/notification.service";

type Client = SupabaseClient<Database>;
type MissionRow = Database["public"]["Tables"]["missions"]["Row"];
type Checklist = Database["public"]["Tables"]["google_business_checklists"]["Row"];

/**
 * Por cada "no" real del checklist de la ficha de Google Business, crea una
 * misión diaria si todavía no existe una para ese ítem (con o sin completar
 * — es un hueco de una sola vez, no se repite cada día como las señales de
 * Search Console/Analytics).
 */
export async function ensureGoogleBusinessMissions(
  supabase: Client,
  businessId: string,
  checklist: Checklist,
  existingMissions: MissionRow[],
) {
  const existingTemplateIds = new Set(existingMissions.map((m) => m.template_id).filter(Boolean));
  let createdCount = 0;

  for (const item of GOOGLE_BUSINESS_CHECKLIST) {
    if (checklist[item.field]) continue;
    if (existingTemplateIds.has(item.id)) continue;

    const sequenceNumber = await getNextSequenceNumber(supabase, businessId);
    const { error } = await supabase.from("missions").insert({
      business_id: businessId,
      type: "daily",
      title: item.missionTitle,
      description: item.missionDescription,
      difficulty: "easy",
      time_estimate_minutes: item.timeEstimateMinutes,
      xp_reward: item.xpReward,
      expected_impact: "Ficha de Google Business más completa y con más confianza para quien la ve",
      template_id: item.id,
      sequence_number: sequenceNumber,
    });
    if (error) throw error;
    createdCount += 1;
  }

  if (createdCount > 0) {
    await createNotification(
      supabase,
      businessId,
      `🏪 ${createdCount} ${createdCount === 1 ? "misión nueva" : "misiones nuevas"} para mejorar tu ficha de Google Business.`,
    );
  }
}
