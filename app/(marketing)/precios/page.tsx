import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";

const MARKETPLACE_EXAMPLES = [
  { title: "Optimizar ficha de Google Business", price: "149 €" },
  { title: "Mejorar la velocidad de tu web", price: "249 €" },
  { title: "Añadir datos estructurados (Schema)", price: "179 €" },
];

const SPRINTS = [
  { title: "Local Sprint", description: "Para negocios que dependen de clientes de su zona." },
  { title: "SEO Sprint", description: "Para posicionar tu web en Google a medio plazo." },
  { title: "Conversion Sprint", description: "Para que las visitas se conviertan en clientes." },
  { title: "Performance Sprint", description: "Para que tu web cargue rápido en cualquier móvil." },
];

export default function PreciosPage() {
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">Precios</h1>
        <p className="mt-3 text-zinc-600">Sin presupuestos ni sorpresas. Precio cerrado en todo.</p>
      </div>

      <GrowthCard className="text-center">
        <h2 className="text-lg font-semibold text-foreground">Empieza gratis</h2>
        <p className="mt-2 text-sm text-zinc-600">
          Análisis de tu web, Growth Score, misiones diarias y misión semanal, sin coste.
        </p>
        <Link href="/">
          <Button className="mt-4">Analizar mi web gratis</Button>
        </Link>
      </GrowthCard>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Mejoras a la carta
        </h2>
        <p className="mb-4 text-sm text-zinc-600">
          Cuando una misión requiere trabajo técnico, puedes pedir que la implementemos nosotros por un
          precio cerrado. Estos son ejemplos orientativos:
        </p>
        <div className="flex flex-col gap-3">
          {MARKETPLACE_EXAMPLES.map((item) => (
            <GrowthCard key={item.title} className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">{item.title}</span>
              <span className="text-sm font-semibold text-brand-600">{item.price}</span>
            </GrowthCard>
          ))}
        </div>
      </div>

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Growth Sprints (1.000 € – 5.000 €)
        </h2>
        <p className="mb-4 text-sm text-zinc-600">
          Para cuando quieres ir más rápido: proyectos completos con objetivos y plazos claros.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          {SPRINTS.map((sprint) => (
            <GrowthCard key={sprint.title}>
              <h3 className="font-medium text-foreground">{sprint.title}</h3>
              <p className="mt-1 text-sm text-zinc-600">{sprint.description}</p>
            </GrowthCard>
          ))}
        </div>
      </div>
    </div>
  );
}
