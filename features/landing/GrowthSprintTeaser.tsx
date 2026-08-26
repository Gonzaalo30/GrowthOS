import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";

const AREAS = ["SEO", "Velocidad", "Local", "Conversión"];

export function GrowthSprintTeaser() {
  return (
    <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-8 px-6 py-20 text-center sm:py-28">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Cuando una mejora ya no es suficiente
        </h2>
        <p className="mt-3 max-w-2xl text-lg text-zinc-600">
          GrowthOS detecta cuándo tu negocio necesita algo más que pequeños ajustes.
        </p>
      </div>

      <GrowthCard glow className="flex w-full max-w-lg flex-col items-center gap-3 text-center">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
          Growth Sprint
        </span>
        <p className="text-sm text-zinc-600">
          Una intervención intensiva para solucionar varios frentes de crecimiento de forma coordinada.
        </p>
        <p className="text-2xl font-semibold text-foreground">Desde 1.500 €</p>
        <div className="flex flex-wrap justify-center gap-2">
          {AREAS.map((area) => (
            <span
              key={area}
              className="rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-zinc-600"
            >
              {area}
            </span>
          ))}
        </div>
        <Link href="/growth-sprint" className="mt-2">
          <Button variant="secondary">Ver cómo funciona →</Button>
        </Link>
      </GrowthCard>
    </section>
  );
}
