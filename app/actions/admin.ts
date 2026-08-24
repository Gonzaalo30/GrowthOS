"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/services/profile.service";
import { completeMission } from "@/services/mission.service";

/** Comprueba con la propia sesión del que llama que es admin de verdad — nunca se confía en el cliente. */
async function assertIsAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile.is_admin) redirect("/dashboard");
}

/**
 * Marca como hecha una misión de un cliente Autopilot tras implementar el
 * trabajo real — usa el cliente de service-role porque el fundador no es el
 * owner de ese negocio (RLS lo bloquearía si se usara su propia sesión).
 */
export async function adminCompleteMissionAction(missionId: string) {
  await assertIsAdmin();

  const adminClient = createAdminClient();
  await completeMission(adminClient, missionId, { byAdmin: true });

  revalidatePath("/admin/autopilot");
}
