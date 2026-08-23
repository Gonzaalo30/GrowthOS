import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessesByOwner } from "@/services/business.service";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string; nuevo?: string }>;
}) {
  const { domain, nuevo } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const existingBusinesses = await getBusinessesByOwner(supabase, user.id);
  // "nuevo=1" es el único caso en que se entra a onboarding teniendo ya
  // negocios: añadir otro. Sin ese parámetro, siempre se redirige al dashboard
  // para no repetir el asistente por accidente.
  if (existingBusinesses.length > 0 && !nuevo) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <OnboardingForm domain={domain} />
    </div>
  );
}
