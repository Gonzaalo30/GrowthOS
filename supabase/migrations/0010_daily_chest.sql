-- Cofre diario: recompensa real (XP o un Quick Win extra), una vez al día por
-- negocio. Sin descuentos ni "informes premium" todavía porque esas cosas no
-- existen de verdad en el producto — solo se ofrecen recompensas que podemos
-- entregar de verdad hoy.
create type public.daily_chest_reward as enum ('xp', 'bonus_mission');

create table public.daily_chests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  opened_date date not null,
  reward_type public.daily_chest_reward not null,
  xp_awarded int,
  created_at timestamptz not null default now(),
  unique (business_id, opened_date)
);

alter table public.daily_chests enable row level security;

create policy "daily_chests: owner read/write via business" on public.daily_chests
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
