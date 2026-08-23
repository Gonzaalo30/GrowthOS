-- Velocidad real vía Google PageSpeed Insights (Lighthouse), bajo demanda —
-- se guarda solo el último snapshot por negocio, no una serie histórica.
create table public.pagespeed_snapshots (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,
  mobile_score int,
  mobile_lcp_ms int,
  mobile_cls numeric,
  mobile_tbt_ms int,
  desktop_score int,
  desktop_lcp_ms int,
  desktop_cls numeric,
  desktop_tbt_ms int,
  accessibility_score int,
  best_practices_score int,
  seo_score int,
  checked_at timestamptz not null default now()
);

alter table public.pagespeed_snapshots enable row level security;

create policy "pagespeed_snapshots: owner read/write via business" on public.pagespeed_snapshots
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
