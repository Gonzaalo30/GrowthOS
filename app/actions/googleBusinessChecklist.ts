"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { canUseGoogleIntegrations } from "@/lib/plans";
import { saveChecklist } from "@/services/googleBusinessChecklist.service";
import { ensureGoogleBusinessMissions } from "@/services/googleBusinessMission.service";
import { getMissionsForBusiness } from "@/services/mission.service";

export interface GoogleBusinessChecklistState {
  error?: string;
  success?: boolean;
}

export async function saveGoogleBusinessChecklistAction(
  _prevState: GoogleBusinessChecklistState,
  formData: FormData,
): Promise<GoogleBusinessChecklistState> {
  const profileUrl = String(formData.get("profileUrl") ?? "").trim();
  if (!profileUrl) {
    return { error: "Pega la URL de tu ficha de Google Business." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");
  if (!canUseGoogleIntegrations(business.plan)) redirect("/precios");

  try {
    const checklist = await saveChecklist(supabase, business.id, {
      profileUrl,
      hasCompleteHours: formData.get("hasCompleteHours") === "on",
      hasEnoughPhotos: formData.get("hasEnoughPhotos") === "on",
      hasCorrectCategory: formData.get("hasCorrectCategory") === "on",
      hasContactInfo: formData.get("hasContactInfo") === "on",
      respondsToReviews: formData.get("respondsToReviews") === "on",
    });

    const existingMissions = await getMissionsForBusiness(supabase, business.id);
    await ensureGoogleBusinessMissions(supabase, business.id, checklist, existingMissions);
  } catch {
    return { error: "No hemos podido guardar tu checklist. Inténtalo de nuevo en un momento." };
  }

  redirect("/integraciones");
}
