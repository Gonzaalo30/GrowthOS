-- GrowthOS — Sprint 1 schema: profiles, businesses, missions
-- RLS: cada usuario solo puede leer/escribir sus propias filas.

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text not null,
  created_at timestamptz not null default now()
);

create table public.businesses (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  domain text not null,
  business_type text not null,
  city text,
  company_size text,
  growth_score int not null default 50,
  growth_potential text,
  created_at timestamptz not null default now()
);

create type public.mission_type as enum ('daily', 'weekly');
create type public.mission_difficulty as enum ('easy', 'medium', 'hard');

create table public.missions (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  type public.mission_type not null,
  title text not null,
  description text not null,
  difficulty public.mission_difficulty not null default 'easy',
  time_estimate_minutes int not null,
  xp_reward int not null,
  expected_impact text,
  price_cents int,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.missions enable row level security;

create policy "profiles: owner read/write" on public.profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

create policy "businesses: owner read/write" on public.businesses
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

create policy "missions: owner read/write via business" on public.missions
  for all using (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  ) with check (
    exists (select 1 from public.businesses b where b.id = business_id and b.owner_id = auth.uid())
  );

-- Crea automáticamente la fila de profiles al registrarse un usuario en Supabase Auth,
-- para que el signup nunca deje un auth.users sin su perfil correspondiente.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', new.email), new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
