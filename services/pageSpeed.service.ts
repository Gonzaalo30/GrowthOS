import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { fetchPageSpeedInsights } from "@/lib/pageSpeed";

type Client = SupabaseClient<Database>;

export async function getSnapshot(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("pagespeed_snapshots")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

/** Corre Lighthouse real en móvil y escritorio en paralelo, y guarda el último snapshot. */
export async function checkAndSaveSnapshot(supabase: Client, businessId: string, domain: string) {
  const [mobile, desktop] = await Promise.all([
    fetchPageSpeedInsights(domain, "mobile"),
    fetchPageSpeedInsights(domain, "desktop"),
  ]);

  const { data, error } = await supabase
    .from("pagespeed_snapshots")
    .upsert(
      {
        business_id: businessId,
        mobile_score: mobile.score,
        mobile_lcp_ms: mobile.lcpMs,
        mobile_cls: mobile.cls,
        mobile_tbt_ms: mobile.tbtMs,
        desktop_score: desktop.score,
        desktop_lcp_ms: desktop.lcpMs,
        desktop_cls: desktop.cls,
        desktop_tbt_ms: desktop.tbtMs,
        // Lighthouse da los mismos resultados de accesibilidad/buenas prácticas/SEO en
        // ambas pasadas salvo diferencias menores — nos quedamos con los de móvil,
        // que es donde llega la mayoría de los clientes de un negocio local.
        accessibility_score: mobile.accessibilityScore,
        best_practices_score: mobile.bestPracticesScore,
        seo_score: mobile.seoScore,
        checked_at: new Date().toISOString(),
      },
      { onConflict: "business_id" },
    )
    .select("*")
    .single();
  if (error) throw error;
  return data;
}
