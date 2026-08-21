"use client";

import { useActionState, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { cn } from "@/lib/utils";
import { completeOnboardingAction, type OnboardingState } from "@/app/actions/onboarding";
import { BUSINESS_TYPES, COMPANY_SIZES } from "@/lib/businessTypes";

const initialState: OnboardingState = {};

const TOTAL_STEPS = 5;

const CONNECTIONS = [
  { id: "google-business", label: "Google Business Profile", detail: "Reseñas, horarios y ficha local" },
  { id: "search-console", label: "Google Search Console", detail: "Qué te encuentra en Google" },
  { id: "ga4", label: "Google Analytics 4", detail: "Visitas y comportamiento reales" },
  { id: "wordpress", label: "Plugin de WordPress", detail: "Aplica mejoras sin tocar código" },
] as const;

export function OnboardingForm({ domain: domainFromQuery }: { domain?: string }) {
  const [state, formAction, isPending] = useActionState(completeOnboardingAction, initialState);

  const [step, setStep] = useState(1);
  const [domain, setDomain] = useState(domainFromQuery ?? "");
  const [businessType, setBusinessType] = useState("");
  const [city, setCity] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  function goNext() {
    if (step === 1 && domain.trim().length < 3) {
      setStepError("Introduce el dominio de tu negocio.");
      return;
    }
    if (step === 2 && !businessType) {
      setStepError("Selecciona un tipo de negocio.");
      return;
    }
    if (step === 3 && city.trim().length < 2) {
      setStepError("Introduce tu ciudad.");
      return;
    }
    if (step === 4 && !companySize) {
      setStepError("Selecciona el tamaño de tu empresa.");
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 1));
  }

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <div className="mb-6 flex items-center gap-1.5">
        {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
          <div
            key={n}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-colors",
              n <= step ? "bg-brand-500" : "bg-surface-muted",
            )}
          />
        ))}
      </div>

      <form action={formAction} className="flex flex-col gap-4">
        <input type="hidden" name="domain" value={domain} />
        <input type="hidden" name="businessType" value={businessType} />
        <input type="hidden" name="city" value={city} />
        <input type="hidden" name="companySize" value={companySize} />

        {step === 1 && (
          <div>
            <h1 className="text-xl font-semibold text-foreground">¿Cuál es tu web?</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Con esto preparamos tu primer análisis real, en segundos.
            </p>
            <label className="mt-6 block text-sm font-medium text-foreground">
              Web de tu negocio
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="tunegocio.com"
                autoComplete="url"
                autoFocus
                className="mt-1"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div>
            <h1 className="text-xl font-semibold text-foreground">¿A qué te dedicas?</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Así te damos misiones pensadas para tu tipo de negocio.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              {BUSINESS_TYPES.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setBusinessType(type)}
                  className={cn(
                    "rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors",
                    businessType === type
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border bg-white text-foreground hover:bg-surface-muted",
                  )}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <h1 className="text-xl font-semibold text-foreground">¿Dónde estáis?</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Nos ayuda a valorar tu presencia local.
            </p>
            <label className="mt-6 block text-sm font-medium text-foreground">
              Ciudad
              <Input
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Madrid"
                autoComplete="address-level2"
                autoFocus
                className="mt-1"
              />
            </label>
          </div>
        )}

        {step === 4 && (
          <div>
            <h1 className="text-xl font-semibold text-foreground">¿Cuántos sois?</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Adaptamos el ritmo de las misiones al tamaño de tu equipo.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {COMPANY_SIZES.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setCompanySize(size)}
                  className={cn(
                    "rounded-xl border px-4 py-2.5 text-left text-sm font-medium transition-colors",
                    companySize === size
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-border bg-white text-foreground hover:bg-surface-muted",
                  )}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 5 && (
          <div>
            <h1 className="text-xl font-semibold text-foreground">Conexiones opcionales</h1>
            <p className="mt-1 text-sm text-zinc-600">
              Puedes conectarlas más adelante desde tu cuenta. No son necesarias para empezar.
            </p>
            <div className="mt-6 flex flex-col gap-2">
              {CONNECTIONS.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between rounded-xl border border-border bg-white px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{c.label}</p>
                    <p className="text-xs text-zinc-500">{c.detail}</p>
                  </div>
                  <span className="whitespace-nowrap rounded-full bg-surface-muted px-2.5 py-1 text-[11px] font-medium text-zinc-500">
                    Próximamente
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {(stepError || state.error) && (
          <p className="text-sm text-red-600">{stepError ?? state.error}</p>
        )}

        <div className="mt-2 flex items-center gap-2">
          {step > 1 && (
            <Button type="button" variant="secondary" onClick={goBack} disabled={isPending}>
              Atrás
            </Button>
          )}
          {step < TOTAL_STEPS ? (
            <Button type="button" onClick={goNext} className="flex-1">
              Siguiente
            </Button>
          ) : (
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending ? "Preparando tu análisis…" : "Ver mi Growth Score"}
            </Button>
          )}
        </div>
      </form>
    </GrowthCard>
  );
}
