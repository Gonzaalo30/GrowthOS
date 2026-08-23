-- Conexión real con Google Search Console + Google Analytics (planes Growth y
-- Autopilot). El refresh token se guarda cifrado (ver lib/googleTokenCrypto.ts)
-- porque es una credencial de larga duración con acceso de lectura a los
-- datos reales del negocio. Se guarda solo el último snapshot de cada fuente
-- (jsonb), no una serie histórica día a día — este proyecto no tiene
-- infraestructura de jobs en segundo plano, y el mismo patrón de "refrescar
-- solo si está viejo" ya se usa para el Growth Score.
create table public.google_integrations (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,
  google_email text not null,
  refresh_token_encrypted text not null,
  search_console_site_url text,
  ga4_property_id text,
  ga4_property_name text,
  search_console_data jsonb,
  analytics_data jsonb,
  last_synced_at timestamptz,
  connected_at timestamptz not null default now()
);

alter table public.google_integrations enable row level security;

create policy "google_integrations: owner read/write via business" on public.google_integrations
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
