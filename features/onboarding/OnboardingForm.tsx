"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { completeOnboardingAction, type OnboardingState } from "@/app/actions/onboarding";
import { BUSINESS_TYPES, COMPANY_SIZES } from "@/lib/businessTypes";

const initialState: OnboardingState = {};

export function OnboardingForm({ domain }: { domain?: string }) {
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Cuéntanos sobre tu negocio</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Con esto preparamos tu primer análisis y tus misiones de hoy.
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <label className="text-sm font-medium text-foreground">
          Web de tu negocio
          <Input name="domain" defaultValue={domain} placeholder="tunegocio.com" required className="mt-1" />
        </label>

        <label className="text-sm font-medium text-foreground">
          Tipo de negocio
          <select
            name="businessType"
            required
            defaultValue=""
            className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {BUSINESS_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm font-medium text-foreground">
          Ciudad
          <Input name="city" placeholder="Madrid" required className="mt-1" />
        </label>

        <label className="text-sm font-medium text-foreground">
          Tamaño de la empresa
          <select
            name="companySize"
            required
            defaultValue=""
            className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
          >
            <option value="" disabled>
              Selecciona una opción
            </option>
            {COMPANY_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>

        {state.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Preparando tu análisis…" : "Ver mi Growth Score"}
        </Button>
      </form>
    </GrowthCard>
  );
}
