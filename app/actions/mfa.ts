"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export interface MfaFactor {
  id: string;
  status: "verified" | "unverified";
}

export async function listMfaFactorsAction(): Promise<MfaFactor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.auth.mfa.listFactors();
  if (error) return [];
  return data.totp.map((f) => ({ id: f.id, status: f.status }));
}

export interface MfaEnrollState {
  error?: string;
  factorId?: string;
  qrCode?: string;
  secret?: string;
}

export async function enrollMfaAction(): Promise<MfaEnrollState> {
  const supabase = await createClient();

  // Un intento anterior sin terminar deja un factor "unverified" a medias —
  // se limpia antes de empezar uno nuevo, para no acumular basura. `totp`
  // solo lista los ya verificados; los no verificados solo aparecen en `all`.
  const { data: existing } = await supabase.auth.mfa.listFactors();
  const stale = existing?.all.filter((f) => f.factor_type === "totp" && f.status === "unverified") ?? [];
  for (const factor of stale) {
    await supabase.auth.mfa.unenroll({ factorId: factor.id });
  }

  const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp" });
  if (error) return { error: error.message };

  return { factorId: data.id, qrCode: data.totp.qr_code, secret: data.totp.secret };
}

export interface MfaVerifyState {
  error?: string;
  success?: boolean;
}

export async function verifyMfaEnrollmentAction(
  _prevState: MfaVerifyState,
  formData: FormData,
): Promise<MfaVerifyState> {
  const factorId = String(formData.get("factorId") ?? "");
  const code = String(formData.get("code") ?? "").trim();
  if (!factorId || !code) return { error: "Introduce el código de tu app de verificación." };

  const supabase = await createClient();
  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId });
  if (challengeError) return { error: "No hemos podido verificar el código. Inténtalo de nuevo." };

  const { error } = await supabase.auth.mfa.verify({ factorId, challengeId: challenge.id, code });
  if (error) return { error: "Código incorrecto. Comprueba la hora de tu móvil y vuelve a intentarlo." };

  revalidatePath("/account");
  return { success: true };
}

export async function disableMfaAction(factorId: string): Promise<MfaVerifyState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.mfa.unenroll({ factorId });
  if (error) return { error: "No hemos podido desactivar la verificación en dos pasos." };

  revalidatePath("/account");
  return { success: true };
}

export async function verifyLoginMfaAction(
  _prevState: MfaVerifyState,
  formData: FormData,
): Promise<MfaVerifyState> {
  const code = String(formData.get("code") ?? "").trim();
  if (!code) return { error: "Introduce el código de tu app de verificación." };

  const supabase = await createClient();
  const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (listError || !factor) {
    // Sin factor verificado no hay nada que comprobar — no debería llegar
    // aquí, pero si pasa, mejor dejar seguir que atascar al usuario.
    redirect("/dashboard");
  }

  const { data: challenge, error: challengeError } = await supabase.auth.mfa.challenge({ factorId: factor.id });
  if (challengeError) return { error: "No hemos podido verificar el código. Inténtalo de nuevo." };

  const { error } = await supabase.auth.mfa.verify({ factorId: factor.id, challengeId: challenge.id, code });
  if (error) return { error: "Código incorrecto. Comprueba la hora de tu móvil y vuelve a intentarlo." };

  redirect("/dashboard");
}

export async function signOutOtherSessionsAction(): Promise<MfaVerifyState> {
  const supabase = await createClient();
  const { error } = await supabase.auth.signOut({ scope: "others" });
  if (error) return { error: "No hemos podido cerrar el resto de sesiones. Inténtalo de nuevo." };
  return { success: true };
}
