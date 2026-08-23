-- Cargo o rol opcional que el propio usuario escribe debajo de su nombre en
-- el perfil (ej. "Dueña de Clínica Dental Sonrisa"). Campo libre, nunca
-- inventado por nosotros.
alter table public.profiles add column title text;
