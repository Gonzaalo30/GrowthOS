import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getProfile } from "@/services/profile.service";
import { getBillingInfo, listInvoices, type BillingInfo, type InvoiceSummary } from "@/services/billing.service";
import { getStripe } from "@/lib/stripe";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { Achievements } from "@/components/growth/Achievements";
import { ProfileForm } from "@/features/account/ProfileForm";
import { BusinessForm } from "@/features/account/BusinessForm";
import { BillingInfoForm } from "@/features/account/BillingInfoForm";
import { AvatarUpload } from "@/features/account/AvatarUpload";
import { PasswordForm } from "@/features/account/PasswordForm";
import { PreferencesForm } from "@/features/account/PreferencesForm";
import { TwoFactorForm } from "@/features/account/TwoFactorForm";
import { SignOutOtherSessionsButton } from "@/features/account/SignOutOtherSessionsButton";
import { listMfaFactorsAction } from "@/app/actions/mfa";
import { InvoiceHistory } from "@/components/account/InvoiceHistory";
import { createBillingPortalSessionAction } from "@/app/actions/subscription";
import { getAchievementsForBusiness } from "@/services/achievementSummary.service";
import { getPlan } from "@/lib/plans";
import { getLevelProgress, getLevelRingClass } from "@/lib/levels";

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

  const hasActiveSubscription = business.subscription_status === "active";
  const currentPlan = getPlan(business.plan);
  const mfaFactors = await listMfaFactorsAction();
  const levelProgress = getLevelProgress(business.xp);
  const achievements = await getAchievementsForBusiness(supabase, business);

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
          <GrowthCard glow>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">Tu perfil</h2>
            <div className="mb-2">
              <AvatarUpload
                name={profile.name}
                avatarUrl={profile.avatar_url}
                ringClass={getLevelRingClass(levelProgress.level.name)}
              />
            </div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <LevelBadge level={levelProgress.level} />
              <StreakBadge days={business.streak_count} />
              {profile.title && <span className="text-sm text-zinc-600">{profile.title}</span>}
            </div>
            <ProfileForm name={profile.name} email={profile.email} title={profile.title} />
          </GrowthCard>

          <GrowthCard>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              <span aria-hidden>⚙️</span> Ajustes
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-zinc-500">Contraseña</h3>
                <PasswordForm />
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-xs font-semibold text-zinc-500">Preferencias</h3>
                <PreferencesForm dateFormat={profile.date_format} />
              </div>
            </div>
          </GrowthCard>

          <GrowthCard>
            <h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-zinc-500">
              <span aria-hidden>🔒</span> Seguridad
            </h2>
            <div className="flex flex-col gap-6">
              <div>
                <h3 className="mb-2 text-xs font-semibold text-zinc-500">Verificación en dos pasos</h3>
                <TwoFactorForm factors={mfaFactors} />
              </div>
              <div className="border-t border-border pt-4">
                <h3 className="mb-2 text-xs font-semibold text-zinc-500">Sesiones</h3>
                <SignOutOtherSessionsButton />
              </div>
            </div>
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
                  {hasActiveSubscription ? (
                    <span className="font-medium text-emerald-700">Plan {currentPlan.name} activo ✓</span>
                  ) : (
                    "Estás en el plan gratuito."
                  )}
                </p>
              </div>
              <div className="flex flex-col items-end gap-2">
                {hasActiveSubscription && (
                  <form action={createBillingPortalSessionAction}>
                    <Button type="submit" variant="secondary">
                      Gestionar suscripción
                    </Button>
                  </form>
                )}
                <Link href="/precios" className="text-xs font-medium text-brand-600 underline underline-offset-2">
                  {hasActiveSubscription ? "Ver otros planes" : "Ver planes de pago"}
                </Link>
              </div>
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
              <InvoiceHistory invoices={invoices} dateFormat={profile.date_format} />
            </GrowthCard>
          )}

          {achievements.length > 0 && <Achievements achievements={achievements} />}
        </div>
      </div>
    </div>
  );
}
