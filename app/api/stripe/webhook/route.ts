import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackEvent } from "@/lib/analytics";
import { planIdForPriceId, type PlanId } from "@/lib/plans";
import { OPPORTUNITIES } from "@/lib/opportunities";

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: "Webhook no configurado" }, { status: 400 });
  }

  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Firma inválida" }, { status: 400 });
  }

  const supabase = createAdminClient();

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const businessId = session.metadata?.business_id ?? session.client_reference_id ?? undefined;

      if (session.metadata?.type === "opportunity") {
        const opportunity = OPPORTUNITIES.find((o) => o.id === session.metadata?.opportunity_id);
        if (businessId && opportunity) {
          const customerId =
            typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
          await supabase.from("opportunity_requests").insert({
            business_id: businessId,
            opportunity_id: opportunity.id,
            title: opportunity.title,
            price_cents: opportunity.priceCents,
            paid: true,
            paid_at: new Date().toISOString(),
            stripe_checkout_session_id: session.id,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
          });
          // Si el negocio todavía no tenía cliente de Stripe (nunca contrató un
          // plan), guardamos el que se acaba de crear al comprar la mejora, para
          // que el Portal de Cliente de /account también sirva para gestionarla.
          if (customerId) {
            await supabase
              .from("businesses")
              .update({ stripe_customer_id: customerId })
              .eq("id", businessId)
              .is("stripe_customer_id", null);
          }
          await trackEvent(supabase, "opportunity_purchased", businessId, { opportunityId: opportunity.id });
        }
        break;
      }

      const plan = (session.metadata?.plan as PlanId | undefined) ?? "starter";
      if (businessId) {
        await supabase
          .from("businesses")
          .update({
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
            subscription_status: "active",
            plan,
          })
          .eq("id", businessId);
        await trackEvent(supabase, "checkout_completed", businessId, { plan });
      }
      break;
    }
    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      // Una mejora mensual del Centro de Mejoras es también una suscripción de
      // Stripe del mismo cliente, pero no tiene "plan" en su metadata — sin este
      // filtro, cualquier cambio en ella pisaría el plan real del negocio.
      if (!subscription.metadata?.plan) break;
      const businessId = subscription.metadata?.business_id;
      if (businessId) {
        // Un cambio de plan hecho desde el Portal de Cliente de Stripe cambia el
        // price del item, no la metadata — por eso el plan se deriva del price
        // actual, no de un campo que solo se rellena al crear el checkout.
        const priceId = subscription.items.data[0]?.price?.id;
        const plan = planIdForPriceId(priceId) ?? "starter";
        await supabase
          .from("businesses")
          .update({ subscription_status: subscription.status, plan })
          .eq("id", businessId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      if (!subscription.metadata?.plan) break;
      const businessId = subscription.metadata?.business_id;
      if (businessId) {
        await supabase
          .from("businesses")
          .update({ subscription_status: subscription.status, plan: "starter" })
          .eq("id", businessId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
