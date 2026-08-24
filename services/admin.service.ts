import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getWeeklyAdminCompletionCount } from "@/services/mission.service";
import { getLevelNumber, LEVELS } from "@/lib/levels";

type Client = SupabaseClient<Database>;
type Mission = Database["public"]["Tables"]["missions"]["Row"];

export interface AutopilotBusinessOverview {
  businessId: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  pendingDailyMissions: Mission[];
  pendingWeeklyMission: Mission | null;
  weeklyAdminCompletions: number;
  /** Nivel máximo (nivel 10, "Líder") — beneficio real: se le prioriza aquí con tu tiempo limitado. */
  isTopLevel: boolean;
}

const WEEKLY_ADMIN_LIMIT = 4;

export { WEEKLY_ADMIN_LIMIT };

/** Solo para la herramienta interna del fundador: clientes Autopilot activos con sus misiones pendientes reales. */
export async function getAutopilotBusinessesOverview(supabase: Client): Promise<AutopilotBusinessOverview[]> {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, domain, owner_id, xp")
    .eq("plan", "autopilot")
    .eq("subscription_status", "active")
    .order("created_at", { ascending: true });
  if (error) throw error;
  if (businesses.length === 0) return [];

  const overviews: AutopilotBusinessOverview[] = [];
  for (const business of businesses) {
    const [{ data: profile }, { data: missions, error: missionsError }, weeklyAdminCompletions] = await Promise.all([
      supabase.from("profiles").select("name, email").eq("id", business.owner_id).maybeSingle(),
      supabase
        .from("missions")
        .select("*")
        .eq("business_id", business.id)
        .is("completed_at", null)
        .order("created_at", { ascending: true }),
      getWeeklyAdminCompletionCount(supabase, business.id),
    ]);
    if (missionsError) throw missionsError;

    overviews.push({
      businessId: business.id,
      domain: business.domain,
      ownerName: profile?.name ?? "—",
      ownerEmail: profile?.email ?? "—",
      pendingDailyMissions: (missions ?? []).filter((m) => m.type === "daily"),
      pendingWeeklyMission: (missions ?? []).find((m) => m.type === "weekly") ?? null,
      weeklyAdminCompletions,
      isTopLevel: getLevelNumber(business.xp) >= LEVELS.length,
    });
  }
  // Los clientes de nivel máximo se priorizan primero — es el beneficio real
  // de llegar al nivel 10 en Autopilot: se les atiende antes con tu tiempo limitado.
  overviews.sort((a, b) => Number(b.isTopLevel) - Number(a.isTopLevel));
  return overviews;
}
