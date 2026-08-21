-- Estructura real de planes (Gratis / Growth / Autopilot), más un plan
-- personalizado que no tiene precio fijo — se gestiona como una solicitud de
-- contacto real, no un precio inventado para algo que se cotiza caso a caso.
create type public.business_plan as enum ('starter', 'growth', 'autopilot');

alter table public.businesses add column plan public.business_plan not null default 'starter';

create table public.custom_plan_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  details text not null,
  contact_email text not null,
  status public.opportunity_request_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.custom_plan_requests enable row level security;

create policy "custom_plan_requests: owner read/write via business" on public.custom_plan_requests
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
