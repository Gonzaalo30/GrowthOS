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
import { createNotification } from "@/services/notification.service";

type Client = SupabaseClient<Database>;
type MissionRow = Database["public"]["Tables"]["missions"]["Row"];

function toInsertRow(
  businessId: string,
  type: "daily" | "weekly",
  m: MissionTemplate,
  sequenceNumber: number | null = null,
) {
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
    sequence_number: sequenceNumber,
  };
}

export async function getNextSequenceNumber(supabase: Client, businessId: string): Promise<number> {
  const { data, error } = await supabase
    .from("missions")
    .select("sequence_number")
    .eq("business_id", businessId)
    .eq("type", "daily")
    .order("sequence_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return (data?.sequence_number ?? 0) + 1;
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
    ...dailyMissions.map((m, i) => toInsertRow(businessId, "daily", m, i + 1)),
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
  dailyCap = 3,
) {
  const dailyMissions = existingMissions.filter((m) => m.type === "daily");
  const pendingCount = dailyMissions.filter((m) => !m.completed_at).length;
  const needed = dailyCap - pendingCount;
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

  const nextNumber = await getNextSequenceNumber(supabase, businessId);
  const rows = selection.map((m, i) => toInsertRow(businessId, "daily", m, nextNumber + i));
  const { error } = await supabase.from("missions").insert(rows);
  if (error) throw error;
}

/**
 * Nº de misiones completadas por día (fecha en formato YYYY-MM-DD, según la
 * hora del servidor) desde `sinceDate`. Base real para el calendario de
 * crecimiento — nunca inventamos actividad de días sin misiones completadas.
 */
export async function getDailyCompletionCounts(
  supabase: Client,
  businessId: string,
  sinceDate: Date,
): Promise<Map<string, number>> {
  const { data, error } = await supabase
    .from("missions")
    .select("completed_at")
    .eq("business_id", businessId)
    .not("completed_at", "is", null)
    .gte("completed_at", sinceDate.toISOString());

  if (error) throw error;

  const counts = new Map<string, number>();
  for (const row of data) {
    if (!row.completed_at) continue;
    const day = row.completed_at.slice(0, 10);
    counts.set(day, (counts.get(day) ?? 0) + 1);
  }
  return counts;
}

export async function getCompletedMissionsSince(supabase: Client, businessId: string, sinceDate: Date) {
  const { data, error } = await supabase
    .from("missions")
    .select("id, title, xp_reward, completed_at")
    .eq("business_id", businessId)
    .not("completed_at", "is", null)
    .gte("completed_at", sinceDate.toISOString())
    .order("completed_at", { ascending: true });

  if (error) throw error;
  return data;
}

/** Historial completo de misiones completadas, para el Audit Log — no solo lo reciente. */
export async function getAllCompletedMissions(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("missions")
    .select("id, title, xp_reward, type, completed_at")
    .eq("business_id", businessId)
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false });

  if (error) throw error;
  return data;
}

/**
 * Añade 1 Quick Win extra saltándose el tope de 3 pendientes — usado como
 * recompensa real del cofre diario. Reutiliza la misma regla de no repetir
 * una plantilla que ya esté pendiente ahora mismo.
 */
export async function addBonusDailyMission(
  supabase: Client,
  businessId: string,
  businessType: BusinessType,
  existingMissions: MissionRow[],
  options?: { selfReportOnly?: boolean },
) {
  const dailyMissions = existingMissions.filter((m) => m.type === "daily");
  const pendingTemplateIds = new Set(
    dailyMissions.filter((m) => !m.completed_at).map((m) => m.template_id).filter((id): id is string => !!id),
  );

  const candidates = DAILY_MISSION_TEMPLATES.filter(
    (t) =>
      (t.appliesTo === "all" || t.appliesTo.includes(businessType)) &&
      !pendingTemplateIds.has(t.id) &&
      (!options?.selfReportOnly || !t.auditTrigger),
  );
  if (candidates.length === 0) return null;

  const template = candidates[Math.floor(Math.random() * candidates.length)];
  const nextNumber = await getNextSequenceNumber(supabase, businessId);
  const row = toInsertRow(businessId, "daily", template, nextNumber);
  const { error } = await supabase.from("missions").insert(row);
  if (error) throw error;
  return template;
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

const STREAK_MULTIPLIER_THRESHOLD = 3;
const STREAK_MULTIPLIER = 2;

export interface CompleteMissionOutcome {
  xpAwarded: number;
  multiplierApplied: boolean;
}

/**
 * Si esta es la 3ª (o más) misión diaria completada hoy para este negocio,
 * duplica el XP de esta misión — recompensa real por rachas dentro del día,
 * no un multiplicador cosmético.
 */
export async function completeMission(supabase: Client, missionId: string): Promise<CompleteMissionOutcome | null> {
  const { data, error } = await supabase
    .from("missions")
    .update({ completed_at: new Date().toISOString() })
    .eq("id", missionId)
    .is("completed_at", null)
    .select("business_id, xp_reward, type")
    .maybeSingle();

  if (error) throw error;

  // Si no se actualizó ninguna fila, la misión ya estaba completada antes:
  // no volvemos a sumar XP ni a contar actividad (evita duplicar con dobles clics).
  if (!data) return null;

  let multiplierApplied = false;
  let xpAwarded = data.xp_reward;

  if (data.type === "daily") {
    const todayStart = new Date();
    todayStart.setUTCHours(0, 0, 0, 0);
    const { count, error: countError } = await supabase
      .from("missions")
      .select("id", { count: "exact", head: true })
      .eq("business_id", data.business_id)
      .eq("type", "daily")
      .not("completed_at", "is", null)
      .gte("completed_at", todayStart.toISOString());
    if (countError) throw countError;

    if ((count ?? 0) >= STREAK_MULTIPLIER_THRESHOLD) {
      multiplierApplied = true;
      xpAwarded = data.xp_reward * STREAK_MULTIPLIER;
    }
  }

  const { error: xpError } = await supabase.rpc("increment_business_xp", {
    p_business_id: data.business_id,
    p_amount: xpAwarded,
  });
  if (xpError) throw xpError;

  const { error: streakError } = await supabase.rpc("register_business_activity", {
    p_business_id: data.business_id,
  });
  if (streakError) throw streakError;

  const { data: updated } = await supabase
    .from("businesses")
    .select("streak_count")
    .eq("id", data.business_id)
    .maybeSingle();
  if (updated?.streak_count === 7 || updated?.streak_count === 30) {
    await createNotification(
      supabase,
      data.business_id,
      `🔥 ¡Racha de ${updated.streak_count} días! Sigue así.`,
    );
  }

  return { xpAwarded, multiplierApplied };
}
