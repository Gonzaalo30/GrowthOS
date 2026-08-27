import { RequestPasswordResetForm } from "@/features/auth/RequestPasswordResetForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Recuperar contraseña",
  description: "¿Has olvidado tu contraseña de GrowthOS? Te enviamos un enlace para elegir una nueva.",
  path: "/recuperar-contrasena",
  noIndex: true,
});

export default async function RecuperarContrasenaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <RequestPasswordResetForm error={error} />
    </div>
  );
}
