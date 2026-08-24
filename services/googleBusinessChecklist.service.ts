import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function getChecklist(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("google_business_checklists")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export interface ChecklistAnswers {
  profileUrl: string;
  hasCompleteHours: boolean;
  hasEnoughPhotos: boolean;
  hasCorrectCategory: boolean;
  hasContactInfo: boolean;
  respondsToReviews: boolean;
}

export async function saveChecklist(supabase: Client, businessId: string, answers: ChecklistAnswers) {
  const { data, error } = await supabase
    .from("google_business_checklists")
    .upsert(
      {
        business_id: businessId,
        profile_url: answers.profileUrl,
        has_complete_hours: answers.hasCompleteHours,
        has_enough_photos: answers.hasEnoughPhotos,
        has_correct_category: answers.hasCorrectCategory,
        has_contact_info: answers.hasContactInfo,
        responds_to_reviews: answers.respondsToReviews,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
