"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createPlanCheckoutAction, type CheckoutState } from "@/app/actions/subscription";
import type { PlanId } from "@/lib/plans";

const initialState: CheckoutState = {};

export function PlanCheckoutButton({ planId, label }: { planId: PlanId; label: string }) {
  const [state, formAction, isPending] = useActionState(
    createPlanCheckoutAction.bind(null, planId),
    initialState,
  );

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending} className="w-full">
        {isPending ? "Conectando con el pago…" : label}
      </Button>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
