"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { GoogleSignInButton } from "@/features/auth/GoogleSignInButton";
import { signUpAction, type SignUpState } from "@/app/actions/auth";

const initialState: SignUpState = {};

const ERROR_MESSAGES: Record<string, string> = {
  google_fallido: "No hemos podido crear tu cuenta con Google. Inténtalo de nuevo.",
};

export function SignupForm({ domain, error }: { domain?: string; error?: string }) {
  const [state, formAction, isPending] = useActionState(signUpAction, initialState);

  if (state.success) {
    return (
      <GrowthCard className="mx-auto max-w-md text-center">
        <h2 className="text-lg font-semibold text-foreground">Revisa tu email</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Te hemos enviado un enlace de confirmación. Al abrirlo, seguimos con tu análisis.
        </p>
      </GrowthCard>
    );
  }

  return (
    <GrowthCard className="mx-auto w-full max-w-md">
      <h1 className="text-xl font-semibold text-foreground">Crea tu cuenta gratis</h1>
      <p className="mt-1 text-sm text-zinc-600">
        {domain
          ? `Guarda el análisis de ${domain} y desbloquea tus misiones de hoy.`
          : "Empieza a hacer crecer tu negocio."}
      </p>

      {error && ERROR_MESSAGES[error] && (
        <p className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      <div className="mt-6">
        <GoogleSignInButton domain={domain} returnTo="/signup" />
      </div>

      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-zinc-400">o</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <form action={formAction} className="flex flex-col gap-3">
        {domain && <input type="hidden" name="domain" value={domain} />}
        <Input name="name" placeholder="Tu nombre" required autoComplete="name" />
        <Input name="email" type="email" placeholder="Email" required autoComplete="email" />
        <Input
          name="password"
          type="password"
          placeholder="Contraseña"
          required
          minLength={8}
          autoComplete="new-password"
        />
        {state.error && <p className="text-sm text-red-600">{state.error}</p>}
        <Button type="submit" disabled={isPending} className="mt-2 w-full">
          {isPending ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
        <p className="text-center text-xs text-zinc-500">
          Al crear tu cuenta, aceptas nuestros{" "}
          <Link href="/terminos" className="underline underline-offset-2 hover:text-foreground">
            Términos
          </Link>{" "}
          y nuestra{" "}
          <Link href="/privacidad" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidad
          </Link>
          .
        </p>
      </form>

      <p className="mt-4 text-center text-sm text-zinc-600">
        ¿Ya tienes cuenta?{" "}
        <Link href="/login" className="font-medium text-brand-600">
          Inicia sesión
        </Link>
      </p>
    </GrowthCard>
  );
}
