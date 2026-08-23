import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { OpportunityList } from "@/features/marketplace/OpportunityList";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { OPPORTUNITIES } from "@/lib/opportunities";

export default async function MarketplacePage({
  searchParams,
}: {
  searchParams: Promise<{ compra?: string }>;
}) {
  const { compra } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const requests = await getRequestsForBusiness(supabase, business.id);
  const purchasedIds = requests.filter((r) => r.paid).map((r) => r.opportunity_id);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Centro de Mejoras</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Mejoras con precio cerrado para tu negocio. Sin presupuestos, sin sorpresas.
        </p>
      </div>

      {compra === "exito" && (
        <GrowthCard className="border-brand-200 bg-brand-50 text-sm text-brand-700">
          ¡Pago recibido! En menos de 24-48h laborables te contactaremos por email o teléfono para
          pedirte los accesos que necesitemos (a tu web, tu ficha de Google, hosting, etc.) y ponernos
          manos a la obra.
        </GrowthCard>
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
        quieras desde &quot;Gestionar suscripción&quot; en Mi cuenta.
      </p>

      <OpportunityList opportunities={OPPORTUNITIES} purchasedIds={purchasedIds} />
    </div>
  );
}
