-- Tercer tipo de recompensa del cofre diario: una plantilla de copy real
-- (no XP, no misión) para una situación concreta del tipo de negocio. El
-- contenido de la plantilla vive en código (lib/copyTemplates.ts, estático);
-- aquí solo se guarda qué plantilla le tocó, para poder volver a mostrarla
-- si recarga la página el mismo día.
alter type public.daily_chest_reward add value 'template';

alter table public.daily_chests
  add column template_id text;
