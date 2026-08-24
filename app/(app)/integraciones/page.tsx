import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getActiveBusiness } from "@/services/business.service";
import { canUseGoogleIntegrations, getPlan } from "@/lib/plans";
import {
  getIntegration,
  refreshDataIfStale,
  listAvailableProperties,
} from "@/services/googleIntegration.service";
import { GoogleIntegrationView } from "@/features/integrations/GoogleIntegrationView";

export default async function IntegracionesPage({
  searchParams,
}: {
  searchParams: Promise<{ connected?: string; error?: string }>;
}) {
  const { error } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const business = await getActiveBusiness(supabase, user.id);
  if (!business) redirect("/onboarding");

  if (!canUseGoogleIntegrations(business.plan)) {
    return <GoogleIntegrationView locked plan={getPlan(business.plan)} error={error} />;
  }

  let integration = await getIntegration(supabase, business.id);
  const hasSearchConsole = Boolean(integration?.search_console_site_url);
  const hasAnalytics = Boolean(integration?.ga4_property_id);

  if (integration && (hasSearchConsole || hasAnalytics)) {
    // Igual patrón que refreshGrowthScoreIfStale: si falla, se muestra el
    // último snapshot guardado en vez de romper la página.
    try {
      integration = await refreshDataIfStale(supabase, business.id);
    } catch {
      // se mantiene el snapshot anterior
    }
  }

  // Se piden las opciones reales de Google mientras falte configurar
  // cualquiera de los dos — cada bloque (Search Console / Analytics) es
  // independiente, uno puede quedar sin configurar indefinidamente.
  let availableProperties: Awaited<ReturnType<typeof listAvailableProperties>> = null;
  if (integration && (!hasSearchConsole || !hasAnalytics)) {
    try {
      availableProperties = await listAvailableProperties(supabase, business.id);
    } catch {
      // el usuario verá el estado "conectado" sin opciones; puede reintentar
    }
  }

  return (
    <GoogleIntegrationView
      locked={false}
      plan={getPlan(business.plan)}
      integration={integration}
      availableProperties={availableProperties}
      error={error}
    />
  );
}
