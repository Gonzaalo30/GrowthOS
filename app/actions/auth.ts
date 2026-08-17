"use server";

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";

export interface SignUpState {
  error?: string;
  success?: boolean;
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

  return { success: true };
}
