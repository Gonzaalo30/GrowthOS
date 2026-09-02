import {
  runQuickAudit,
  buildPageSeoChecks,
  safeFetchText,
  isSafeHost,
  type QuickAuditCheck,
} from "@/lib/quickAudit";

// Tope duro de páginas analizadas del sitemap (incluye la home) — necesario
// para caber en el presupuesto de tiempo de una función serverless. Se dice
// honestamente en la UI cuántas páginas se analizaron de cuántas hay.
const MAX_PAGES = 20;
const MAX_NESTED_SITEMAPS = 5;

function extractLocsFromXml(xml: string): string[] {
  return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1].trim());
}

/**
 * Descarga y parsea el sitemap real del dominio — un sitemap es XML simple,
 * así que se extraen las URLs con una expresión regular en vez de añadir una
 * dependencia de parseo XML solo para esto. Si es un índice de sitemaps
 * (apunta a otros sitemaps, no a páginas), se sigue un nivel más.
 */
async function fetchSitemapUrls(origin: string): Promise<string[]> {
  const sitemapUrl = `${origin}/sitemap.xml`;
  if (!(await isSafeHost(sitemapUrl))) return [];

  const result = await safeFetchText(sitemapUrl);
  if (!result) return [];

  let locs = extractLocsFromXml(result.html);
  const looksLikeIndex = /<sitemapindex/i.test(result.html);
  if (looksLikeIndex && locs.length > 0) {
    const nested = await Promise.all(
      locs.slice(0, MAX_NESTED_SITEMAPS).map(async (nestedUrl) => {
        if (!(await isSafeHost(nestedUrl))) return [];
        const nestedResult = await safeFetchText(nestedUrl);
        return nestedResult ? extractLocsFromXml(nestedResult.html) : [];
      }),
    );
    locs = nested.flat();
  }

  // Solo páginas reales del mismo origen, sin duplicados ni entradas basura.
  const seen = new Set<string>();
  const filtered: string[] = [];
  for (const loc of locs) {
    try {
      const url = new URL(loc);
      if (url.origin !== origin) continue;
      const key = url.toString();
      if (seen.has(key)) continue;
      seen.add(key);
      filtered.push(key);
    } catch {
      // Entrada del sitemap que no es una URL válida — se ignora.
    }
  }
  return filtered;
}

export interface DeepPagesResult {
  checks: QuickAuditCheck[];
  pagesFound: number;
  pagesAnalyzed: number;
}

/**
 * El paso "pages" de la auditoría profunda: reutiliza el análisis rápido de
 * siempre para la home (mismas comprobaciones de todo el sitio — SSL,
 * robots.txt, velocidad de respuesta, enlaces rotos...) y añade las
 * comprobaciones de SEO por página (título, descripción, H1, schema,
 * canónica, alt) para hasta `MAX_PAGES` páginas reales del sitemap, no solo
 * la home — "no vale de nada que el home esté bien si las páginas internas
 * no están bien".
 */
export async function runDeepPageAudit(domain: string): Promise<DeepPagesResult> {
  const origin = `https://${domain}`;
  const homeUrl = `${origin}/`;

  const [homeAudit, sitemapUrls] = await Promise.all([runQuickAudit(domain), fetchSitemapUrls(origin)]);

  if (homeAudit.unreachable) {
    return { checks: [], pagesFound: 0, pagesAnalyzed: 0 };
  }

  const extraUrls = sitemapUrls.filter((u) => u !== homeUrl).slice(0, Math.max(0, MAX_PAGES - 1));

  const extraChecks = await Promise.all(
    extraUrls.map(async (pageUrl) => {
      if (!(await isSafeHost(pageUrl))) return [];
      const result = await safeFetchText(pageUrl);
      if (!result) return [];
      return buildPageSeoChecks(result.html, pageUrl);
    }),
  );

  return {
    checks: [...homeAudit.checks, ...extraChecks.flat()],
    pagesFound: sitemapUrls.length,
    pagesAnalyzed: 1 + extraUrls.length,
  };
}
