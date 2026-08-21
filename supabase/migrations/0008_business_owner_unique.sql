-- Un negocio por cuenta: evita que un doble submit de onboarding (o un
-- reintento tras un fallo de red) cree dos filas en businesses para el
-- mismo owner_id. Confirmado que no hay duplicados actuales antes de aplicar.
alter table public.businesses
  add constraint businesses_owner_id_unique unique (owner_id);
