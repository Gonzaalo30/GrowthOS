"use server";

import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { markAllNotificationsRead } from "@/services/notification.service";

export async function markNotificationsReadAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) return;

  await markAllNotificationsRead(supabase, business.id);
}
