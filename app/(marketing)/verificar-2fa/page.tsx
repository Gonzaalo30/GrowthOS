import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VerifyMfaForm } from "@/features/auth/VerifyMfaForm";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function Verificar2faPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Si no hace falta subir a aal2 (no tiene 2FA, o ya lo verificó esta
  // sesión), esta página no pinta nada — se manda directo al dashboard.
  const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (!aal || aal.nextLevel !== "aal2" || aal.currentLevel === aal.nextLevel) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <VerifyMfaForm />
    </div>
  );
}
