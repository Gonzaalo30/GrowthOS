-- Formulario de contacto/dudas, abierto a cualquiera (no solo usuarios
-- registrados) — quien todavía no tiene cuenta también puede tener dudas
-- antes de darse de alta. Sin panel de admin todavía: se revisa desde el
-- SQL Editor de Supabase, igual que opportunity_requests y
-- custom_plan_requests.
create table public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  business_id uuid references public.businesses(id) on delete set null,
  name text not null,
  email text not null,
  message text not null,
  status public.opportunity_request_status not null default 'pending',
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

-- Cualquiera puede enviar un mensaje (con o sin sesión iniciada). Nadie
-- puede leerlos desde el cliente: van dirigidos al titular del sitio, que
-- los revisa con la clave de servicio, no con una cuenta de usuario normal.
create policy "contact_messages: anyone can insert" on public.contact_messages
  for insert with check (true);
