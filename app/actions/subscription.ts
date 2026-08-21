"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getBusinessByOwner } from "@/services/business.service";
import { getStripe } from "@/lib/stripe";

export interface CheckoutState {
  error?: string;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- useActionState exige esta firma aunque no se use el estado previo
export async function createAutopilotCheckoutAction(_prevState: CheckoutState): Promise<CheckoutState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getBusinessByOwner(supabase, user.id);
  if (!business) redirect("/onboarding");

  const priceId = process.env.STRIPE_AUTOPILOT_PRICE_ID;
  if (!priceId) {
    return { error: "El Plan Autopilot todavía no está disponible para suscripción. Vuelve pronto." };
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${origin}/dashboard?autopilot=success`,
      cancel_url: `${origin}/plan-autopilot?canceled=1`,
      client_reference_id: business.id,
      customer_email: user.email,
      metadata: { business_id: business.id },
      subscription_data: { metadata: { business_id: business.id } },
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
 * el método de pago o ver facturas. Cuando el usuario cancela allí, el
 * webhook (`customer.subscription.deleted`) actualiza `subscription_status`
 * solo — no hace falta lógica de cancelación propia.
 */
export async function createBillingPortalSessionAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getBusinessByOwner(supabase, user.id);
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
