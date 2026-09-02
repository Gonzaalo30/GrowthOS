import type { QuickAuditCheck } from "@/lib/quickAudit";

// Deja margen dentro del límite real de 60s por función de Vercel (plan
// Hobby) — cada estrategia (móvil/escritorio) corre en su propio Route
// Handler, así que esto es su único presupuesto de tiempo.
const PAGESPEED_TIMEOUT_MS = 55_000;

export type PageSpeedStrategy = "mobile" | "desktop";

export interface PageSpeedResult {
  strategy: PageSpeedStrategy;
  score: number;
}

/**
 * Llama a la API real de Google PageSpeed Insights — nunca inventa una
 * puntuación: si no hay `GOOGLE_PAGESPEED_API_KEY` configurada, o la
 * llamada falla, devuelve `null` y sencillamente no se añade esa
 * comprobación (ver `lib/deepAuditCoordinator.ts`, tolerante a pasos que no
 * aportan nada).
 */
export async function fetchPageSpeedScore(
  url: string,
  strategy: PageSpeedStrategy,
): Promise<PageSpeedResult | null> {
  const apiKey = process.env.GOOGLE_PAGESPEED_API_KEY;
  if (!apiKey) return null;

  const params = new URLSearchParams({ url, key: apiKey, strategy, category: "performance" });

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), PAGESPEED_TIMEOUT_MS);
  try {
    const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params}`, {
      signal: controller.signal,
    });
    if (!res.ok) return null;

    const data = await res.json();
    const scoreRaw = data?.lighthouseResult?.categories?.performance?.score;
    if (typeof scoreRaw !== "number") return null;

    return { strategy, score: Math.round(scoreRaw * 100) };
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/** Umbral real de Google: por debajo de 50 la propia herramienta lo clasifica como "pobre". */
const POOR_THRESHOLD = 50;

export function buildPageSpeedCheck(
  result: PageSpeedResult | null,
  strategy: PageSpeedStrategy,
): QuickAuditCheck | null {
  if (!result) return null;

  const passed = result.score >= POOR_THRESHOLD;
  const label = strategy === "mobile" ? "Velocidad real en móvil (PageSpeed)" : "Velocidad real en escritorio (PageSpeed)";

  return {
    id: strategy === "mobile" ? "pagespeed-mobile" : "pagespeed-desktop",
    label,
    passed,
    detail: passed
      ? `Puntuación de rendimiento real de Google: ${result.score}/100.`
      : `Puntuación de rendimiento real de Google: ${result.score}/100 — por debajo de 50 significa que Google la considera lenta de verdad.`,
    category: "velocidad",
  };
}
