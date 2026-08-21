import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackEvent } from "@/lib/analytics";

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
      if (businessId) {
        await supabase
          .from("businesses")
          .update({
            stripe_customer_id:
              typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null),
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
            subscription_status: "active",
          })
          .eq("id", businessId);
        await trackEvent(supabase, "checkout_completed", businessId);
      }
      break;
    }
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const businessId = subscription.metadata?.business_id;
      if (businessId) {
        await supabase
          .from("businesses")
          .update({ subscription_status: subscription.status })
          .eq("id", businessId);
      }
      break;
    }
    default:
      break;
  }

  return NextResponse.json({ received: true });
}
