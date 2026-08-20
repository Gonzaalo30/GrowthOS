-- GrowthOS — Plan Autopilot: suscripción mensual vía Stripe
alter table public.businesses add column stripe_customer_id text;
alter table public.businesses add column stripe_subscription_id text;
alter table public.businesses add column subscription_status text not null default 'none';

-- El webhook de Stripe actualiza estos campos con la service role key (sin sesión de
-- usuario), así que necesita su propia política además de la de owner por auth.uid().
-- No añadimos policy adicional: las rutas de servidor que usan la service role key
-- se saltan RLS automáticamente en Supabase.
