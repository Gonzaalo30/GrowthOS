-- El Centro de Mejoras pasa de "solicitud" (lead sin cobrar) a compra real vía
-- Stripe Checkout. `paid` por defecto false: las filas ya existentes son
-- solicitudes del sistema anterior que nunca se llegaron a cobrar, así que
-- marcarlas como pagadas sería un dato falso. A partir de ahora solo el
-- webhook de Stripe inserta filas nuevas, siempre con paid = true.
alter table public.opportunity_requests
  add column paid boolean not null default false,
  add column paid_at timestamptz,
  add column stripe_checkout_session_id text,
  add column stripe_subscription_id text;
