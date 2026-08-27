import { createClient } from "@/lib/supabase/server";
import { getProfile } from "@/services/profile.service";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { CustomPlanForm } from "@/features/billing/CustomPlanForm";
import { pageMetadata } from "@/lib/seo";

export const metadata = pageMetadata({
  title: "Plan Personalizado",
  description:
    "¿No sabes qué plan de GrowthOS te conviene? Cuéntanos tu situación y tu presupuesto y te decimos qué encaja mejor, sin compromiso.",
  path: "/plan-personalizado",
});

export default async function PlanPersonalizadoPage() {
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
          Plan Personalizado
        </span>
        <h1 className="mt-4 text-3xl font-semibold tracking-tight text-foreground">
          ¿No sabes qué plan te conviene?
        </h1>
        <p className="mt-3 text-zinc-600">
          Cuéntanos tu situación real y tu presupuesto — analizamos tu caso y te decimos qué te conviene
          más, sin compromiso. Ideal si gestionas varios negocios o tienes algo particular.
        </p>
      </div>

      <GrowthCard>
        <CustomPlanForm defaultName={defaultName} defaultEmail={defaultEmail} />
      </GrowthCard>
    </div>
  );
}
