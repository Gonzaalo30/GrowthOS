import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import { getAllCompletedMissions } from "@/services/mission.service";
import { getGrowthScoreTimeline } from "@/services/audit.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { AuditLog, type AuditLogEntry } from "@/features/historial/AuditLog";

export default async function HistorialPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const [profile, completedMissions, scoreTimeline, requests] = await Promise.all([
    getProfile(supabase, user.id),
    getAllCompletedMissions(supabase, business.id),
    getGrowthScoreTimeline(supabase, business.id),
    getRequestsForBusiness(supabase, business.id),
  ]);

  const entries: AuditLogEntry[] = [];

  for (const m of completedMissions) {
    if (!m.completed_at) continue;
    entries.push({
      id: `mission-${m.id}`,
      date: m.completed_at,
      kind: "mission",
      title: m.title,
      meta: `+${m.xp_reward} XP`,
      isWeekly: m.type === "weekly",
    });
  }

  // El primer punto de la línea de tiempo es la base con la que se creó el
  // negocio, no un cambio provocado por el usuario — no cuenta como "impacto"
  // todavía, solo como referencia para calcular el delta del segundo punto.
  scoreTimeline.forEach((point, i) => {
    if (i === 0) return;
    const delta = point.score - scoreTimeline[i - 1].score;
    entries.push({
      id: `score-${point.recordedAt}`,
      date: point.recordedAt,
      kind: "score",
      title: `Growth Score: ${point.score}/100`,
      meta: delta === 0 ? "sin cambios" : `${delta > 0 ? "+" : ""}${delta} pts`,
    });
  });

  for (const r of requests) {
    if (!r.paid || !r.paid_at) continue;
    entries.push({
      id: `purchase-${r.id}`,
      date: r.paid_at,
      kind: "purchase",
      title: r.title,
      meta: `${(r.price_cents / 100).toLocaleString("es-ES")} €${r.stripe_subscription_id ? "/mes" : ""}`,
    });
  }

  entries.sort((a, b) => b.date.localeCompare(a.date));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Historial de {business.domain}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Cada cambio real que has hecho guiado por GrowthOS, y el impacto que tuvo después.
        </p>
      </div>

      <AuditLog entries={entries} dateFormat={profile.date_format} />
    </div>
  );
}
