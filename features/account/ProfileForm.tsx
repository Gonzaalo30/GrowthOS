"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { updateProfileAction, type AccountState } from "@/app/actions/account";

const initialState: AccountState = {};

export function ProfileForm({ name, email }: { name: string; email: string }) {
  const [state, formAction, isPending] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <label className="text-sm font-medium text-foreground">
        Nombre
        <Input name="name" defaultValue={name} required autoComplete="name" className="mt-1" />
      </label>
      <label className="text-sm font-medium text-foreground">
        Email
        <Input value={email} disabled autoComplete="email" className="mt-1 bg-surface-muted text-zinc-500" />
      </label>
      {state.error && <p className="text-sm text-red-600">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-600">Guardado.</p>}
      <Button type="submit" disabled={isPending} className="mt-1 self-start">
        {isPending ? "Guardando…" : "Guardar nombre"}
      </Button>
    </form>
  );
}
