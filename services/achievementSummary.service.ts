import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { getMissionsForBusiness } from "@/services/mission.service";
import { countChestsOpened } from "@/services/chest.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { getGrowthScoreTimeline } from "@/services/audit.service";
import { computeAchievements, type Achievement } from "@/lib/achievements";

type Client = SupabaseClient<Database>;
type Business = Database["public"]["Tables"]["businesses"]["Row"];

/**
 * Mismo cálculo real de logros que ya se usa en el dashboard, para poder
 * mostrarlos también en el perfil sin duplicar la lógica. Si algo falla al
 * leer los datos, se devuelve una lista vacía en vez de romper la página.
 */
export async function getAchievementsForBusiness(supabase: Client, business: Business): Promise<Achievement[]> {
  try {
    const [missions, chestsOpened, requests, scoreTimeline] = await Promise.all([
      getMissionsForBusiness(supabase, business.id),
      countChestsOpened(supabase, business.id),
      getRequestsForBusiness(supabase, business.id),
      getGrowthScoreTimeline(supabase, business.id),
    ]);
    return computeAchievements({
      xp: business.xp,
      longestStreak: business.longest_streak,
      hasCompletedDaily: missions.some((m) => m.type === "daily" && m.completed_at !== null),
      hasCompletedWeekly: missions.some((m) => m.type === "weekly" && m.completed_at !== null),
      chestsOpened,
      opportunityRequests: requests.length,
      scoreImproved:
        scoreTimeline.length >= 2 && scoreTimeline[scoreTimeline.length - 1].score > scoreTimeline[0].score,
      purchaseCount: business.plan_purchase_count + requests.length,
    });
  } catch {
    return [];
  }
}
