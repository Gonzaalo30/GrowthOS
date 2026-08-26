"use client";

import { useState } from "react";
import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { PlanCard } from "@/features/billing/PlanCard";
import { cn } from "@/lib/utils";
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
        {plans
          .filter((plan) => plan.id !== "agencia")
          .map((plan) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              isLoggedIn={isLoggedIn}
              currentPlanId={currentPlanId}
              hasActiveSubscription={hasActiveSubscription}
              interval={interval}
            />
          ))}

        <GrowthCard className="flex h-full flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Agencia</h2>
            <p className="mt-1 text-sm text-zinc-600">
              ¿Gestionas varios negocios? Un solo precio para hasta 5 clientes.
            </p>
          </div>

          <p className="text-3xl font-semibold text-foreground">
            99 € <span className="text-base font-normal text-zinc-500">/ mes</span>
          </p>

          <ul className="flex flex-1 flex-col gap-2">
            <li className="flex gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              Hasta 5 negocios con funciones Growth cada uno
            </li>
            <li className="flex gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              +15€/mes por negocio adicional
            </li>
            <li className="flex gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              No incluye Autopilot
            </li>
          </ul>

          <Link href="/plan-agencia">
            <Button variant="secondary" className="w-full">
              Ver plan Agencia
            </Button>
          </Link>
        </GrowthCard>

        <GrowthCard className="flex h-full flex-col gap-4">
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
      </div>
    </div>
  );
}
