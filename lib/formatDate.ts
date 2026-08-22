import type { DateFormat } from "@/types/database.types";

export const DATE_FORMAT_LABELS: Record<DateFormat, string> = {
  long: "22 ago 2026",
  short_dmy: "22/08/2026",
  short_mdy: "08/22/2026",
};

/** Único formateador de fechas de la app, para que la preferencia del usuario se aplique de verdad en todos lados. */
export function formatDate(iso: string, format: DateFormat = "long"): string {
  const date = new Date(iso);
  if (format === "short_dmy") {
    return date.toLocaleDateString("es-ES", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  if (format === "short_mdy") {
    return date.toLocaleDateString("en-US", { day: "2-digit", month: "2-digit", year: "numeric" });
  }
  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short", year: "numeric" });
}
