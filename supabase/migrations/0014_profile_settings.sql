-- Ajustes reales de perfil: foto y formato de fecha (el único formato que
-- aplicamos de verdad, porque es el único dato que ya mostramos en la app —
-- no añadimos un ajuste de "hora" porque hoy no mostramos ninguna hora en
-- ningún sitio, sería un ajuste decorativo que no cambia nada).
alter table public.profiles add column avatar_url text;
alter table public.profiles add column date_format text not null default 'long';

-- Políticas del bucket "avatars" (el bucket en sí se crea por API, no aquí).
-- Lectura pública porque la foto se muestra en la cabecera de la app sin
-- necesidad de una URL firmada; escritura solo dentro de la propia carpeta
-- de cada usuario (avatars/{user_id}/...).
create policy "avatars: public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars: owner insert" on storage.objects
  for insert to authenticated with check (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner update" on storage.objects
  for update to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "avatars: owner delete" on storage.objects
  for delete to authenticated using (
    bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text
  );
