-- Tier "Agencia": una suscripción a nivel de cuenta (no de negocio, a
-- propósito distinto del resto de planes) que concede funciones nivel
-- Growth a varios negocios del mismo owner — nunca Autopilot, que ya está
-- limitado a la capacidad real del fundador (ver services/admin.service.ts).
-- Cobro real: base 99€/mes (hasta 5 negocios) + slots extra de 15€/mes cada
-- uno, como suscripciones independientes — sin cantidades dinámicas en Stripe.
alter type public.business_plan add value 'agencia';

alter table public.profiles
  add column agency_stripe_customer_id text,
  add column agency_stripe_subscription_id text,
  add column agency_subscription_status text,
  add column agency_extra_slots int not null default 0;
