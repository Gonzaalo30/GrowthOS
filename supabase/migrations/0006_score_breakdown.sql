-- GrowthOS — Sprint 3: guardar el desglose de cada comprobación, no solo el número final
alter table public.growth_score_history add column checks jsonb;
