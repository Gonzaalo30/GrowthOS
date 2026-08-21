-- Numeración estable de Quick Wins ("Quick Win #27"): antes se calculaba en
-- el cliente ordenando por created_at, pero las misiones se insertan en lote
-- y pueden compartir el mismo timestamp, así que el número podía cambiar
-- entre recargas. Ahora se guarda una vez, al crear la misión.
alter table public.missions add column sequence_number int;
