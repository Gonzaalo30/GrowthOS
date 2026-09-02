import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database.types";
import { startDeepAudit } from "@/lib/deepAuditCoordinator";

type Client = SupabaseClient<Database>;

/**
 * Dispara la auditoría profunda de un negocio sin bloquear la petición que
 * la pide (carga del dashboard, alta en onboarding, botón "Reanalizar"). Los
 * 4 pasos son peticiones HTTP reales a sus propios Route Handlers, cada uno
 * con su propio presupuesto de 60s — se usa `after()` de Next.js para que
 * sigan en marcha después de haber respondido ya a quien las pidió, sin
 * alargar esa respuesta.
 */
export async function triggerDeepAudit(supabase: Client, businessId: string, domain: string) {
  await startDeepAudit(supabase, businessId);

  after(async () => {
    const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
    const requests: { path: string; body: Record<string, unknown> }[] = [
      { path: "/api/deep-audit/pages", body: { businessId, domain } },
      { path: "/api/deep-audit/pagespeed", body: { businessId, domain, strategy: "mobile" } },
      { path: "/api/deep-audit/pagespeed", body: { businessId, domain, strategy: "desktop" } },
      { path: "/api/deep-audit/responsive", body: { businessId, domain } },
    ];

    await Promise.allSettled(
      requests.map(({ path, body }) =>
        fetch(`${origin}${path}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        }),
      ),
    );
  });
}
