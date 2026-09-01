import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";

const AREAS = ["SEO", "Velocidad", "Local", "Conversión"];

export function GrowthSprintTeaser() {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 text-center sm:py-20 lg:grid-cols-2 lg:gap-16 lg:text-left">
      <Reveal>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Cuando una mejora ya no es suficiente
        </h2>
        <p className="mt-3 text-lg text-zinc-600 lg:max-w-md">
          GrowthOS detecta cuándo tu negocio necesita algo más que pequeños ajustes.
        </p>
      </Reveal>

      <Reveal delay={0.15} className="w-full lg:justify-self-end">
        <GrowthCard
          glow
          interactive
          className="flex w-full max-w-lg flex-col items-center gap-3 text-center"
        >
          <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
            Growth Sprint
          </span>
          <p className="text-sm text-zinc-600">
            Una intervención intensiva para solucionar varios frentes de crecimiento de forma coordinada.
          </p>
          <p className="text-2xl font-semibold text-foreground">Desde 1.500 € + IVA · pago único</p>
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
      </Reveal>
    </section>
  );
}
