-- GrowthOS — Biblioteca de casos de éxito (arquitectura preparada, sin datos).
-- Se rellenará con casos REALES cuando haya clientes que completen mejoras.
-- Nunca insertar aquí datos inventados: mejor la tabla vacía que un caso falso.
create table public.case_studies (
  id uuid primary key default gen_random_uuid(),
  opportunity_id text not null,
  business_type text,
  title text not null,
  what_changed text not null,
  time_to_notice text not null,
  why_good_practice text not null,
  created_at timestamptz not null default now()
);

alter table public.case_studies enable row level security;

-- Lectura pública: son ejemplos genéricos, no datos privados de ningún negocio.
create policy "case_studies: public read" on public.case_studies
  for select using (true);
