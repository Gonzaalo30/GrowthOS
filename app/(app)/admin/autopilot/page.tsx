import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfile } from "@/services/profile.service";
import { getAutopilotBusinessesOverview, WEEKLY_ADMIN_LIMIT } from "@/services/admin.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { AdminMissionButton } from "@/features/admin/AdminMissionButton";

export default async function AdminAutopilotPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfile(supabase, user.id);
  if (!profile.is_admin) redirect("/dashboard");

  // Cliente con service role: las políticas de RLS de `businesses` solo
  // dejan ver las filas propias del usuario autenticado, así que con el
  // cliente normal esto nunca vería negocios de clientes reales, solo el
  // del propio admin si lo tuviera en plan Autopilot.
  const businesses = await getAutopilotBusinessesOverview(createAdminClient());

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Autopilot — Misiones pendientes</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Marca una misión como implementada cuando hayas hecho el trabajo real en la web del cliente —
          suma XP y racha de verdad en su cuenta, igual que si la hubiera completado él mismo.
        </p>
        <Link href="/admin/usuarios" className="mt-1 inline-block text-xs text-brand-600 underline underline-offset-2">
          Ver todos los usuarios registrados →
        </Link>
      </div>

      {businesses.length === 0 ? (
        <p className="text-sm text-zinc-500">No hay clientes Autopilot activos ahora mismo.</p>
      ) : (
        businesses.map((business) => (
          <GrowthCard key={business.businessId} className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h2 className="flex items-center gap-2 font-medium text-foreground">
                  {business.domain}
                  {business.isTopLevel && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                      🏆 Nivel máximo · prioridad
                    </span>
                  )}
                </h2>
                <p className="text-xs text-zinc-500">
                  {business.ownerName} · {business.ownerEmail}
                </p>
              </div>
              <span
                className={
                  business.weeklyAdminCompletions >= WEEKLY_ADMIN_LIMIT
                    ? "text-xs font-medium text-red-600"
                    : "text-xs font-medium text-zinc-500"
                }
              >
                {business.weeklyAdminCompletions}/{WEEKLY_ADMIN_LIMIT} diarias implementadas esta semana
              </span>
            </div>

            {business.pendingWeeklyMission && (
              <div className="flex items-center justify-between gap-3 rounded-lg border border-brand-200 bg-brand-50 px-3 py-2">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">Misión semanal</p>
                  <p className="text-sm text-foreground">{business.pendingWeeklyMission.title}</p>
                </div>
                <AdminMissionButton missionId={business.pendingWeeklyMission.id} />
              </div>
            )}

            {business.pendingDailyMissions.length === 0 ? (
              <p className="text-sm text-zinc-500">Sin Quick Wins pendientes ahora mismo.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {business.pendingDailyMissions.map((mission) => (
                  <li
                    key={mission.id}
                    className="flex items-center justify-between gap-3 rounded-lg border border-border px-3 py-2"
                  >
                    <div>
                      <p className="text-sm text-foreground">{mission.title}</p>
                      <p className="text-xs text-zinc-500">
                        +{mission.xp_reward} XP · {mission.time_estimate_minutes} min
                      </p>
                    </div>
                    <AdminMissionButton missionId={mission.id} />
                  </li>
                ))}
              </ul>
            )}
          </GrowthCard>
        ))
      )}
    </div>
  );
}
