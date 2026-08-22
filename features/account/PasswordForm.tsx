"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updatePasswordAction, type AccountState } from "@/app/actions/account";

const initialState: AccountState = {};

export function PasswordForm() {
  const [state, formAction, isPending] = useActionState(updatePasswordAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Nueva contraseña
        <Input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1"
        />
      </label>
      <label className="text-sm font-medium text-foreground">
        Repite la contraseña
        <Input
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="mt-1"
        />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Contraseña actualizada.</p>}
      <Button type="submit" disabled={isPending} variant="secondary" className="mt-1 self-start">
        {isPending ? "Guardando…" : "Cambiar contraseña"}
      </Button>
    </form>
  );
}
