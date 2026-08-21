import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import {
  DAILY_MISSION_TEMPLATES,
  selectDailyMissions,
  selectWeeklyMission,
  type BusinessType,
  type MissionTemplate,
} from "@/lib/missionTemplates";
import type { QuickAuditResult } from "@/lib/quickAudit";

type Client = SupabaseClient<Database>;
type MissionRow = Database["public"]["Tables"]["missions"]["Row"];

function toInsertRow(businessId: string, type: "daily" | "weekly", m: MissionTemplate) {
  return {
    business_id: businessId,
    type,
    title: m.title,
    description: m.description,
    difficulty: m.difficulty,
    time_estimate_minutes: m.timeEstimateMinutes,
    xp_reward: m.xpReward,
    expected_impact: m.expectedImpact,
    template_id: m.id,
  };
}

export async function seedMissionsForBusiness(
  supabase: Client,
  businessId: string,
  businessType: BusinessType,
  audit: QuickAuditResult,
) {
  const failedChecks = new Set(audit.checks.filter((c) => !c.passed).map((c) => c.id));
  const dailyMissions = selectDailyMissions(businessType, failedChecks);
  const weeklyMission = selectWeeklyMission(businessType, failedChecks);

  const rows = [
    ...dailyMissions.map((m) => toInsertRow(businessId, "daily", m)),
    toInsertRow(businessId, "weekly", weeklyMission),
  ];

  const { error } = await supabase.from("missions").insert(rows);
  if (error) throw error;
}

/**
 * Completa el hueco hasta 3 misiones diarias pendientes, eligiendo primero
 * plantillas que ese negocio nunca ha recibido (rotación sin repetir). Si se
 * agota la variedad disponible, repite empezando por las asignadas hace más
 * tiempo en vez de dejar al negocio sin misiones.
 */
export async function ensureDailyMissions(
  supabase: Client,
  businessId: string,
  businessType: BusinessType,
  failedChecks: Set<string>,
  existingMissions: MissionRow[],
) {
  const dailyMissions = existingMissions.filter((m) => m.type === "daily");
  const pendingCount = dailyMissions.filter((m) => !m.completed_at).length;
  const needed = 3 - pendingCount;
  if (needed <= 0) return;

  const usedTemplateIds = new Set(dailyMissions.map((m) => m.template_id).filter((id): id is string => !!id));
  // Nunca reasignar una plantilla que ya tiene una misión activa (sin completar) ahora
  // mismo: eso crearía una tarjeta duplicada de una misión que el usuario aún no ha hecho.
  const pendingTemplateIds = new Set(
    dailyMissions.filter((m) => !m.completed_at).map((m) => m.template_id).filter((id): id is string => !!id),
  );

  const applicable = DAILY_MISSION_TEMPLATES.filter(
    (t) => t.appliesTo === "all" || t.appliesTo.includes(businessType),
  );
  const notCurrentlyActive = applicable.filter((t) => !pendingTemplateIds.has(t.id));

  const fresh = selectDailyMissions(businessType, failedChecks, applicable.length).filter(
    (t) => !usedTemplateIds.has(t.id) && !pendingTemplateIds.has(t.id),
  );

  let selection = fresh.slice(0, needed);

  if (selection.length < needed) {
    // Se acabó la variedad: repetimos plantillas ya completadas antes, priorizando
    // las asignadas hace más tiempo (nunca una que siga pendiente ahora mismo).
    const lastAssignedAt = new Map<string, string>();
    for (const m of dailyMissions) {
      if (m.template_id && (!lastAssignedAt.has(m.template_id) || m.created_at > lastAssignedAt.get(m.template_id)!)) {
        lastAssignedAt.set(m.template_id, m.created_at);
      }
    }
    const selectedIds = new Set(selection.map((t) => t.id));
    const repeats = notCurrentlyActive
      .filter((t) => !selectedIds.has(t.id))
      .sort((a, b) => (lastAssignedAt.get(a.id) ?? "").localeCompare(lastAssignedAt.get(b.id) ?? ""));
    selection = [...selection, ...repeats.slice(0, needed - selection.length)];
  }

  if (selection.length === 0) return;

  const rows = selection.map((m) => toInsertRow(businessId, "daily", m));
  const { error } = await supabase.from("missions").insert(rows);
  if (error) throw error;
}

export async function getMissionsForBusiness(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("missions")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}

export async function getMissionById(supabase: Client, missionId: string) {
  const { data, error } = await supabase.from("missions").select("*").eq("id", missionId).single();
  if (error) throw error;
  return data;
}

export async function completeMission(supabase: Client, missionId: string) {
  const { data, error } = await supabase
    .from("missions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", missionId)
    .is("completed_at", null)
    .select("business_id, xp_reward")
    .maybeSingle();

  if (error) throw error;

  // Si no se actualizó ninguna fila, la misión ya estaba completada antes:
  // no volvemos a sumar XP ni a contar actividad (evita duplicar con dobles clics).
  if (!data) return;

  const { error: xpError } = await supabase.rpc("increment_business_xp", {
    p_business_id: data.business_id,
    p_amount: data.xp_reward,
  });
  if (xpError) throw xpError;

  const { error: streakError } = await supabase.rpc("register_business_activity", {
    p_business_id: data.business_id,
  });
  if (streakError) throw streakError;
}
