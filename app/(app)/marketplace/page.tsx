import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getRequestsForBusiness } from "@/services/opportunity.service";
import { OpportunityCard } from "@/components/growth/OpportunityCard";
import { OPPORTUNITIES } from "@/lib/opportunities";

export default async function MarketplacePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) redirect("/onboarding");

  const requests = await getRequestsForBusiness(supabase, business.id);
  const requestedIds = new Set(requests.map((r) => r.opportunity_id));

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Marketplace</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Mejoras con precio cerrado. Sin presupuestos, sin sorpresas.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {OPPORTUNITIES.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            alreadyRequested={requestedIds.has(opportunity.id)}
          />
        ))}
      </div>
    </div>
  );
}
