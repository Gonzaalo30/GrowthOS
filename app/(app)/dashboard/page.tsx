import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import { ensureDailyMissions, getMissionsForBusiness } from "@/services/mission.service";
import { refreshGrowthScoreIfStale, getLatestScoreBreakdown } from "@/services/audit.service";
import { DashboardView } from "@/features/dashboard/DashboardView";
import { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { BusinessType } from "@/lib/missionTemplates";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  let business = await getBusinessByOwner(supabase, user.id);
  if (!business) redirect("/onboarding");

  const scoreRefresh = await refreshGrowthScoreIfStale(supabase, business.id, business.domain);
  if (scoreRefresh.refreshed) {
    business = await getBusinessByOwner(supabase, user.id);
    if (!business) redirect("/onboarding");
  }

  let missions = await getMissionsForBusiness(supabase, business.id);

  if ((BUSINESS_TYPES as readonly string[]).includes(business.business_type)) {
    const businessType = business.business_type as BusinessType;
    await ensureDailyMissions(supabase, business.id, businessType, new Set(), missions);
    missions = await getMissionsForBusiness(supabase, business.id);
  }

  const scoreBreakdown = await getLatestScoreBreakdown(supabase, business.id);
  const profile = await getProfile(supabase, user.id);

  return (
    <DashboardView
      business={business}
      missions={missions}
      scoreRefresh={scoreRefresh}
      scoreBreakdown={scoreBreakdown}
      profileName={profile.name}
    />
  );
}
