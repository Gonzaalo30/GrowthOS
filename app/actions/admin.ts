"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/services/profile.service";
import { completeMission } from "@/services/mission.service";
import { logImpersonation } from "@/services/admin.service";

/** Comprueba con la propia sesión del que llama que es admin de verdad — nunca se confía en el cliente. Devuelve su id real. */
async function assertIsAdmin(): Promise<string> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile.is_admin) redirect("/dashboard");

  return user.id;
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

/**
 * Inicia sesión como el usuario indicado — para soporte real cuando hace
 * falta ver la cuenta de un cliente tal cual la ve él. Genera un enlace de
 * acceso real vía la API de admin de Supabase (nunca se envía email: el
 * propio navegador del admin lo consume al momento) y dejar constancia en
 * `admin_impersonation_log` antes de redirigir — la sesión de admin actual
 * queda sustituida por la del usuario, así que hay que volver a iniciar
 * sesión como admin después.
 */
export async function impersonateUserAction(formData: FormData) {
  const targetUserId = String(formData.get("userId") ?? "");
  if (!targetUserId) redirect("/admin/usuarios?error=usuario_invalido");

  const adminId = await assertIsAdmin();

  const adminClient = createAdminClient();
  const { data: target, error: targetError } = await adminClient
    .from("profiles")
    .select("email, is_admin")
    .eq("id", targetUserId)
    .maybeSingle();
  if (targetError || !target) redirect("/admin/usuarios?error=usuario_no_encontrado");
  // Ningún admin (aunque hoy solo hay uno) debe poder entrar en la cuenta de otro admin.
  if (target.is_admin) redirect("/admin/usuarios?error=no_se_puede_suplantar_admin");

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email: target.email,
    options: { redirectTo: `${origin}/auth/callback?next=${encodeURIComponent("/dashboard")}` },
  });
  if (error || !data?.properties?.action_link) redirect("/admin/usuarios?error=fallo_impersonacion");

  await logImpersonation(adminClient, adminId, targetUserId);

  redirect(data.properties.action_link);
}
