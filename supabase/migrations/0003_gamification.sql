-- GrowthOS — Sprint 2: rotación de misiones, streak, marketplace

-- Rotación de misiones: guardamos de qué plantilla viene cada misión para no
-- repetir la misma hasta agotar la variedad disponible para ese negocio.
alter table public.missions add column template_id text;

-- Streak de crecimiento
alter table public.businesses add column streak_count int not null default 0;
alter table public.businesses add column last_activity_date date;

-- Registra actividad de hoy de forma atómica: +1 si ayer también hubo actividad,
-- reinicia a 1 si hubo un hueco, no hace nada si ya se contó hoy.
create or replace function public.register_business_activity(p_business_id uuid)
returns void
language plpgsql
security invoker
as $$
declare
  v_last date;
  v_today date := current_date;
begin
  select last_activity_date into v_last
  from public.businesses where id = p_business_id;

  if v_last = v_today then
    return;
  elsif v_last = v_today - 1 then
    update public.businesses set streak_count = streak_count + 1, last_activity_date = v_today where id = p_business_id;
  else
    update public.businesses set streak_count = 1, last_activity_date = v_today where id = p_business_id;
  end if;
end;
$$;

-- Marketplace: solicitudes de mejora. Sin pago todavía (llega con Stripe en el
-- Sprint 4) — de momento es una captura de interés real, no una compra.
create type public.opportunity_request_status as enum ('pending', 'contacted', 'done');

create table public.opportunity_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opportunity_id text not null,
  title text not null,
  price_cents int not null,
  status public.opportunity_request_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.opportunity_requests enable row level security;

create policy "opportunity_requests: owner read/write via business" on public.opportunity_requests
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
