import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UpdatePasswordForm } from "@/features/auth/UpdatePasswordForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Restablecer contraseña",
  description: "Elige una nueva contraseña para tu cuenta de GrowthOS.",
  path: "/restablecer-contrasena",
  noIndex: true,
});

export default async function RestablecerContrasenaPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  // Sin sesión de recuperación real (enlace caducado, ya usado, o entrada
  // directa a la URL): de vuelta a pedir un enlace nuevo.
  if (!user) redirect("/recuperar-contrasena?error=enlace_caducado");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <UpdatePasswordForm />
    </div>
  );
}
