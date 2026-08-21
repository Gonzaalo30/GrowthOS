import Link from "next/link";
import { ScoreCircle } from "@/components/growth/ScoreCircle";
import { CheckItem } from "@/components/growth/CheckItem";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { ConfettiBurst } from "@/components/growth/ConfettiBurst";
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
      <GrowthCard className="relative flex flex-col items-center gap-4 text-center">
        <ConfettiBurst />
        <span className="text-sm text-zinc-500">Resultado para {domain}</span>
        <ScoreCircle score={result.score} potential={growthPotentialLabel(result.score)} />
        <p className="text-sm text-zinc-600">
          Cumples {passedCount} de {result.checks.length} puntos básicos. Crea tu cuenta gratis para
          ver el plan completo de mejoras y tus misiones de hoy.
        </p>
      </GrowthCard>

      <GrowthCard>
        <h2 className="mb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Lo que hemos revisado
        </h2>
        <div className="divide-y divide-border">
          {result.checks.map((check) => (
            <CheckItem key={check.id} check={check} />
          ))}
        </div>
      </GrowthCard>

      <Link href={`/signup?domain=${encodeURIComponent(domain)}`}>
        <Button className="w-full">Crear cuenta gratis y ver mi plan</Button>
      </Link>
    </div>
  );
}
