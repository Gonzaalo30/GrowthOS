import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { trackEvent } from "@/lib/analytics";
import { planIdForPriceId, agencyIncludedCapacity, type PlanId } from "@/lib/plans";
import { OPPORTUNITIES } from "@/lib/opportunities";
import { createNotification } from "@/services/notification.service";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type BusinessLoyaltyUpdate = Partial<{ loyalty_discount_available: boolean; loyalty_discount_used: boolean }>;

/**
 * Decide si esta compra concede el 5% de fidelidad (primera compra de
 * siempre) o lo consume (ya tenía uno pendiente disponible). El descuento en
 * sí se aplica en el checkout que lo usa (parámetro `discounts` en la
 * Session) o, para el camino del Portal de Stripe, en
 * `createBillingPortalSessionAction` — aquí solo se lleva la cuenta en la
 * propia base de datos.
 */
async function resolveLoyaltyDiscountUpdate(
  supabase: SupabaseClient<Database>,
  businessId: string,
): Promise<BusinessLoyaltyUpdate> {
  const { data: business } = await supabase
    .from("businesses")
    .select("stripe_customer_id, loyalty_discount_available, loyalty_discount_used")
    .eq("id", businessId)
    .single();
  if (!business) return {};

  if (business.loyalty_discount_available) {
    return { loyalty_discount_available: false, loyalty_discount_used: true };
  }

  if (!business.stripe_customer_id && !business.loyalty_discount_used) {
    // Es literalmente su primera compra de siempre.
    return { loyalty_discount_available: true };
  }

  return {};
}

/**
 * Contador real de "compras de plan" — solo sube aquí, al comprar un plan
 * nuevo por checkout (nunca al cambiar de plan desde el Portal, eso es
 * `customer.subscription.updated`, no una compra nueva). Base real para los
 * logros de "compra X veces" en `lib/achievements.ts`.
 */
async function incrementPlanPurchaseCount(supabase: SupabaseClient<Database>, businessId: string): Promise<number> {
  const { data: business } = await supabase
    .from("businesses")
    .select("plan_purchase_count")
    .eq("id", businessId)
    .single();
  const next = (business?.plan_purchase_count ?? 0) + 1;
  await supabase.from("businesses").update({ plan_purchase_count: next }).eq("id", businessId);
  return next;
}

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

      if (session.metadata?.type === "agencia") {
        const ownerId = session.metadata?.owner_id;
        if (ownerId) {
          const customerId =
            typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
          const subscriptionId =
            typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null);

          await supabase
            .from("profiles")
            .update({
              agency_stripe_customer_id: customerId,
              agency_stripe_subscription_id: subscriptionId,
              agency_subscription_status: "active",
            })
            .eq("id", ownerId);

          // Los negocios actuales del owner (hasta 5, los más antiguos primero)
          // suben a plan 'agencia' — se respetan los que ya estén en Autopilot,
          // no se les baja de nivel silenciosamente al comprar Agencia.
          const { data: ownedBusinesses } = await supabase
            .from("businesses")
            .select("id, plan, created_at")
            .eq("owner_id", ownerId)
            .neq("plan", "autopilot")
            .order("created_at", { ascending: true })
            .limit(5);
          for (const b of ownedBusinesses ?? []) {
            await supabase.from("businesses").update({ plan: "agencia" }).eq("id", b.id);
          }

          await createNotification(supabase, ownerId, "🏢 Tu suscripción de Agencia está activa.");
          await trackEvent(supabase, "agency_checkout_completed", null);
        }
        break;
      }

      if (session.metadata?.type === "agencia_extra_slot") {
        const ownerId = session.metadata?.owner_id;
        if (ownerId) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("agency_extra_slots")
            .eq("id", ownerId)
            .single();
          const nextSlots = (profile?.agency_extra_slots ?? 0) + 1;
          await supabase.from("profiles").update({ agency_extra_slots: nextSlots }).eq("id", ownerId);
          await createNotification(
            supabase,
            ownerId,
            `🏢 Slot extra de Agencia activado — ya puedes gestionar hasta ${agencyIncludedCapacity(nextSlots)} negocios.`,
          );
          await trackEvent(supabase, "agency_extra_slot_purchased", null);
        }
        break;
      }

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

          const loyaltyUpdate = await resolveLoyaltyDiscountUpdate(supabase, businessId);

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
          if (Object.keys(loyaltyUpdate).length > 0) {
            await supabase.from("businesses").update(loyaltyUpdate).eq("id", businessId);
            if (loyaltyUpdate.loyalty_discount_available) {
              await createNotification(supabase, businessId, "🎁 Has ganado un 5% de descuento para tu próxima compra.");
            }
          }
          await trackEvent(supabase, "opportunity_purchased", businessId, { opportunityId: opportunity.id });
        }
        break;
      }

      const plan = (session.metadata?.plan as PlanId | undefined) ?? "starter";
      if (businessId) {
        const customerId =
          typeof session.customer === "string" ? session.customer : (session.customer?.id ?? null);
        const loyaltyUpdate = await resolveLoyaltyDiscountUpdate(supabase, businessId);
        await supabase
          .from("businesses")
          .update({
            stripe_customer_id: customerId,
            stripe_subscription_id:
              typeof session.subscription === "string" ? session.subscription : (session.subscription?.id ?? null),
            subscription_status: "active",
            plan,
            ...loyaltyUpdate,
          })
          .eq("id", businessId);
        await incrementPlanPurchaseCount(supabase, businessId);
        if (loyaltyUpdate.loyalty_discount_available) {
          await createNotification(supabase, businessId, "🎁 Has ganado un 5% de descuento para tu próxima compra.");
        }
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
        const update: Database["public"]["Tables"]["businesses"]["Update"] = {
          subscription_status: subscription.status,
          plan,
        };

        // El cupón "once" del 5% de fidelidad, si se adjuntó a esta
        // suscripción antes de entrar al Portal (ver
        // createBillingPortalSessionAction), se retira solo al consumirse en
        // la factura del cambio de plan — así detectamos que se acaba de
        // gastar por ese camino, que no controlamos directamente.
        if (subscription.discounts.length === 0) {
          const { data: business } = await supabase
            .from("businesses")
            .select("loyalty_discount_available")
            .eq("id", businessId)
            .single();
          if (business?.loyalty_discount_available) {
            update.loyalty_discount_available = false;
            update.loyalty_discount_used = true;
          }
        }

        await supabase.from("businesses").update(update).eq("id", businessId);
      }
      break;
    }
    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      if (subscription.metadata?.type === "agencia") {
        const ownerId = subscription.metadata?.owner_id;
        if (ownerId) {
          await supabase
            .from("profiles")
            .update({ agency_subscription_status: "canceled" })
            .eq("id", ownerId);
          // Los negocios que estaban en 'agencia' vuelven a 'starter' — igual
          // que cancelar Growth/Autopilot revierte el negocio a 'starter'.
          await supabase
            .from("businesses")
            .update({ plan: "starter", subscription_status: "canceled" })
            .eq("owner_id", ownerId)
            .eq("plan", "agencia");
        }
        break;
      }

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
