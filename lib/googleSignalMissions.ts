import type { SearchConsoleSummary, AnalyticsSummary } from "@/lib/googleApis";
import type { ScoreCategory } from "@/lib/scoreCategories";

export interface SignalMission {
  /** Estable para el mismo día + misma señal, para poder deduplicar sin repetir. */
  id: string;
  title: string;
  description: string;
  expectedImpact: string;
  category: ScoreCategory;
  xpReward: number;
  timeEstimateMinutes: number;
}

const POSITION_DROP_THRESHOLD = 3;
const MIN_PREVIOUS_IMPRESSIONS_FOR_DROP = 10;
const NEAR_TOP3_MIN_POSITION = 4;
const NEAR_TOP3_MAX_POSITION = 10;
const NEAR_TOP3_MIN_IMPRESSIONS = 20;
const BOUNCE_MIN_SESSIONS = 20;
const BOUNCE_RATE_THRESHOLD = 0.6;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 40);
}

/**
 * Prioridad: una caída real de posición (regresión) importa más que una
 * oportunidad de subir al Top 3. Solo se genera una por día, la más urgente.
 */
export function detectSearchConsoleSignal(data: SearchConsoleSummary, dateStr: string): SignalMission | null {
  const drops = data.topQueries
    .filter(
      (q) =>
        q.previousPosition !== null &&
        q.position - q.previousPosition >= POSITION_DROP_THRESHOLD &&
        q.previousPosition <= 20 &&
        q.impressions >= MIN_PREVIOUS_IMPRESSIONS_FOR_DROP,
    )
    .sort((a, b) => b.position - b.previousPosition! - (a.position - a.previousPosition!));

  if (drops.length > 0) {
    const q = drops[0];
    return {
      id: `gsc-drop-${slugify(q.query)}-${dateStr}`,
      title: `Recupera posiciones para "${q.query}"`,
      description: `Esta búsqueda te posicionaba en el puesto ${Math.round(q.previousPosition!)} hace unas semanas y ahora está en el puesto ${Math.round(q.position)}. Revisa si esa página sigue actualizada, con contenido completo y enlaces internos hacia ella.`,
      expectedImpact: "Recuperar visibilidad en una búsqueda que ya te funcionaba",
      category: "seo",
      xpReward: 20,
      timeEstimateMinutes: 15,
    };
  }

  const nearTop3 = data.topQueries
    .filter(
      (q) =>
        q.position >= NEAR_TOP3_MIN_POSITION &&
        q.position <= NEAR_TOP3_MAX_POSITION &&
        q.impressions >= NEAR_TOP3_MIN_IMPRESSIONS,
    )
    .sort((a, b) => a.position - b.position);

  if (nearTop3.length > 0) {
    const q = nearTop3[0];
    return {
      id: `gsc-top3-${slugify(q.query)}-${dateStr}`,
      title: `Empuja "${q.query}" hacia el Top 3`,
      description: `Estás en el puesto ${Math.round(q.position)} para esta búsqueda, con ${q.impressions} impresiones en el último mes — cerca del Top 3. Amplía el contenido de esa página o enlázala desde otras páginas de tu web para intentar subir.`,
      expectedImpact: "Más clics reales al entrar en las primeras posiciones",
      category: "seo",
      xpReward: 20,
      timeEstimateMinutes: 15,
    };
  }

  return null;
}

export function detectAnalyticsSignal(data: AnalyticsSummary, dateStr: string): SignalMission | null {
  const candidates = data.topPagesByTraffic
    .filter((p) => p.sessions >= BOUNCE_MIN_SESSIONS && p.bounceRate >= BOUNCE_RATE_THRESHOLD)
    .sort((a, b) => b.sessions - a.sessions);

  if (candidates.length === 0) return null;

  const p = candidates[0];
  const bouncePct = Math.round(p.bounceRate * 100);
  return {
    id: `ga4-bounce-${slugify(p.path)}-${dateStr}`,
    title: `Revisa por qué se van de "${p.path}"`,
    description: `Esta página recibió ${p.sessions} visitas en el último mes, pero el ${bouncePct}% se fue sin interactuar con nada más. Revisa si carga rápido, si el contenido responde a lo que buscaban, y si el siguiente paso (llamar, escribir, comprar) está claro y visible.`,
    expectedImpact: "Menos visitantes que se van sin dar el siguiente paso",
    category: "conversion",
    xpReward: 20,
    timeEstimateMinutes: 15,
  };
}

/** Una sola señal al día, la más urgente disponible entre las dos fuentes. */
export function detectBestSignal(
  searchConsoleData: SearchConsoleSummary | null,
  analyticsData: AnalyticsSummary | null,
  dateStr: string,
): SignalMission | null {
  return (
    (searchConsoleData && detectSearchConsoleSignal(searchConsoleData, dateStr)) ??
    (analyticsData && detectAnalyticsSignal(analyticsData, dateStr)) ??
    null
  );
}
