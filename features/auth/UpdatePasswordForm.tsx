"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { updatePasswordAction, type UpdatePasswordState } from "@/app/actions/auth";

const initialState: UpdatePasswordState = {};

export function UpdatePasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Elige tu nueva contraseña</h1>
      <p className="mt-1 text-sm text-zinc-600">Mínimo 8 caracteres.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input
          name="password"
          type="password"
          placeholder="Nueva contraseña"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Guardando…" : "Guardar contraseña"}
        </Button>
      </form>
    </GrowthCard>
  );
}
