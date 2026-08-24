"use client";

import { useTransition } from "react";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { createOpportunityCheckoutAction } from "@/app/actions/opportunities";
import { OPPORTUNITY_CATEGORY_LABELS, type Opportunity } from "@/lib/opportunities";

function formatPrice(opportunity: Opportunity) {
  const amount = `${(opportunity.priceCents / 100).toLocaleString("es-ES")} €`;
  const withCadence = opportunity.pricing === "monthly" ? `${amount}/mes` : amount;
  return opportunity.priceIsFrom ? `Desde ${withCadence}` : withCadence;
}

export function OpportunityCard({
  opportunity,
  alreadyPurchased,
}: {
  opportunity: Opportunity;
  alreadyPurchased: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  function handleBuy() {
    startTransition(async () => {
      await createOpportunityCheckoutAction(opportunity.id);
    });
  }

  return (
    <GrowthCard className="flex h-full flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <span className="mb-1 inline-block rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-medium text-zinc-500">
            {OPPORTUNITY_CATEGORY_LABELS[opportunity.category]}
          </span>
          <h3 className="font-medium text-foreground">{opportunity.title}</h3>
        </div>
        <span className="whitespace-nowrap text-sm font-semibold text-brand-600">
          {formatPrice(opportunity)}
        </span>
      </div>
      <p className="text-sm text-zinc-600">{opportunity.description}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>Impacto: {opportunity.expectedImpact}</span>
        <span>{opportunity.pricing === "monthly" ? "Cadencia" : "Tiempo"}: {opportunity.implementationTime}</span>
      </div>
      <Button
        variant={alreadyPurchased ? "secondary" : "primary"}
        disabled={alreadyPurchased || isPending}
        onClick={handleBuy}
        className="mt-1 self-start"
      >
        {alreadyPurchased
          ? opportunity.pricing === "monthly"
            ? "Ya contratado"
            : "Ya comprado"
          : isPending
            ? "Redirigiendo…"
            : opportunity.priceIsFrom
              ? `Comprar ${formatPrice(opportunity).toLowerCase()}`
              : `Comprar por ${formatPrice(opportunity)}`}
      </Button>
    </GrowthCard>
  );
}
