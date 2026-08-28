import Link from "next/link";
import { ScoreCircle } from "@/components/growth/ScoreCircle";
import { CheckItem } from "@/components/growth/CheckItem";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { ConfettiBurst } from "@/components/growth/ConfettiBurst";
import { CategoryScores } from "@/components/growth/CategoryScores";
import { GuidedTour } from "@/components/tour/GuidedTour";
import { Button } from "@/components/ui/Button";
import { runQuickAudit, growthPotentialLabel } from "@/lib/quickAudit";
import { createClient } from "@/lib/supabase/server";
import { trackEvent } from "@/lib/analytics";

export async function QuickAuditResult({ domain }: { domain: string }) {
  const result = await runQuickAudit(domain);

  const supabase = await createClient();
  await trackEvent(supabase, "audit_started", null, { domain, unreachable: result.unreachable });

  if (result.unreachable) {
    return (
      <GrowthCard className="mx-auto max-w-lg text-center">
        <h1 className="text-xl font-semibold text-foreground">No hemos podido analizar {domain}</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Puede que la web esté caída o el dominio no sea correcto. Aun así puedes crear tu cuenta y
          lo intentaremos de nuevo desde tu panel.
        </p>
        <Link href={`/signup?domain=${encodeURIComponent(domain)}`}>
          <Button className="mt-6">Crear cuenta gratis</Button>
        </Link>
      </GrowthCard>
    );
  }

  const passedCount = result.checks.filter((c) => c.passed).length;

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6">
      <GrowthCard id="tour-score-circle" glow className="relative flex flex-col items-center gap-4 text-center">
        <ConfettiBurst />
        <span className="text-sm text-zinc-500">Resultado para {domain}</span>
        <ScoreCircle score={result.score} potential={growthPotentialLabel(result.score)} />
        <p className="text-sm text-zinc-600">
          Cumples {passedCount} de {result.checks.length} puntos básicos. Crea tu cuenta gratis para
          ver el plan completo de mejoras y tus misiones de hoy.
        </p>
      </GrowthCard>

      <GrowthCard id="tour-category-scores">
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Puntuación por área
        </h2>
        <CategoryScores
          checks={result.checks}
          planId={null}
          lockedHref={`/signup?domain=${encodeURIComponent(domain)}`}
        />
      </GrowthCard>

      <GrowthCard id="tour-checklist">
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Lo que hemos revisado
        </h2>
        <div className="divide-y divide-border">
          {result.checks.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </GrowthCard>

      <Link href={`/signup?domain=${encodeURIComponent(domain)}`} id="tour-signup-cta">
        <Button className="w-full">Crear cuenta gratis y ver mi plan</Button>
      </Link>

      <GuidedTour
        storageKey="growthos_tour_analisis"
        steps={[
          {
            targetId: "tour-score-circle",
            title: "Tu Growth Score",
            description:
              "Un número sobre 100 que resume cómo de bien está tu web ahora mismo, calculado con comprobaciones reales, no una estimación.",
          },
          {
            targetId: "tour-category-scores",
            title: "Puntuación por área",
            description:
              "El mismo score, desglosado en SEO, confianza, velocidad, presencia local y conversión, para que sepas justo dónde flojea tu web.",
          },
          {
            targetId: "tour-checklist",
            title: "Lo que hemos revisado",
            description:
              "El detalle de cada comprobación real (conexión segura, título, velocidad...), con qué significa cada una para tus clientes.",
          },
          {
            targetId: "tour-signup-cta",
            title: "El siguiente paso",
            description:
              "Crea tu cuenta gratis (30 segundos, sin tarjeta) para guardar este análisis y recibir tus primeras misiones de hoy.",
          },
        ]}
      />
    </div>
  );
}
