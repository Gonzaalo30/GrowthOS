"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { getStripe } from "@/lib/stripe";
import { getPlan, type PlanId } from "@/lib/plans";

export interface CheckoutState {
  error?: string;
}

export async function createPlanCheckoutAction(
  planId: PlanId,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState exige esta firma aunque no se use el estado previo
  _prevState: CheckoutState,
): Promise<CheckoutState> {
  const plan = getPlan(planId);
  if (plan.id === "starter") {
    return { error: "El plan Gratis no necesita pago." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  const priceId = process.env[plan.priceEnvVar];
  if (!priceId) {
    return { error: `El plan ${plan.name} todavía no está disponible para suscripción. Vuelve pronto.` };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?plan=success`,
      cancel_url: `${origin}/precios?canceled=1`,
      client_reference_id: business.id,
      customer_email: user.email,
      metadata: { business_id: business.id, plan: plan.id },
      subscription_data: { metadata: { business_id: business.id, plan: plan.id } },
      // Managed Payments (Stripe como merchant of record) exige código de impuestos
      // por producto; lo desactivamos porque el MVP no lo necesita todavía.
      managed_payments: { enabled: false },
    });
    sessionUrl = session.url;
  } catch {
    return { error: "No hemos podido conectar con el pago. Inténtalo de nuevo en un momento." };
  }

  if (!sessionUrl) {
    return { error: "No hemos podido iniciar el pago. Inténtalo de nuevo." };
  }

  redirect(sessionUrl);
}

/**
 * Lleva al Portal de Cliente de Stripe: desde ahí se puede cancelar, cambiar
 * de plan (Growth ⟷ Autopilot), cambiar el método de pago o ver facturas.
 * Los webhooks (`customer.subscription.updated/deleted`) reflejan solos
 * cualquier cambio hecho ahí — no hace falta lógica propia de cambio de plan.
 */
export async function createBillingPortalSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  if (!business.stripe_customer_id) {
    redirect("/account?billingError=1");
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let portalUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.billingPortal.sessions.create({
      customer: business.stripe_customer_id,
      return_url: `${origin}/account`,
    });
    portalUrl = session.url;
  } catch {
    redirect("/account?billingError=1");
  }

  redirect(portalUrl);
}
