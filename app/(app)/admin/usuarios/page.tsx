import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/services/profile.service";
import { getAllUsersOverview } from "@/services/admin.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { ImpersonateButton } from "@/features/admin/ImpersonateButton";

const ERROR_MESSAGES: Record<string, string> = {
  usuario_invalido: "Usuario no válido.",
  usuario_no_encontrado: "No hemos encontrado ese usuario.",
  no_se_puede_suplantar_admin: "No puedes iniciar sesión como otro administrador.",
  fallo_impersonacion: "No hemos podido iniciar sesión como ese usuario. Inténtalo de nuevo.",
};

export default async function AdminUsuariosPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile.is_admin) redirect("/dashboard");

  const users = await getAllUsersOverview(createAdminClient());

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Usuarios registrados</h1>
        <p className="mt-1 text-sm text-zinc-600">
          {users.length} {users.length === 1 ? "cuenta registrada" : "cuentas registradas"} en total.
        </p>
        <Link
          href="/admin/autopilot"
          className="mt-1 inline-block text-xs text-brand-600 underline underline-offset-2"
        >
          Ver misiones pendientes de Autopilot →
        </Link>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      <div className="flex flex-col gap-3">
        {users.map((u) => (
          <GrowthCard
            key={u.userId}
            className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="flex items-center gap-2 font-medium text-foreground">
                {u.name}
                {u.isAdmin && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                    Admin
                  </span>
                )}
              </p>
              <p className="text-xs text-zinc-500">
                {u.email} · registrado el{" "}
                {new Date(u.createdAt).toLocaleDateString("es-ES", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })}
              </p>
              {u.businesses.length > 0 ? (
                <ul className="mt-1.5 flex flex-wrap gap-1.5">
                  {u.businesses.map((b) => (
                    <li
                      key={b.id}
                      className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-zinc-600"
                    >
                      {b.domain} · {b.plan} · Score {b.growthScore}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-1.5 text-xs text-zinc-400">Sin negocio creado todavía.</p>
              )}
            </div>

            {!u.isAdmin && <ImpersonateButton userId={u.userId} userLabel={`${u.name} (${u.email})`} />}
          </GrowthCard>
        ))}
      </div>
    </div>
  );
}
