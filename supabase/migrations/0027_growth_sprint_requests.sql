-- Growth Sprint: intervención intensiva y coordinada (SEO + velocidad +
-- local + conversión) para cuando varias mejoras sueltas ya no bastan.
-- Precio variable según alcance real ("desde 1.500€"), así que se gestiona
-- como una solicitud real que el fundador cotiza a mano — mismo patrón que
-- contact_messages: abierto a cualquiera, con o sin cuenta.
create table public.growth_sprint_requests (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  name text not null,
  email text not null,
  details text not null,
  status public.opportunity_request_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.growth_sprint_requests enable row level security;

create policy "growth_sprint_requests: anyone can insert" on public.growth_sprint_requests
  for insert with check (true);
