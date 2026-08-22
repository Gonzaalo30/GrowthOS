import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

const MAX_BYTES = 2 * 1024 * 1024;
const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp"];

export async function uploadAvatar(supabase: Client, userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error("Formato no soportado. Usa PNG, JPG o WEBP.");
  }
  if (file.size > MAX_BYTES) {
    throw new Error("La imagen pesa demasiado (máximo 2 MB).");
  }

  const extension = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  // Mismo nombre siempre (no un uuid nuevo cada vez): así una foto nueva
  // sustituye a la anterior en Storage en vez de acumular archivos huérfanos.
  const path = `${userId}/avatar.${extension}`;

  const { error } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from("avatars").getPublicUrl(path);
  // Cache-bust: la URL pública es siempre la misma ruta, así que sin esto el
  // navegador podría seguir mostrando la imagen antigua en caché.
  return `${data.publicUrl}?v=${Date.now()}`;
}
