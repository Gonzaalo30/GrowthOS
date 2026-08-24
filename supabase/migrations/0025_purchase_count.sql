-- Contador real de compras de plan (Growth/Autopilot) — se incrementa solo al
-- comprar un plan nuevo por checkout (nunca al cambiar de plan desde el
-- Portal de Stripe), para lograr real de "compras totales" junto con las
-- filas de opportunity_requests, sin depender de un historial de Stripe.
alter table public.businesses
  add column plan_purchase_count integer not null default 0;
