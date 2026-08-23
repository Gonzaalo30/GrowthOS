import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function getProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
  if (error) throw error;
  return data;
}

export async function updateProfileName(supabase: Client, userId: string, name: string, title: string | null) {
  const { error } = await supabase.from("profiles").update({ name, title }).eq("id", userId);
  if (error) throw error;
}

export async function updateAvatarUrl(supabase: Client, userId: string, avatarUrl: string | null) {
  const { error } = await supabase.from("profiles").update({ avatar_url: avatarUrl }).eq("id", userId);
  if (error) throw error;
}

export async function updateDateFormat(
  supabase: Client,
  userId: string,
  dateFormat: Database["public"]["Tables"]["profiles"]["Row"]["date_format"],
) {
  const { error } = await supabase.from("profiles").update({ date_format: dateFormat }).eq("id", userId);
  if (error) throw error;
}
