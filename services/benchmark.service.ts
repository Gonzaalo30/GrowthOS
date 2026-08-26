import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";

type Client = SupabaseClient<Database>;

/**
 * Con menos negocios reales que esto en un sector, una "media del sector" no
 * es honesta — sería comparar con un puñado de cuentas, no un benchmark real.
 * Por debajo del umbral, `getSectorBenchmark` devuelve `null` y no se muestra
 * nada, en vez de enseñar un número inventado.
 */
const MIN_SAMPLE_SIZE = 30;

export interface SectorBenchmark {
  averageScore: number;
  sampleSize: number;
}

export async function getSectorBenchmark(
  supabase: Client,
  businessType: string,
  excludeBusinessId: string,
): Promise<SectorBenchmark | null> {
  const { data, error } = await supabase
    .from("businesses")
    .select("growth_score")
    .eq("business_type", businessType)
    .neq("id", excludeBusinessId);
  if (error) throw error;

  const sampleSize = data.length;
  if (sampleSize < MIN_SAMPLE_SIZE) return null;

  const averageScore = Math.round(data.reduce((sum, b) => sum + b.growth_score, 0) / sampleSize);
  return { averageScore, sampleSize };
}
