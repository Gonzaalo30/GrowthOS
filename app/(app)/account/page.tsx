import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import { getBillingInfo, listInvoices, type BillingInfo, type InvoiceSummary } from "@/services/billing.service";
import { getStripe } from "@/lib/stripe";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { ProfileForm } from "@/features/account/ProfileForm";
import { BusinessForm } from "@/features/account/BusinessForm";
import { BillingInfoForm } from "@/features/account/BillingInfoForm";
import { InvoiceHistory } from "@/components/account/InvoiceHistory";
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

  // Facturación real de Stripe: si algo falla al leerla, el resto de la
  // página (perfil, negocio, plan) debe seguir funcionando igualmente.
  let billingInfo: BillingInfo | null = null;
  let invoices: InvoiceSummary[] = [];
  if (business.stripe_customer_id) {
    try {
      const stripe = getStripe();
      [billingInfo, invoices] = await Promise.all([
        getBillingInfo(stripe, business.stripe_customer_id),
        listInvoices(stripe, business.stripe_customer_id),
      ]);
    } catch {
      // se muestra como si no hubiera facturación todavía, en vez de romper la página
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-6 py-12">
      <h1 className="text-xl font-semibold text-foreground">Mi cuenta</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-start">
        <div className="flex flex-col gap-6">
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

          {billingInfo && (
            <GrowthCard>
              <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Datos de facturación
              </h2>
              <p className="mb-3 text-sm text-zinc-600">
                Con esto tus próximas facturas saldrán a tu nombre o al de tu negocio, con NIF/CIF si lo
                necesitas para tu contabilidad.
              </p>
              <BillingInfoForm billingInfo={billingInfo} />
            </GrowthCard>
          )}
        </div>

        <div className="flex flex-col gap-6">
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

          {business.stripe_customer_id && (
            <GrowthCard>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Historial de facturas
              </h2>
              <InvoiceHistory invoices={invoices} />
            </GrowthCard>
          )}
        </div>
      </div>
    </div>
  );
}
