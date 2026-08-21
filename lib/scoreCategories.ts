// Separado de quickAudit.ts a propósito: este archivo no importa nada de
// Node (dns/net), así que los componentes cliente pueden usarlo sin arrastrar
// el código de servidor del analizador al bundle del navegador.
export type ScoreCategory = "velocidad" | "seo" | "local" | "conversion" | "confianza";

export const SCORE_CATEGORY_LABELS: Record<ScoreCategory, string> = {
  velocidad: "Velocidad",
  seo: "SEO",
  local: "Local",
  conversion: "Conversión",
  confianza: "Confianza",
};
