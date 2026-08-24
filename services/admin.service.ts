import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getWeeklyAdminCompletionCount } from "@/services/mission.service";

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
}

const WEEKLY_ADMIN_LIMIT = 4;

export { WEEKLY_ADMIN_LIMIT };

/** Solo para la herramienta interna del fundador: clientes Autopilot activos con sus misiones pendientes reales. */
export async function getAutopilotBusinessesOverview(supabase: Client): Promise<AutopilotBusinessOverview[]> {
  const { data: businesses, error } = await supabase
    .from("businesses")
    .select("id, domain, owner_id")
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
    });
  }
  return overviews;
}
