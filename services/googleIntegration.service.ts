import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { encryptGoogleToken, decryptGoogleToken } from "@/lib/googleTokenCrypto";
import {
  getFreshAccessToken,
  revokeGoogleToken,
  fetchSearchConsoleSummary,
  fetchAnalyticsSummary,
  listSearchConsoleSites,
  listAnalyticsProperties,
  type SearchConsoleSummary,
  type AnalyticsSummary,
  type GoogleSiteOption,
  type GoogleAnalyticsPropertyOption,
} from "@/lib/googleApis";

type Client = SupabaseClient<Database>;

export async function getIntegration(supabase: Client, businessId: string) {
  const { data, error } = await supabase
    .from("google_integrations")
    .select("*")
    .eq("business_id", businessId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function saveInitialConnection(
  supabase: Client,
  businessId: string,
  input: { googleEmail: string; refreshToken: string },
) {
  const { error } = await supabase.from("google_integrations").upsert(
    {
      business_id: businessId,
      google_email: input.googleEmail,
      refresh_token_encrypted: encryptGoogleToken(input.refreshToken),
    },
    { onConflict: "business_id" },
  );
  if (error) throw error;
}

export async function selectProperties(
  supabase: Client,
  businessId: string,
  input: { siteUrl: string; propertyId: string; propertyName: string },
) {
  const { error } = await supabase
    .from("google_integrations")
    .update({
      search_console_site_url: input.siteUrl,
      ga4_property_id: input.propertyId,
      ga4_property_name: input.propertyName,
    })
    .eq("business_id", businessId);
  if (error) throw error;
}

const STALE_AFTER_HOURS = 6;

/**
 * Igual patrón que refreshGrowthScoreIfStale: solo vuelve a llamar a las APIs
 * de Google si el último snapshot guardado tiene más de STALE_AFTER_HOURS.
 */
export async function refreshDataIfStale(supabase: Client, businessId: string) {
  const integration = await getIntegration(supabase, businessId);
  if (!integration || !integration.search_console_site_url || !integration.ga4_property_id) return integration;

  const isStale =
    !integration.last_synced_at ||
    Date.now() - new Date(integration.last_synced_at).getTime() > STALE_AFTER_HOURS * 60 * 60 * 1000;
  if (!isStale) return integration;

  return syncNow(supabase, businessId, integration);
}

export async function syncNow(
  supabase: Client,
  businessId: string,
  integration: NonNullable<Awaited<ReturnType<typeof getIntegration>>>,
) {
  if (!integration.search_console_site_url || !integration.ga4_property_id) return integration;

  const refreshToken = decryptGoogleToken(integration.refresh_token_encrypted);
  const accessToken = await getFreshAccessToken(refreshToken);

  const [searchConsoleData, analyticsData] = await Promise.all([
    fetchSearchConsoleSummary(accessToken, integration.search_console_site_url),
    fetchAnalyticsSummary(accessToken, integration.ga4_property_id),
  ]);

  const { data, error } = await supabase
    .from("google_integrations")
    .update({
      search_console_data: searchConsoleData as unknown,
      analytics_data: analyticsData as unknown,
      last_synced_at: new Date().toISOString(),
    })
    .eq("business_id", businessId)
    .select("*")
    .single();
  if (error) throw error;
  return data;
}

/** Sitios de Search Console y propiedades de GA4 reales a las que tiene acceso la cuenta conectada. */
export async function listAvailableProperties(
  supabase: Client,
  businessId: string,
): Promise<{ sites: GoogleSiteOption[]; properties: GoogleAnalyticsPropertyOption[] } | null> {
  const integration = await getIntegration(supabase, businessId);
  if (!integration) return null;

  const refreshToken = decryptGoogleToken(integration.refresh_token_encrypted);
  const accessToken = await getFreshAccessToken(refreshToken);

  const [sites, properties] = await Promise.all([
    listSearchConsoleSites(accessToken),
    listAnalyticsProperties(accessToken),
  ]);
  return { sites, properties };
}

export async function disconnect(supabase: Client, businessId: string) {
  const integration = await getIntegration(supabase, businessId);
  if (integration) {
    const refreshToken = decryptGoogleToken(integration.refresh_token_encrypted);
    await revokeGoogleToken(refreshToken);
  }
  const { error } = await supabase.from("google_integrations").delete().eq("business_id", businessId);
  if (error) throw error;
}

export type { SearchConsoleSummary, AnalyticsSummary };
