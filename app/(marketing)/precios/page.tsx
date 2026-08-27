import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { PricingPlans } from "@/features/billing/PricingPlans";
import { PLANS } from "@/lib/plans";
import { OPPORTUNITIES } from "@/lib/opportunities";
import { pageMetadata, SITE_URL } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Precios",
  description:
    "Precio cerrado y sin sorpresas: plan Gratis, Growth (29€/mes), Autopilot (99€/mes) y Agencia. Además, mejoras sueltas de SEO, velocidad y conversión con precio fijo.",
  path: "/precios",
});

function formatOpportunityPrice(cents: number, pricing: "one_time" | "monthly", priceIsFrom?: boolean) {
  const amount = `${(cents / 100).toLocaleString("es-ES")} €`;
  const withCadence = pricing === "monthly" ? `${amount}/mes` : amount;
  return priceIsFrom ? `Desde ${withCadence}` : withCadence;
}

export default async function PreciosPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const business = user ? await getActiveBusiness(supabase, user.id) : null;
  const hasActiveSubscription = business?.subscription_status === "active";

  // Ofertas reales de los planes de pago, tal cual se cobran — nada de
  // precios "desde" inventados ni planes que no existen todavía.
  const offersJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GrowthOS",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    offers: PLANS.filter((plan) => plan.priceCents > 0).map((plan) => ({
      "@type": "Offer",
      name: plan.name,
      price: (plan.priceCents / 100).toFixed(2),
      priceCurrency: "EUR",
      description: plan.tagline,
      url: `${SITE_URL}/precios`,
    })),
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-10 px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(offersJsonLd) }}
      />
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Precios</h1>
        <p className="mt-3 text-zinc-600">Sin presupuestos ni sorpresas. Precio cerrado en todo.</p>
      </div>

      <PricingPlans
        plans={PLANS}
        isLoggedIn={Boolean(user)}
        currentPlanId={business?.plan}
        hasActiveSubscription={hasActiveSubscription}
      />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Mejoras a la carta
        </h2>
        <p className="mb-1 text-sm text-zinc-600">
          Independientemente de tu plan, cuando algo requiere trabajo técnico puedes pedir que lo
          implementemos nosotros por un precio cerrado — mejoras puntuales de pago único, y también
          servicios recurrentes (gestión mensual de tu ficha de Google, mantenimiento de la web) para lo
          que necesita atención continua, no solo un arreglo puntual.
        </p>
        <p className="mb-4 text-xs text-zinc-500">
          Tras la compra, uno de nuestros expertos te contacta por email o teléfono en menos de 24-48h
          laborables para pedirte los accesos necesarios (a tu web, tu ficha de Google, hosting, etc.) y
          ponerse manos a la obra — compatible con WordPress, Shopify, Wix y sitios a medida. Precios con
          IVA incluido.
        </p>
        <div className="flex flex-col gap-3">
          {OPPORTUNITIES.map((item) => (
            <GrowthCard key={item.id} className="flex items-center justify-between gap-3">
              <span className="text-sm font-medium text-foreground">{item.title}</span>
              <span className="whitespace-nowrap text-sm font-semibold text-brand-600">
                {formatOpportunityPrice(item.priceCents, item.pricing, item.priceIsFrom)}
              </span>
            </GrowthCard>
          ))}
        </div>
        <Link href={user ? "/marketplace" : "/signup"} className="mt-4 inline-block">
          <Button variant="secondary">
            {user ? "Ir al Centro de Mejoras" : "Crea tu cuenta gratis para comprar"}
          </Button>
        </Link>
      </div>
    </div>
  );
}
