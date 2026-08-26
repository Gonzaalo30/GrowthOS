import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { GrowthSprintForm } from "@/features/billing/GrowthSprintForm";

const AREAS = ["SEO", "Velocidad", "Local", "Conversión"];

export default async function GrowthSprintPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let defaultName: string | undefined;
  let defaultEmail: string | undefined;
  if (user) {
    try {
      const profile = await getProfile(supabase, user.id);
      defaultName = profile.name;
      defaultEmail = profile.email;
    } catch {
      defaultEmail = user.email ?? undefined;
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-16">
      <div className="text-center">
        <span className="rounded-full bg-brand-50 px-3 py-1 text-xs font-medium text-brand-600">
          Growth Sprint
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          Cuando una mejora suelta ya no es suficiente
        </h1>
        <p className="mt-3 text-zinc-600">
          Una intervención intensiva y coordinada para acelerar tu negocio en varios frentes a la vez, en
          vez de ir mejora a mejora.
        </p>
      </div>

      <GrowthCard className="flex flex-col items-center gap-4 text-center">
        <p className="text-3xl font-semibold text-foreground">Desde 1.500 €</p>
        <p className="text-sm text-zinc-600">
          El alcance real (qué se toca y cuánto trabajo lleva) depende de tu situación — por eso no tiene un
          precio cerrado como el resto del Centro de Mejoras.
        </p>
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
      </GrowthCard>

      <GrowthCard>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
          Cuéntanos tu situación
        </h2>
        <GrowthSprintForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </GrowthCard>
    </div>
  );
}
