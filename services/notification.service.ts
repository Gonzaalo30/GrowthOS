import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function createNotification(supabase: Client, businessId: string, message: string) {
  try {
    await supabase.from("notifications").insert({ business_id: businessId, message });
  } catch {
    // una notificación que falla no debe romper la acción real que la disparó
  }
}

export async function getUnreadNotifications(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("business_id", businessId)
    .is("read_at", null)
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) throw error;
  return data;
}

export async function markAllNotificationsRead(supabase: Client, businessId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("business_id", businessId)
    .is("read_at", null);
  if (error) throw error;
}
