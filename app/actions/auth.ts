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

export interface RequestPasswordResetState {
  success?: boolean;
  error?: string;
}

/**
 * Siempre responde con "éxito" (nunca revela si el email existe o no en el
 * sistema) — evita que este formulario se use para comprobar qué cuentas
 * están registradas.
 */
export async function requestPasswordResetAction(
  _prevState: RequestPasswordResetState,
  formData: FormData,
): Promise<RequestPasswordResetState> {
  const email = String(formData.get("email") ?? "").trim();
  if (!email) {
    return { error: "Introduce tu email." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const next = encodeURIComponent("/restablecer-contrasena");

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${origin}/auth/callback?next=${next}`,
  });

  return { success: true };
}

export interface UpdatePasswordState {
  error?: string;
}

export async function updatePasswordAction(
  _prevState: UpdatePasswordState,
  formData: FormData,
): Promise<UpdatePasswordState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) {
    return { error: "La contraseña debe tener al menos 8 caracteres." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión (enlace caducado o ya usado): de vuelta a pedir uno nuevo,
  // no tiene sentido mostrar el formulario de contraseña sin nada que actualizar.
  if (!user) redirect("/recuperar-contrasena?error=enlace_caducado");

  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    return { error: "No hemos podido actualizar tu contraseña. Inténtalo de nuevo." };
  }

  redirect("/dashboard?password=actualizada");
}

export async function signOutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
