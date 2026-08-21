"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestCustomPlanAction, type CustomPlanState } from "@/app/actions/customPlan";

const initialState: CustomPlanState = {};

export function CustomPlanForm({ defaultEmail }: { defaultEmail?: string }) {
  const [state, formAction, isPending] = useActionState(requestCustomPlanAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-emerald-700">
        Recibido. Te escribimos en menos de 24-48h laborables para hablar de tu caso.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 text-left">
      <label className="text-sm font-medium text-foreground">
        ¿Qué necesitas?
        <textarea
          name="details"
          required
          rows={3}
          placeholder="Ej. gestionamos 5 tiendas online y necesitamos algo a medida..."
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </label>
      <label className="text-sm font-medium text-foreground">
        Tu email de contacto
        <Input
          name="contactEmail"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          className="mt-1"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} variant="secondary" className="self-start">
        {isPending ? "Enviando…" : "Hablemos"}
      </Button>
    </form>
  );
}
