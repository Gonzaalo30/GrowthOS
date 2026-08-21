"use client";

import { useState, useTransition } from "react";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { requestOpportunityAction } from "@/app/actions/opportunities";
import { OPPORTUNITY_CATEGORY_LABELS, type Opportunity } from "@/lib/opportunities";

function formatPrice(cents: number) {
  return `${(cents / 100).toLocaleString("es-ES")} €`;
}

export function OpportunityCard({
  opportunity,
  alreadyRequested,
}: {
  opportunity: Opportunity;
  alreadyRequested: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [justRequested, setJustRequested] = useState(false);
  const requested = alreadyRequested || justRequested;

  function handleApply() {
    startTransition(async () => {
      await requestOpportunityAction(opportunity.id);
      setJustRequested(true);
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
          {formatPrice(opportunity.priceCents)}
        </span>
      </div>
      <p className="text-sm text-zinc-600">{opportunity.description}</p>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-zinc-500">
        <span>Impacto: {opportunity.expectedImpact}</span>
        <span>Tiempo: {opportunity.implementationTime}</span>
      </div>
      <Button
        variant={requested ? "secondary" : "primary"}
        disabled={requested || isPending}
        onClick={handleApply}
        className="mt-1 self-start"
      >
        {requested ? "Solicitud enviada" : isPending ? "Enviando…" : "Aplicar esta mejora"}
      </Button>
    </GrowthCard>
  );
}
