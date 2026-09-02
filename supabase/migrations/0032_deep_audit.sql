-- Estado de la auditoría profunda (multi-página + PageSpeed + responsive real)
-- que ahora calcula el Growth Score de verdad, en segundo plano — nunca
-- bloqueando una petición del usuario (ver lib/deepAuditCoordinator.ts).
alter table public.businesses
  add column growth_score_status text not null default 'idle',
  add column growth_score_pending jsonb,
  add column growth_score_pending_steps text[] not null default '{}',
  add column growth_score_analyzing_since timestamptz;
