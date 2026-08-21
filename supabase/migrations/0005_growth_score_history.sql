-- GrowthOS — Sprint 3: historial de Growth Score para poder celebrar el progreso
create table public.growth_score_history (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  score int not null,
  recorded_at timestamptz not null default now()
);

alter table public.growth_score_history enable row level security;

create policy "growth_score_history: owner read/write via business" on public.growth_score_history
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
