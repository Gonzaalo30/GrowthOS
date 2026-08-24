-- "Sello Local" real, sin API de pago ni scraping: el propio negocio pega la
-- URL de su ficha de Google Business y responde un checklist honesto sobre
-- ella — de cada respuesta "no" sale una misión diaria real y accionable.
-- No genera ninguna nota/puntuación separada ni afecta al Growth Score.
create table public.google_business_checklists (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade unique,
  profile_url text not null,
  has_complete_hours boolean not null default false,
  has_enough_photos boolean not null default false,
  has_correct_category boolean not null default false,
  has_contact_info boolean not null default false,
  responds_to_reviews boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.google_business_checklists enable row level security;

create policy "google_business_checklists: owner read/write via business" on public.google_business_checklists
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );
