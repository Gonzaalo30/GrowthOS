-- Herramienta interna para el plan Autopilot: el fundador implementa el
-- trabajo real en la web del cliente, así que necesita poder marcar esa
-- misión como hecha en su nombre (con la misma lógica real de XP/racha que
-- ya existe) — sin esto, el cliente nunca subiría de nivel aunque reciba el
-- beneficio real.
alter table public.profiles add column is_admin boolean not null default false;

-- Necesario para poder contar de verdad cuántas misiones ha implementado el
-- fundador esta semana para cada cliente (límite de servicio de Autopilot),
-- en vez de llevarlo a ojo.
alter table public.missions add column completed_by_admin boolean not null default false;
