-- Registro de auditoría real de cuándo el admin (el fundador, único hoy)
-- inicia sesión como un usuario real desde el panel de admin — nunca en
-- silencio, para poder rendir cuentas de un acceso así si hiciera falta.
create table public.admin_impersonation_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null references public.profiles(id) on delete cascade,
  target_user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admin_impersonation_log enable row level security;

-- Sin políticas para usuarios normales a propósito: solo se escribe/lee con
-- la service role key, dentro del propio flujo de impersonación en el
-- servidor — ningún usuario debe poder ver ni tocar este registro.
