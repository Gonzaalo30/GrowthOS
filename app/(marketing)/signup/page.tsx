import { SignupForm } from "@/features/auth/SignupForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Crea tu cuenta gratis",
  description: "Regístrate gratis en GrowthOS y consigue tu Growth Score y tus primeras misiones en menos de un minuto.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; error?: string }>;
}) {
  const { domain, error } = await searchParams;

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <SignupForm domain={domain} error={error} />
    </div>
  );
}
