import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { OnboardingForm } from "@/features/onboarding/OnboardingForm";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<{ domain?: string }>;
}) {
  const { domain } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/signup");

  const existingBusiness = await getBusinessByOwner(supabase, user.id);
  if (existingBusiness) redirect("/dashboard");

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-16">
      <OnboardingForm domain={domain} />
    </div>
  );
}
