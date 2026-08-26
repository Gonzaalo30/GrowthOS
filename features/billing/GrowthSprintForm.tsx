"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { requestGrowthSprintAction, type GrowthSprintState } from "@/app/actions/growthSprint";

const initialState: GrowthSprintState = {};

export function GrowthSprintForm({
  defaultName,
  defaultEmail,
}: {
  defaultName?: string;
  defaultEmail?: string;
}) {
  const [state, formAction, isPending] = useActionState(requestGrowthSprintAction, initialState);

  if (state.success) {
    return (
      <p className="text-sm text-emerald-700">
        Recibido. Analizamos tu situación y te escribimos en menos de 24-48h laborables para hablar del
        alcance y el precio real de tu Growth Sprint.
      </p>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3 text-left">
      <label className="text-sm font-medium text-foreground">
        Tu nombre
        <Input name="name" required defaultValue={defaultName} autoComplete="name" className="mt-1" />
      </label>
      <label className="text-sm font-medium text-foreground">
        Tu email de contacto
        <Input
          name="email"
          type="email"
          required
          defaultValue={defaultEmail}
          autoComplete="email"
          className="mt-1"
        />
      </label>
      <label className="text-sm font-medium text-foreground">
        Cuéntanos tu situación
        <textarea
          name="details"
          required
          rows={4}
          placeholder="Ej. llevamos meses estancados en visitas, ya hemos hecho varias mejoras sueltas y necesitamos algo más a fondo..."
          className="mt-1 w-full rounded-xl border border-border bg-white px-4 py-2.5 text-sm text-foreground outline-none focus:ring-2 focus:ring-brand-500/40 focus:border-brand-500"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      <Button type="submit" disabled={isPending} className="self-start">
        {isPending ? "Enviando…" : "Solicitar mi Growth Sprint"}
      </Button>
    </form>
  );
}
