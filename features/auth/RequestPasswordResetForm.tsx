"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { requestPasswordResetAction, type RequestPasswordResetState } from "@/app/actions/auth";

const initialState: RequestPasswordResetState = {};

const ERROR_MESSAGES: Record<string, string> = {
  enlace_caducado: "El enlace ha caducado o ya se usó. Pide uno nuevo.",
};

export function RequestPasswordResetForm({ error }: { error?: string }) {
  const [state, formAction, isPending] = useActionState(requestPasswordResetAction, initialState);

  if (state.success) {
    return (
      <GrowthCard className="mx-auto w-full max-w-md text-center">
        <h1 className="text-xl font-semibold text-foreground">Revisa tu email</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Si existe una cuenta con ese email, te hemos enviado un enlace para elegir una nueva contraseña.
        </p>
        <Link href="/login" className="mt-4 inline-block text-sm font-medium text-brand-600">
          Volver a iniciar sesión
        </Link>
      </GrowthCard>
    );
  }

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Recupera tu contraseña</h1>
      <p className="mt-1 text-sm text-zinc-600">
        Introduce tu email y te enviamos un enlace para elegir una nueva.
      </p>

      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Enviando…" : "Enviar enlace"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        <Link href="/login" className="font-medium text-brand-600">
          Volver a iniciar sesión
        </Link>
      </p>
    </GrowthCard>
  );
}
