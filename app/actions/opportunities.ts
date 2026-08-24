"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { getStripe } from "@/lib/stripe";
import { OPPORTUNITIES } from "@/lib/opportunities";

export async function createOpportunityCheckoutAction(opportunityId: string) {
  const opportunity = OPPORTUNITIES.find((o) => o.id === opportunityId);
  if (!opportunity) throw new Error("Mejora no encontrada");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const isMonthly = opportunity.pricing === "monthly";
  const loyaltyCouponId = process.env.STRIPE_LOYALTY_COUPON_ID;
  const applyLoyaltyDiscount = business.loyalty_discount_available && Boolean(loyaltyCouponId);

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: isMonthly ? "subscription" : "payment",
      line_items: [
        {
          price_data: {
            currency: "eur",
            unit_amount: opportunity.priceCents,
            product_data: {
              name: opportunity.title,
              description: opportunity.description,
            },
            ...(isMonthly ? { recurring: { interval: "month" as const } } : {}),
          },
          quantity: 1,
        },
      ],
      success_url: `${origin}/marketplace?compra=exito&item=${opportunity.id}`,
      cancel_url: `${origin}/marketplace?compra=cancelado`,
      client_reference_id: business.id,
      // Reutilizamos el mismo cliente de Stripe que el de la suscripción de plan
      // si ya existe, para que "Gestionar suscripción" en /account muestre
      // también las mejoras recurrentes compradas aquí, no solo el plan.
      ...(business.stripe_customer_id
        ? { customer: business.stripe_customer_id }
        : { customer_email: user.email }),
      metadata: { type: "opportunity", business_id: business.id, opportunity_id: opportunity.id },
      ...(isMonthly
        ? {
            subscription_data: {
              metadata: { type: "opportunity", business_id: business.id, opportunity_id: opportunity.id },
            },
          }
        : {}),
      managed_payments: { enabled: false },
      // El 5% de fidelidad (ganado en la primera compra) se aplica explícito
      // aquí para no depender del cupón por defecto del cliente en Stripe.
      ...(applyLoyaltyDiscount ? { discounts: [{ coupon: loyaltyCouponId }] } : {}),
    });
    sessionUrl = session.url;
  } catch {
    redirect(`${origin}/marketplace?compra=error`);
  }

  if (!sessionUrl) {
    redirect(`${origin}/marketplace?compra=error`);
  }

  redirect(sessionUrl);
}
