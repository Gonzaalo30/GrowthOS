import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

export async function sendContactMessage(
  supabase: Client,
  data: { name: string; email: string; message: string; businessId: string | null },
) {
  const { error } = await supabase.from("contact_messages").insert({
    name: data.name,
    email: data.email,
    message: data.message,
    business_id: data.businessId,
  });
  if (error) throw error;
}
