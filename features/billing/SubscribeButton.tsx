"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { createAutopilotCheckoutAction, type CheckoutState } from "@/app/actions/subscription";

const initialState: CheckoutState = {};

export function SubscribeButton() {
  const [state, formAction, isPending] = useActionState(createAutopilotCheckoutAction, initialState);

  return (
    <form action={formAction}>
      <Button type="submit" disabled={isPending} className="mt-6 w-full">
        {isPending ? "Conectando con el pago…" : "Suscribirme por 99 €/mes"}
      </Button>
      {state.error && <p className="mt-2 text-sm text-red-600">{state.error}</p>}
    </form>
  );
}
