import { LoginForm } from "@/features/auth/LoginForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Inicia sesión",
  description: "Entra en tu cuenta de GrowthOS para ver tu Growth Score y tus misiones de hoy.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <LoginForm error={error} />
    </div>
  );
}
