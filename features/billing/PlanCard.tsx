import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { PlanCheckoutButton } from "@/features/billing/PlanCheckoutButton";
import { createBillingPortalSessionAction } from "@/app/actions/subscription";
import type { Plan, PlanId } from "@/lib/plans";

function formatPrice(cents: number) {
  if (cents === 0) return "Gratis";
  return `${(cents / 100).toLocaleString("es-ES")} € / mes`;
}

export function PlanCard({
  plan,
  isLoggedIn,
  currentPlanId,
  hasActiveSubscription,
  interval = "monthly",
}: {
  plan: Plan;
  isLoggedIn: boolean;
  currentPlanId?: PlanId;
  hasActiveSubscription: boolean;
  interval?: "monthly" | "annual";
}) {
  const isCurrent = currentPlanId === plan.id;
  const useAnnual = interval === "annual" && Boolean(plan.annual);
  const monthlyEquivalentCents = useAnnual ? Math.round(plan.annual!.priceCents / 12) : null;

  return (
    <GrowthCard
      className={cn(
        "relative flex h-full flex-col gap-4",
        plan.recommended && "border-2 border-brand-400 shadow-md",
      )}
    >
      {plan.recommended && (
        <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
          Recomendado
        </span>
      )}

      <div>
        <h2 className="text-lg font-semibold text-foreground">{plan.name}</h2>
        <p className="mt-1 text-sm text-zinc-600">{plan.tagline}</p>
      </div>

      <div>
        {useAnnual ? (
          <>
            <p className="text-3xl font-semibold text-foreground">
              {(monthlyEquivalentCents! / 100).toLocaleString("es-ES")} €{" "}
              <span className="text-base font-normal text-zinc-500">/ mes</span>
            </p>
            <p className="text-xs text-zinc-500">
              {(plan.annual!.priceCents / 100).toLocaleString("es-ES")} €/año, facturado de una vez ·
              ahorras un 20% frente al mensual
            </p>
          </>
        ) : (
          <p className="text-3xl font-semibold text-foreground">{formatPrice(plan.priceCents)}</p>
        )}
        {plan.priceCents > 0 ? (
          <p className="text-xs text-zinc-500">
            IVA incluido · {useAnnual ? "Cancela la renovación cuando quieras" : "Sin permanencia, cancela cuando quieras"}
          </p>
        ) : (
          <p className="text-xs text-zinc-500">30 segundos · Sin tarjeta · Sin conocimientos técnicos</p>
        )}
      </div>

      <ul className="flex flex-1 flex-col gap-2">
        {plan.features.map((feature) => (
          <li key={feature} className="flex gap-2 text-sm text-zinc-600">
            <span className="text-brand-500">✓</span>
            {feature}
          </li>
        ))}
      </ul>

      {isCurrent ? (
        <Button variant="secondary" disabled className="w-full">
          Tu plan actual
        </Button>
      ) : plan.id === "starter" ? (
        isLoggedIn ? (
          <p className="text-center text-xs text-zinc-500">Gestiona tu plan desde Mi cuenta</p>
        ) : (
          <Link href="/">
            <Button variant="secondary" className="w-full">
              Ver mi Growth Score
            </Button>
          </Link>
        )
      ) : hasActiveSubscription ? (
        <form action={createBillingPortalSessionAction}>
          <Button type="submit" variant="secondary" className="w-full">
            Cambiar a este plan
          </Button>
        </form>
      ) : (
        <PlanCheckoutButton
          planId={plan.id}
          label={`Empezar con ${plan.name}`}
          interval={useAnnual ? "annual" : "monthly"}
        />
      )}
    </GrowthCard>
  );
}
