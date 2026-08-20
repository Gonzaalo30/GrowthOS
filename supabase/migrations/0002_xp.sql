-- GrowthOS — Sprint 2: XP persistido
alter table public.businesses add column xp int not null default 0;

-- Incrementa el XP de un negocio de forma atómica (evita condiciones de carrera
-- si se completan misiones casi a la vez). security invoker: respeta las políticas
-- RLS existentes, un usuario solo puede incrementar el XP de su propio negocio.
create or replace function public.increment_business_xp(p_business_id uuid, p_amount int)
returns void
language sql
security invoker
as $$
  update public.businesses set xp = xp + p_amount where id = p_business_id;
$$;
