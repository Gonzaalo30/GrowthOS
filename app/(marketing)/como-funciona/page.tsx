import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Cómo funciona",
  description:
    "Analiza tu web gratis, recibe tu Growth Score y misiones diarias de 1-5 minutos sin jerga técnica. Así funciona GrowthOS paso a paso.",
  path: "/como-funciona",
});

const STEPS = [
  {
    step: "1",
    title: "Analiza tu web gratis",
    description:
      "Introduce tu dominio y en segundos revisamos los puntos básicos que afectan a cómo te encuentran tus clientes: conexión segura, título, descripción, encabezados y si se ve bien en el móvil.",
  },
  {
    step: "2",
    title: "Recibe tu Growth Score y tus misiones de hoy",
    description:
      "Traducimos lo que encontramos a un puntaje sobre 100 y a acciones concretas: 3 misiones diarias de 1-5 minutos y 1 misión semanal de más impacto. Nada de jerga técnica.",
  },
  {
    step: "3",
    title: "Completa misiones y sube de nivel",
    description:
      "Cada misión completada suma XP. Al subir de nivel desbloqueas más análisis, comparativas con la competencia y un roadmap a 90 días.",
  },
  {
    step: "4",
    title: "Acelera con mejoras o un Growth Sprint",
    description:
      "Si una misión requiere trabajo técnico, puedes aplicarla tú mismo o pedir que la implementemos nosotros por un precio cerrado — sin presupuestos ni sorpresas.",
  },
];

export default function ComoFuncionaPage() {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-6 py-16 sm:py-20">
      <div className="text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          Cómo funciona GrowthOS
        </h1>
        <p className="mt-3 text-lg text-zinc-600">
          Sin dashboards técnicos que no sabes leer. Solo lo que tienes que hacer hoy.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {STEPS.map((s) => (
          <GrowthCard key={s.step} className="flex gap-4">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-semibold text-white">
              {s.step}
            </span>
            <div>
              <h2 className="font-medium text-foreground">{s.title}</h2>
              <p className="mt-1 text-sm text-zinc-600">{s.description}</p>
            </div>
          </GrowthCard>
        ))}
      </div>

      <Link href="/" className="mx-auto">
        <Button className="mt-2">Ver mi Growth Score</Button>
      </Link>
    </div>
  );
}
