import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { createAgencyCheckoutAction } from "@/app/actions/agency";
import { getPlan, AGENCY_EXTRA_SLOT_PRICE_CENTS } from "@/lib/plans";

const ERROR_MESSAGES: Record<string, string> = {
  no_configurado: "Esta funcionalidad todavía no está disponible. Vuelve pronto.",
  conexion_fallida: "No hemos podido conectar con el pago. Inténtalo de nuevo en un momento.",
};

export default async function PlanAgenciaPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; canceled?: string }>;
}) {
  const { error } = await searchParams;
  const plan = getPlan("agencia");
  const extraSlotPrice = (AGENCY_EXTRA_SLOT_PRICE_CENTS / 100).toLocaleString("es-ES");

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
          Plan Agencia
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          ¿Gestionas varios negocios a la vez?
        </h1>
        <p className="mt-3 text-zinc-600">
          Pensado para gestores y agencias de marketing local: cada cliente tiene su propio Growth Score,
          sus propias misiones y sus propios datos — todo bajo una sola cuenta y un solo precio.
        </p>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      <GrowthCard className="text-center">
        <p className="text-4xl font-semibold text-foreground">
          {(plan.priceCents / 100).toLocaleString("es-ES")} €{" "}
          <span className="text-base font-normal text-zinc-500">/ mes</span>
        </p>
        <p className="mt-1 text-sm text-zinc-500">
          Hasta 5 negocios incluidos · IVA incluido · Sin permanencia, cancela cuando quieras
        </p>

        <ul className="mt-6 flex flex-col gap-2 text-left">
          {plan.features.map((feature) => (
            <li key={feature} className="flex gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              {feature}
            </li>
          ))}
        </ul>

        <div className="mt-6">
          <form action={createAgencyCheckoutAction}>
            <Button type="submit" className="w-full">
              Empezar con Agencia
            </Button>
          </form>
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          ¿Más de 5 negocios? Añade slots extra desde &quot;Mi cuenta&quot; una vez tengas Agencia activa,
          a {extraSlotPrice} €/mes cada uno. Necesitas una cuenta creada para suscribirte.
        </p>
      </GrowthCard>
    </div>
  );
}
