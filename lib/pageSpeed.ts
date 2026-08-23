export type PageSpeedStrategy = "mobile" | "desktop";

export interface PageSpeedResult {
  score: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
  accessibilityScore: number | null;
  bestPracticesScore: number | null;
  seoScore: number | null;
}

const ENDPOINT = "https://www.googleapis.com/pagespeedonline/v5/runPagespeed";
/** Lighthouse corre de verdad contra la web — puede tardar bastante más que una llamada normal a una API. */
const FETCH_TIMEOUT_MS = 55_000;

function toScore100(score: unknown): number | null {
  return typeof score === "number" ? Math.round(score * 100) : null;
}

function numericAudit(audits: Record<string, unknown> | undefined, id: string): number | null {
  const audit = audits?.[id] as { numericValue?: unknown } | undefined;
  return typeof audit?.numericValue === "number" ? Math.round(audit.numericValue) : null;
}

/** Llama a la API pública y gratuita de Google PageSpeed Insights (Lighthouse real, no simulado). */
export async function fetchPageSpeedInsights(domain: string, strategy: PageSpeedStrategy): Promise<PageSpeedResult> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GOOGLE_PAGESPEED_API_KEY no está configurada. Añádela a .env.local para activar el análisis de velocidad real.",
    );
  }

  const params = new URLSearchParams({ url: `https://${domain}`, strategy, key: apiKey });
  params.append("category", "performance");
  params.append("category", "accessibility");
  params.append("category", "best-practices");
  params.append("category", "seo");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(`${ENDPOINT}?${params.toString()}`, { signal: controller.signal });
    if (!res.ok) {
      throw new Error(`PageSpeed Insights respondió ${res.status}`);
    }
    const data = await res.json();
    const categories = data?.lighthouseResult?.categories ?? {};
    const audits = data?.lighthouseResult?.audits ?? {};

    return {
      score: toScore100(categories.performance?.score),
      lcpMs: numericAudit(audits, "largest-contentful-paint"),
      cls: typeof audits["cumulative-layout-shift"]?.numericValue === "number"
        ? audits["cumulative-layout-shift"].numericValue
        : null,
      tbtMs: numericAudit(audits, "total-blocking-time"),
      accessibilityScore: toScore100(categories.accessibility?.score),
      bestPracticesScore: toScore100(categories["best-practices"]?.score),
      seoScore: toScore100(categories.seo?.score),
    };
  } finally {
    clearTimeout(timeout);
  }
}
