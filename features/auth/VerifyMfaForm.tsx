"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { verifyLoginMfaAction } from "@/app/actions/mfa";
import type { MfaVerifyState } from "@/app/actions/mfa";

const initialState: MfaVerifyState = {};

export function VerifyMfaForm() {
  const [state, formAction, isPending] = useActionState(verifyLoginMfaAction, initialState);

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Verificación en dos pasos</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Introduce el código de 6 dígitos de tu app de verificación (Google Authenticator, Authy...).
      </p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input
          name="code"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={6}
          placeholder="123456"
          required
          autoFocus
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Verificando…" : "Verificar"}
        </Button>
      </form>
    </GrowthCard>
  );
}
