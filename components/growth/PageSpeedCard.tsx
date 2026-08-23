"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { Database } from "@/types/database.types";

type Snapshot = Database["public"]["Tables"]["pagespeed_snapshots"]["Row"];

function vitalColor(value: number | null, good: number, needsImprovement: number): string {
  if (value === null) return "text-zinc-400";
  if (value <= good) return "text-emerald-600";
  if (value <= needsImprovement) return "text-amber-600";
  return "text-red-600";
}

function scoreColor(score: number | null): string {
  if (score === null) return "text-zinc-400";
  if (score >= 90) return "text-emerald-600";
  if (score >= 50) return "text-amber-600";
  return "text-red-600";
}

function StrategyColumn({
  label,
  score,
  lcpMs,
  cls,
  tbtMs,
}: {
  label: string;
  score: number | null;
  lcpMs: number | null;
  cls: number | null;
  tbtMs: number | null;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={cn("mt-1 text-3xl font-bold", scoreColor(score))}>{score ?? "—"}</p>
      <div className="mt-2 flex flex-col gap-1 text-xs text-zinc-600">
        <span>
          LCP: <span className={cn("font-medium", vitalColor(lcpMs, 2500, 4000))}>{lcpMs !== null ? `${(lcpMs / 1000).toFixed(1)}s` : "—"}</span>
        </span>
        <span>
          CLS: <span className={cn("font-medium", vitalColor(cls !== null ? cls * 1000 : null, 100, 250))}>{cls !== null ? cls.toFixed(2) : "—"}</span>
        </span>
        <span>
          TBT: <span className={cn("font-medium", vitalColor(tbtMs, 200, 600))}>{tbtMs !== null ? `${tbtMs}ms` : "—"}</span>
        </span>
      </div>
    </div>
  );
}

export function PageSpeedCard({ snapshot }: { snapshot: Snapshot | null }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheck() {
    setError(null);
    setIsPending(true);
    try {
      const res = await fetch("/api/pagespeed/check", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "No hemos podido completar el análisis.");
        return;
      }
      router.refresh();
    } catch {
      setError("No hemos podido completar el análisis. Inténtalo de nuevo.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <GrowthCard>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Velocidad real (Google PageSpeed Insights)
        </h2>
        <Button type="button" variant="secondary" onClick={handleCheck} disabled={isPending}>
          {isPending ? "Analizando… (~30s)" : snapshot ? "Volver a analizar" : "Analizar velocidad real"}
        </Button>
      </div>

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}

      {!snapshot && !isPending && (
        <p className="mt-2 text-sm text-zinc-600">
          Todavía no la has analizado. Usamos la misma herramienta que Google (Lighthouse), así que tarda unos 30
          segundos — merece la pena esperar a que termine.
        </p>
      )}

      {isPending && (
        <p className="mt-2 text-sm text-zinc-600">
          Analizando tu web en móvil y escritorio con Google PageSpeed Insights, esto puede tardar unos 30 segundos…
        </p>
      )}

      {snapshot && !isPending && (
        <>
          <div className="mt-4 grid grid-cols-2 gap-6">
            <StrategyColumn
              label="Móvil"
              score={snapshot.mobile_score}
              lcpMs={snapshot.mobile_lcp_ms}
              cls={snapshot.mobile_cls}
              tbtMs={snapshot.mobile_tbt_ms}
            />
            <StrategyColumn
              label="Escritorio"
              score={snapshot.desktop_score}
              lcpMs={snapshot.desktop_lcp_ms}
              cls={snapshot.desktop_cls}
              tbtMs={snapshot.desktop_tbt_ms}
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-4 border-t border-border pt-3 text-xs text-zinc-600">
            <span>
              Accesibilidad: <span className="font-medium text-foreground">{snapshot.accessibility_score ?? "—"}</span>
            </span>
            <span>
              Buenas prácticas: <span className="font-medium text-foreground">{snapshot.best_practices_score ?? "—"}</span>
            </span>
            <span>
              SEO técnico: <span className="font-medium text-foreground">{snapshot.seo_score ?? "—"}</span>
            </span>
          </div>
          <p className="mt-2 text-xs text-zinc-500">
            Última comprobación:{" "}
            {new Date(snapshot.checked_at).toLocaleString("es-ES", {
              day: "2-digit",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </>
      )}
    </GrowthCard>
  );
}
