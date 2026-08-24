import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { countChestsOpened } from "@/services/chest.service";
import { getMissionsForBusiness } from "@/services/mission.service";
import { getGrowthScoreTimeline } from "@/services/audit.service";
import { computeAchievements } from "@/lib/achievements";
import { OpportunityList } from "@/features/marketplace/OpportunityList";
import { OpportunityPurchaseCelebration } from "@/features/marketplace/OpportunityPurchaseCelebration";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { OPPORTUNITIES } from "@/lib/opportunities";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ compra?: string; item?: string }>;
}) {
  const { compra, item } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const requests = await getRequestsForBusiness(supabase, business.id);
  const purchasedIds = requests.filter((r) => r.paid).map((r) => r.opportunity_id);
  const purchaseCount = business.plan_purchase_count + requests.length;

  // Justo tras comprar una mejora: si esta compra cruzó exactamente un hito,
  // se celebra junto con el pop-up — solo si el contador real coincide.
  let justUnlockedAchievement: ReturnType<typeof computeAchievements>[number] | null = null;
  const purchasedOpportunity = compra === "exito" ? OPPORTUNITIES.find((o) => o.id === item) : undefined;
  if (purchasedOpportunity) {
    try {
      const [chestsOpened, missions, scoreTimeline] = await Promise.all([
        countChestsOpened(supabase, business.id),
        getMissionsForBusiness(supabase, business.id),
        getGrowthScoreTimeline(supabase, business.id),
      ]);
      const achievements = computeAchievements({
        xp: business.xp,
        longestStreak: business.longest_streak,
        hasCompletedDaily: missions.some((m) => m.type === "daily" && m.completed_at !== null),
        hasCompletedWeekly: missions.some((m) => m.type === "weekly" && m.completed_at !== null),
        chestsOpened,
        opportunityRequests: requests.length,
        scoreImproved:
          scoreTimeline.length >= 2 && scoreTimeline[scoreTimeline.length - 1].score > scoreTimeline[0].score,
        purchaseCount,
      });
      justUnlockedAchievement =
        achievements.find(
          (a) =>
            (a.id === "first-purchase" && purchaseCount === 1) ||
            (a.id === "purchases-5" && purchaseCount === 5) ||
            (a.id === "purchases-10" && purchaseCount === 10),
        ) ?? null;
    } catch {
      // sin logro que mostrar, el pop-up de compra se enseña igual
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Centro de Mejoras</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Mejoras con precio cerrado para tu negocio. Sin presupuestos, sin sorpresas.
        </p>
      </div>

      {purchasedOpportunity ? (
        <OpportunityPurchaseCelebration
          opportunity={purchasedOpportunity}
          justUnlockedAchievement={justUnlockedAchievement}
        />
      ) : (
        compra === "exito" && (
          <GrowthCard className="border-brand-200 bg-brand-50 text-sm text-brand-700">
            ¡Pago recibido! En menos de 24-48h laborables te contactaremos por email o teléfono para
            pedirte los accesos que necesitemos (a tu web, tu ficha de Google, hosting, etc.) y ponernos
            manos a la obra.
          </GrowthCard>
        )
      )}
      {compra === "cancelado" && (
        <GrowthCard className="text-sm text-zinc-600">
          Pago cancelado, no se te ha cobrado nada. Puedes volver a intentarlo cuando quieras.
        </GrowthCard>
      )}
      {compra === "error" && (
        <GrowthCard className="border-red-200 bg-red-50 text-sm text-red-700">
          No hemos podido iniciar el pago. Inténtalo de nuevo en un momento.
        </GrowthCard>
      )}

      <p className="text-xs text-zinc-500">
        Cómo funciona: compras la mejora → nuestro equipo te contacta por email o teléfono para pedirte
        los accesos necesarios → la implementamos. Las mejoras mensuales se pueden cancelar cuando
        quieras desde &quot;Gestionar suscripción&quot; en Mi cuenta. Precios con IVA incluido.
      </p>

      <OpportunityList opportunities={OPPORTUNITIES} purchasedIds={purchasedIds} />
    </div>
  );
}
