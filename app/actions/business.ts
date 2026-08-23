"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessesByOwner } from "@/services/business.service";
import { updateActiveBusiness } from "@/services/profile.service";

export async function switchActiveBusinessAction(formData: FormData) {
  const businessId = String(formData.get("businessId") ?? "");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Comprueba que el negocio es de verdad suyo antes de fijarlo como activo —
  // sin esto, cualquiera podría intentar colar el id de un negocio ajeno.
  const businesses = await getBusinessesByOwner(supabase, user.id);
  if (businesses.some((b) => b.id === businessId)) {
    await updateActiveBusiness(supabase, user.id, businessId);
  }

  redirect("/dashboard");
}
