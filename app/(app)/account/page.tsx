import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "@/features/account/ProfileForm";
import { BusinessForm } from "@/features/account/BusinessForm";
import { createBillingPortalSessionAction } from "@/app/actions/subscription";

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ billingError?: string }>;
}) {
  const { billingError } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [profile, business] = await Promise.all([
    getProfile(supabase, user.id),
    getBusinessByOwner(supabase, user.id),
  ]);

  if (!business) redirect("/onboarding");

  const isAutopilot = business.subscription_status === "active";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-12">
      <h1 className="text-xl font-semibold text-foreground">Mi cuenta</h1>

      <GrowthCard>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Tu perfil</h2>
        <ProfileForm name={profile.name} email={profile.email} />
      </GrowthCard>

      <GrowthCard>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Tu negocio</h2>
        <BusinessForm
          domain={business.domain}
          businessType={business.business_type}
          city={business.city}
          companySize={business.company_size}
        />
      </GrowthCard>

      <GrowthCard className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Tu plan</h2>
            <p className="mt-1 text-sm text-zinc-600">
              {isAutopilot ? (
                <span className="font-medium text-emerald-700">Plan Autopilot activo ✓</span>
              ) : (
                "Estás en el plan gratuito."
              )}
            </p>
          </div>
          {isAutopilot ? (
            <form action={createBillingPortalSessionAction}>
              <Button type="submit" variant="secondary">
                Gestionar suscripción
              </Button>
            </form>
          ) : (
            <Link href="/plan-autopilot">
              <Button variant="secondary">Ver Plan Autopilot</Button>
            </Link>
          )}
        </div>
        {billingError && (
          <p className="text-sm text-red-600">
            No hemos podido abrir la gestión de tu suscripción. Inténtalo de nuevo en un momento, o
            escríbenos si sigue fallando.
          </p>
        )}
      </GrowthCard>
    </div>
  );
}
