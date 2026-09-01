"use client";

import { useState } from "react";
import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { PlanCard } from "@/features/billing/PlanCard";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import { priceWithIVA, formatEuros } from "@/lib/tax";
import type { Plan, PlanId } from "@/lib/plans";

export function PricingPlans({
  plans,
  isLoggedIn,
  currentPlanId,
  hasActiveSubscription,
}: {
  plans: Plan[];
  isLoggedIn: boolean;
  currentPlanId?: PlanId;
  hasActiveSubscription: boolean;
}) {
  const [interval, setInterval] = useState<"monthly" | "annual">("monthly");
  const agenciaPlan = plans.find((plan) => plan.id === "agencia");
  const visiblePlans = plans.filter((plan) => plan.id !== "agencia");

  return (
    <div className="flex flex-col gap-6">
      <div className="mx-auto flex items-center gap-1 rounded-full bg-surface-muted p-1">
        <button
          type="button"
          onClick={() => setInterval("monthly")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            interval === "monthly" ? "bg-white text-foreground shadow-sm" : "text-zinc-500",
          )}
        >
          Mensual
        </button>
        <button
          type="button"
          onClick={() => setInterval("annual")}
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-medium transition-colors",
            interval === "annual" ? "bg-white text-foreground shadow-sm" : "text-zinc-500",
          )}
        >
          Anual <span className="text-brand-600">-20%</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {visiblePlans.map((plan, i) => (
          <Reveal key={plan.id} delay={i * 0.06} className="h-full">
            <PlanCard
              plan={plan}
              isLoggedIn={isLoggedIn}
              currentPlanId={currentPlanId}
              hasActiveSubscription={hasActiveSubscription}
              interval={interval}
            />
          </Reveal>
        ))}

        <Reveal delay={visiblePlans.length * 0.06} className="h-full">
          <GrowthCard interactive className="flex h-full flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Agencia</h2>
              <p className="mt-1 text-sm text-zinc-600">
                ¿Gestionas varios negocios? Un solo precio para hasta 5 clientes.
              </p>
            </div>

            <p className="text-3xl font-semibold text-foreground">
              {agenciaPlan ? formatEuros(agenciaPlan.priceCents) : "99 €"}{" "}
              <span className="text-base font-normal text-zinc-500">+ IVA / mes</span>
            </p>
            {agenciaPlan && (
              <p className="-mt-3 text-xs text-zinc-500">
                {formatEuros(priceWithIVA(agenciaPlan.priceCents))} al mes con IVA
              </p>
            )}

            <ul className="flex flex-1 flex-col gap-2">
              {(agenciaPlan?.features ?? []).map((feature) => (
                <li key={feature} className="flex gap-2 text-sm text-zinc-600">
                  <span className="text-brand-500">✓</span>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/plan-agencia">
              <Button variant="secondary" className="w-full">
                Ver plan Agencia
              </Button>
            </Link>
          </GrowthCard>
        </Reveal>

        <Reveal delay={(visiblePlans.length + 1) * 0.06} className="h-full">
          <GrowthCard interactive className="flex h-full flex-col gap-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">Personalizado</h2>
              <p className="mt-1 text-sm text-zinc-600">
                ¿No sabes qué plan te conviene? Analizamos tu situación real y tu presupuesto.
              </p>
            </div>

            <p className="text-3xl font-semibold text-foreground">A tu medida</p>

            <ul className="flex flex-1 flex-col gap-2">
              <li className="flex gap-2 text-sm text-zinc-600">
                <span className="text-brand-500">✓</span>
                Te decimos qué plan encaja mejor contigo
              </li>
              <li className="flex gap-2 text-sm text-zinc-600">
                <span className="text-brand-500">✓</span>
                Sin compromiso, solo una conversación
              </li>
              <li className="flex gap-2 text-sm text-zinc-600">
                <span className="text-brand-500">✓</span>
                Ideal si tienes un caso particular
              </li>
            </ul>

            <Link href="/plan-personalizado">
              <Button variant="secondary" className="w-full">
                Empezar con plan personalizado
              </Button>
            </Link>
          </GrowthCard>
        </Reveal>
      </div>
    </div>
  );
}
