"use client";

import { useState, useTransition } from "react";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { requestOpportunityAction } from "@/app/actions/opportunities";
import type { Opportunity } from "@/lib/opportunities";

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
    <GrowthCard className="flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-medium text-foreground">{opportunity.title}</h3>
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
