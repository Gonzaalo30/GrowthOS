"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Inicia sesión</h1>
      <p className="mt-1 text-sm text-zinc-600">Vuelve a tu panel de crecimiento.</p>

      <form action={formAction} className="mt-6 flex flex-col gap-3">
        <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <Input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          autoComplete="current-password"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Entrando…" : "Entrar"}
        </Button>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        ¿Aún no tienes cuenta?{" "}
        <Link href="/signup" className="font-medium text-brand-600">
          Crea una gratis
        </Link>
      </p>
    </GrowthCard>
  );
}
