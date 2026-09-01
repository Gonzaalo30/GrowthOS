"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getStripe } from "@/lib/stripe";

/**
 * Suscripción base de Agencia (99€/mes, hasta 5 negocios) — a nivel de
 * cuenta, no de negocio: por eso el `client_reference_id`/metadata es el
 * owner_id del perfil, no un business_id como en `createPlanCheckoutAction`.
 * El webhook (checkout.session.completed, metadata.type === "agencia")
 * convierte los negocios actuales del owner a plan 'agencia'.
 */
export async function createAgencyCheckoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const priceId = process.env.STRIPE_AGENCIA_PRICE_ID;
  if (!priceId) {
    redirect("/plan-agencia?error=no_configurado");
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  // El precio de lib/plans.ts es base (sin IVA) — el 21% se añade aquí de
  // verdad en el cobro, no solo en el texto de la web.
  const ivaTaxRateId = process.env.STRIPE_IVA_TAX_RATE_ID;

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: priceId, quantity: 1, ...(ivaTaxRateId ? { tax_rates: [ivaTaxRateId] } : {}) },
      ],
      success_url: `${origin}/dashboard?plan=success`,
      cancel_url: `${origin}/plan-agencia?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { type: "agencia", owner_id: user.id },
      subscription_data: { metadata: { type: "agencia", owner_id: user.id } },
      managed_payments: { enabled: false },
    });
    sessionUrl = session.url;
  } catch {
    redirect("/plan-agencia?error=conexion_fallida");
  }

  if (!sessionUrl) {
    redirect("/plan-agencia?error=conexion_fallida");
  }

  redirect(sessionUrl);
}

/**
 * Slot extra de Agencia (15€/mes recurrente, +1 negocio de capacidad). Se
 * puede comprar varias veces — cada compra suma 1 a `agency_extra_slots`.
 */
export async function createAgencyExtraSlotCheckoutAction() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("agency_subscription_status")
    .eq("id", user.id)
    .maybeSingle();
  if (profile?.agency_subscription_status !== "active") {
    redirect("/plan-agencia?error=sin_agencia_activa");
  }

  const priceId = process.env.STRIPE_AGENCIA_EXTRA_SLOT_PRICE_ID;
  if (!priceId) {
    redirect("/plan-agencia?error=no_configurado");
  }

  const origin = (await headers()).get("origin") ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const ivaTaxRateId = process.env.STRIPE_IVA_TAX_RATE_ID;

  let sessionUrl: string | null;
  try {
    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      line_items: [
        { price: priceId, quantity: 1, ...(ivaTaxRateId ? { tax_rates: [ivaTaxRateId] } : {}) },
      ],
      success_url: `${origin}/onboarding?nuevo=1&agencia_slot=success`,
      cancel_url: `${origin}/account?canceled=1`,
      client_reference_id: user.id,
      customer_email: user.email,
      metadata: { type: "agencia_extra_slot", owner_id: user.id },
      managed_payments: { enabled: false },
    });
    sessionUrl = session.url;
  } catch {
    redirect("/account?billingError=1");
  }

  if (!sessionUrl) {
    redirect("/account?billingError=1");
  }

  redirect(sessionUrl);
}
