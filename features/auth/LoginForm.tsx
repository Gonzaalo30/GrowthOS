"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { loginAction, type LoginState } from "@/app/actions/auth";

const initialState: LoginState = {};

const ERROR_MESSAGES: Record<string, string> = {
  google_fallido: "No hemos podido iniciar sesión con Google. Inténtalo de nuevo.",
};

export function LoginForm({ error }: { error?: string }) {
  const [state, formAction, isPending] = useActionState(loginAction, initialState);

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Inicia sesión</h1>
      <p className="mt-1 text-sm text-zinc-600">Vuelve a tu panel de crecimiento.</p>

      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      <div className="mt-6">
        <GoogleSignInButton returnTo="/login" />
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-zinc-400">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-3">
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
