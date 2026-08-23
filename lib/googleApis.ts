import { google } from "googleapis";

const SCOPES = [
  "https://www.googleapis.com/auth/webmasters.readonly",
  "https://www.googleapis.com/auth/analytics.readonly",
  "https://www.googleapis.com/auth/userinfo.email",
];

/** Lanza un error claro si faltan las credenciales, en vez de un fallo críptico de Google. */
function getOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (!clientId || !clientSecret) {
    throw new Error(
      "GOOGLE_CLIENT_ID o GOOGLE_CLIENT_SECRET no están configuradas. Añádelas a .env.local para activar la conexión con Google.",
    );
  }
  const redirectUri = `${siteUrl ?? "http://localhost:3000"}/api/integrations/google/callback`;
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildGoogleAuthUrl(state: string): string {
  const client = getOAuthClient();
  return client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
}

export async function exchangeCodeForTokens(code: string) {
  const client = getOAuthClient();
  const { tokens } = await client.getToken(code);
  if (!tokens.refresh_token || !tokens.access_token) {
    throw new Error(
      "Google no devolvió un refresh token. Si ya habías conectado esta cuenta antes, desconéctala primero en myaccount.google.com/permissions y vuelve a intentarlo.",
    );
  }
  client.setCredentials(tokens);
  const oauth2 = google.oauth2({ auth: client, version: "v2" });
  const { data } = await oauth2.userinfo.get();
  if (!data.email) throw new Error("No se pudo obtener el email de la cuenta de Google conectada.");
  return { refreshToken: tokens.refresh_token, accessToken: tokens.access_token, email: data.email };
}

export async function getFreshAccessToken(refreshToken: string): Promise<string> {
  const client = getOAuthClient();
  client.setCredentials({ refresh_token: refreshToken });
  const { credentials } = await client.refreshAccessToken();
  if (!credentials.access_token) throw new Error("No se pudo renovar el acceso a Google.");
  return credentials.access_token;
}

export async function revokeGoogleToken(refreshToken: string): Promise<void> {
  const client = getOAuthClient();
  try {
    await client.revokeToken(refreshToken);
  } catch {
    // Si ya estaba revocado o caducado en el lado de Google, no bloqueamos la
    // desconexión local por eso — el objetivo (dejar de tener acceso) igual se cumple.
  }
}

function authedClient(accessToken: string) {
  const client = getOAuthClient();
  client.setCredentials({ access_token: accessToken });
  return client;
}

export interface GoogleSiteOption {
  siteUrl: string;
}

export async function listSearchConsoleSites(accessToken: string): Promise<GoogleSiteOption[]> {
  const searchconsole = google.searchconsole({ version: "v1", auth: authedClient(accessToken) });
  const { data } = await searchconsole.sites.list();
  return (data.siteEntry ?? [])
    .filter((s) => s.permissionLevel !== "siteUnverifiedUser")
    .map((s) => ({ siteUrl: s.siteUrl ?? "" }))
    .filter((s) => s.siteUrl);
}

export interface GoogleAnalyticsPropertyOption {
  propertyId: string;
  propertyName: string;
}

export async function listAnalyticsProperties(accessToken: string): Promise<GoogleAnalyticsPropertyOption[]> {
  const analyticsadmin = google.analyticsadmin({ version: "v1beta", auth: authedClient(accessToken) });
  const { data } = await analyticsadmin.accountSummaries.list();
  const options: GoogleAnalyticsPropertyOption[] = [];
  for (const account of data.accountSummaries ?? []) {
    for (const property of account.propertySummaries ?? []) {
      if (!property.property || !property.displayName) continue;
      // property.property viene como "properties/123456789"
      options.push({ propertyId: property.property.replace("properties/", ""), propertyName: property.displayName });
    }
  }
  return options;
}

export interface SearchConsoleSummary {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  previousClicks: number;
  previousImpressions: number;
  topQueries: { query: string; clicks: number; impressions: number }[];
  topPages: { page: string; clicks: number; impressions: number }[];
}

function isoDaysAgo(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function fetchSearchConsoleSummary(accessToken: string, siteUrl: string): Promise<SearchConsoleSummary> {
  const searchconsole = google.searchconsole({ version: "v1", auth: authedClient(accessToken) });

  const [current, previous, byQuery, byPage] = await Promise.all([
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: isoDaysAgo(28), endDate: isoDaysAgo(1) },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: isoDaysAgo(56), endDate: isoDaysAgo(29) },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: isoDaysAgo(28), endDate: isoDaysAgo(1), dimensions: ["query"], rowLimit: 10 },
    }),
    searchconsole.searchanalytics.query({
      siteUrl,
      requestBody: { startDate: isoDaysAgo(28), endDate: isoDaysAgo(1), dimensions: ["page"], rowLimit: 10 },
    }),
  ]);

  const currentRow = current.data.rows?.[0];
  const previousRow = previous.data.rows?.[0];

  return {
    clicks: currentRow?.clicks ?? 0,
    impressions: currentRow?.impressions ?? 0,
    ctr: currentRow?.ctr ?? 0,
    position: currentRow?.position ?? 0,
    previousClicks: previousRow?.clicks ?? 0,
    previousImpressions: previousRow?.impressions ?? 0,
    topQueries: (byQuery.data.rows ?? []).map((r) => ({
      query: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
    })),
    topPages: (byPage.data.rows ?? []).map((r) => ({
      page: r.keys?.[0] ?? "",
      clicks: r.clicks ?? 0,
      impressions: r.impressions ?? 0,
    })),
  };
}

export interface AnalyticsSummary {
  sessions: number;
  conversions: number;
  bounceRate: number;
  previousSessions: number;
  previousConversions: number;
  topChannels: { channel: string; sessions: number }[];
}

export async function fetchAnalyticsSummary(accessToken: string, propertyId: string): Promise<AnalyticsSummary> {
  const analyticsdata = google.analyticsdata({ version: "v1beta", auth: authedClient(accessToken) });
  const property = `properties/${propertyId}`;

  const [totals, byChannel] = await Promise.all([
    analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [
          { startDate: "28daysAgo", endDate: "yesterday", name: "current" },
          { startDate: "56daysAgo", endDate: "29daysAgo", name: "previous" },
        ],
        metrics: [{ name: "sessions" }, { name: "conversions" }, { name: "bounceRate" }],
      },
    }),
    analyticsdata.properties.runReport({
      property,
      requestBody: {
        dateRanges: [{ startDate: "28daysAgo", endDate: "yesterday" }],
        dimensions: [{ name: "sessionDefaultChannelGroup" }],
        metrics: [{ name: "sessions" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "5",
      },
    }),
  ]);

  const currentRow = totals.data.rows?.find((r) => r.dimensionValues?.[0]?.value === "current");
  const previousRow = totals.data.rows?.find((r) => r.dimensionValues?.[0]?.value === "previous");

  return {
    sessions: Number(currentRow?.metricValues?.[0]?.value ?? 0),
    conversions: Number(currentRow?.metricValues?.[1]?.value ?? 0),
    bounceRate: Number(currentRow?.metricValues?.[2]?.value ?? 0),
    previousSessions: Number(previousRow?.metricValues?.[0]?.value ?? 0),
    previousConversions: Number(previousRow?.metricValues?.[1]?.value ?? 0),
    topChannels: (byChannel.data.rows ?? []).map((r) => ({
      channel: r.dimensionValues?.[0]?.value ?? "",
      sessions: Number(r.metricValues?.[0]?.value ?? 0),
    })),
  };
}
