import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { PlanCheckoutButton } from "@/features/billing/PlanCheckoutButton";

const INCLUDED = [
  "Implementamos tus 3 misiones diarias cada día, sin que tengas que tocar nada",
  "Implementamos tu misión semanal de alto impacto",
  "Tú sigues viendo el progreso y el XP en tu dashboard, como si lo hicieras tú mismo",
  "Cancela cuando quieras, sin permanencia",
];

export default function PlanAutopilotPage() {
  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
          Plan Autopilot
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Deja que nosotros hagamos tus misiones
        </h1>
        <p className="mt-3 text-zinc-600">
          Para cuando no tienes tiempo de dedicarle ni 15 minutos al día. Nos encargamos nosotros.
        </p>
      </div>

      <GrowthCard className="text-center">
        <p className="text-4xl font-semibold text-foreground">
          99 € <span className="text-base font-normal text-zinc-500">/ mes</span>
        </p>
        <p className="mt-1 text-sm text-zinc-500">Sin permanencia. Cancela cuando quieras.</p>

        <ul className="mt-6 flex flex-col gap-2 text-left">
          {INCLUDED.map((item) => (
            <li key={item} className="flex gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <PlanCheckoutButton planId="autopilot" label="Suscribirme por 99 €/mes" />
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          No incluye{" "}
          <Link href="/growth-sprint" className="underline underline-offset-2 hover:text-foreground">
            Growth Sprints
          </Link>{" "}
          (proyectos grandes, se cotizan aparte). Necesitas una cuenta creada para suscribirte.
        </p>
      </GrowthCard>
    </div>
  );
}
