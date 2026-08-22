"use client";

import { useState } from "react";
import { OpportunityCard } from "@/components/growth/OpportunityCard";
import { cn } from "@/lib/utils";
import {
  OPPORTUNITY_CATEGORY_LABELS,
  type Opportunity,
  type OpportunityCategory,
} from "@/lib/opportunities";

const FILTERS: Array<{ value: OpportunityCategory | "all"; label: string }> = [
  { value: "all", label: "Todos" },
  { value: "seo", label: OPPORTUNITY_CATEGORY_LABELS.seo },
  { value: "google", label: OPPORTUNITY_CATEGORY_LABELS.google },
  { value: "velocidad", label: OPPORTUNITY_CATEGORY_LABELS.velocidad },
  { value: "conversion", label: OPPORTUNITY_CATEGORY_LABELS.conversion },
  { value: "seguridad", label: OPPORTUNITY_CATEGORY_LABELS.seguridad },
];

export function OpportunityList({
  opportunities,
  purchasedIds,
}: {
  opportunities: Opportunity[];
  purchasedIds: string[];
}) {
  const [filter, setFilter] = useState<OpportunityCategory | "all">("all");
  const purchased = new Set(purchasedIds);
  const visible = opportunities.filter((o) => filter === "all" || o.category === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setFilter(f.value)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              filter === f.value
                ? "bg-brand-500 text-white"
                : "bg-surface-muted text-zinc-600 hover:text-foreground",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {visible.map((opportunity) => (
          <OpportunityCard
            key={opportunity.id}
            opportunity={opportunity}
            alreadyPurchased={purchased.has(opportunity.id)}
          />
        ))}
      </div>
      {visible.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-6 text-center">
          <p className="text-sm text-zinc-500">No hay mejoras en esta categoría todavía.</p>
          <button
            type="button"
            onClick={() => setFilter("all")}
            className="text-sm font-medium text-brand-600 underline underline-offset-2 hover:text-brand-700"
          >
            Ver todas las mejoras
          </button>
        </div>
      )}
    </div>
  );
}
