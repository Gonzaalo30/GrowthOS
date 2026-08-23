-- Varios negocios por cuenta: cada negocio sigue siendo independiente de
-- verdad (su propio plan, Stripe, XP, misiones) — solo se deja de forzar que
-- una cuenta tenga un único negocio.
alter table public.businesses drop constraint businesses_owner_id_unique;

-- Negocio activo del usuario ahora mismo. Se guarda en el perfil (no en una
-- cookie) porque es una preferencia real que debe persistir entre
-- dispositivos, igual que profiles.date_format.
alter table public.profiles
  add column active_business_id uuid references public.businesses(id) on delete set null;
