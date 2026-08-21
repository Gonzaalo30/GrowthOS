-- Infraestructura pedida por el fundador antes de seguir sumando features:
-- feature flags, eventos de analytics y notificaciones in-app. Todo real:
-- sin panel de admin todavía (los flags se editan por SQL), sin email/push
-- todavía (Resend no está conectado — eso sigue pendiente aparte).

create table public.feature_flags (
  key text primary key,
  enabled boolean not null default false,
  description text,
  updated_at timestamptz not null default now()
);
alter table public.feature_flags enable row level security;
create policy "feature_flags: public read" on public.feature_flags for select using (true);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  event_name text not null,
  properties jsonb,
  created_at timestamptz not null default now()
);
alter table public.analytics_events enable row level security;
create policy "analytics_events: insert own or anonymous" on public.analytics_events
  for insert with check (
    business_id is null or exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
create policy "analytics_events: owner read" on public.analytics_events
  for select using (
    business_id is not null and exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  message text not null,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "notifications: owner read/write via business" on public.notifications
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
