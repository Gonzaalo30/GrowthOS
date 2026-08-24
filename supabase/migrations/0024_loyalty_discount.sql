-- Descuento de fidelidad del 5%: se gana en la primera compra (cualquier
-- plan o mejora del Centro de Mejoras), se consume en la segunda, y nunca
-- se vuelve a conceder una vez usado.
alter table public.businesses
  add column loyalty_discount_available boolean not null default false,
  add column loyalty_discount_used boolean not null default false;
