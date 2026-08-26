"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";

export interface SignUpState {
  error?: string;
  success?: boolean;
}

export interface LoginState {
  error?: string;
}

export async function loginAction(
  _prevState: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!email || !password) {
    return { error: "Introduce tu email y contraseña." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Email o contraseña incorrectos." };
  }

  // Si la cuenta tiene verificación en dos pasos activada, la contraseña
  // sola solo llega a "aal1" — hace falta el código de la app para subir a
  // "aal2" antes de dejar pasar al dashboard.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (aal && aal.nextLevel === "aal2" && aal.currentLevel !== aal.nextLevel) {
    redirect("/verificar-2fa");
  }

  redirect("/dashboard");
}

export async function signUpAction(
  _prevState: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const domain = String(formData.get("domain") ?? "").trim();

  if (!name || !email || password.length < 8) {
    return { error: "Revisa tus datos: la contraseña debe tener al menos 8 caracteres." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const next = domain ? `/onboarding?domain=${encodeURIComponent(domain)}` : "/onboarding";

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name },
      emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  });

  if (error) {
    return { error: error.message };
  }

  await trackEvent(supabase, "signup_completed", null);
  return { success: true };
}

/**
 * Inicio de sesión social con Google, vía el proveedor OAuth nativo de
 * Supabase Auth — totalmente distinto de la integración de Search
 * Console/Analytics (esa usa su propio cliente OAuth en `lib/googleApis.ts`,
 * con más permisos y guardando un refresh token cifrado). Aquí solo pedimos
 * identidad básica (email/nombre) para entrar o crear cuenta.
 */
export async function signInWithGoogleAction(formData: FormData) {
  const domain = String(formData.get("domain") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/login");
  const next = domain ? `/onboarding?domain=${encodeURIComponent(domain)}` : "/dashboard";

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const callbackUrl = new URL(`${origin}/auth/callback`);
  callbackUrl.searchParams.set("next", next);
  callbackUrl.searchParams.set("onError", `${returnTo}?error=google_fallido`);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl.toString() },
  });

  if (error || !data.url) {
    redirect(`${returnTo}?error=google_fallido`);
  }

  redirect(data.url);
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
