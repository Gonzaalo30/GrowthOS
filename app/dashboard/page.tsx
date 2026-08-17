import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getMissionsForBusiness } from "@/services/mission.service";
import { DashboardView } from "@/features/dashboard/DashboardView";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) redirect("/onboarding");

  const missions = await getMissionsForBusiness(supabase, business.id);

  return <DashboardView business={business} missions={missions} />;
}
