import Link from "next/link";
import { GrowthCard } from "@/components/growth/GrowthCard";
import { Button } from "@/components/ui/Button";
import { SelectPropertiesForm } from "@/features/integrations/SelectPropertiesForm";
import {
  connectGoogleAction,
  refreshGoogleDataAction,
  disconnectGoogleAction,
} from "@/app/actions/googleIntegration";
import type { Plan } from "@/lib/plans";
import type { Database } from "@/types/database.types";
import type { SearchConsoleSummary, AnalyticsSummary } from "@/lib/googleApis";

type GoogleIntegration = Database["public"]["Tables"]["google_integrations"]["Row"];

const ERROR_MESSAGES: Record<string, string> = {
  cancelado: "Has cancelado la conexión con Google.",
  estado_invalido: "La conexión ha caducado o no es válida. Inténtalo de nuevo.",
  conexion_fallida: "No hemos podido completar la conexión con Google. Inténtalo de nuevo.",
  sync_fallido: "No hemos podido actualizar los datos ahora mismo. Inténtalo en un momento.",
  no_configurado: "Esta funcionalidad todavía no está disponible. Vuelve pronto.",
};

function formatDelta(current: number, previous: number): { text: string; positive: boolean } {
  if (previous === 0) return { text: current > 0 ? "nuevo" : "—", positive: current >= previous };
  const pct = Math.round(((current - previous) / previous) * 100);
  return { text: `${pct >= 0 ? "+" : ""}${pct}%`, positive: pct >= 0 };
}

function DeltaBadge({ current, previous }: { current: number; previous: number }) {
  const { text, positive } = formatDelta(current, previous);
  return (
    <span className={`text-xs font-medium ${positive ? "text-emerald-600" : "text-red-600"}`}>{text}</span>
  );
}

export function GoogleIntegrationView({
  locked,
  plan,
  integration,
  availableProperties,
  error,
}: {
  locked: boolean;
  plan: Plan;
  integration?: GoogleIntegration | null;
  availableProperties?: { sites: { siteUrl: string }[]; properties: { propertyId: string; propertyName: string }[] } | null;
  error?: string;
}) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div>
        <h1 className="text-xl font-semibold text-foreground">Analítica de Google</h1>
        <p className="mt-1 text-sm text-zinc-600">
          Tus datos reales de Google Search Console y Google Analytics, sin salir de GrowthOS.
        </p>
      </div>

      {error && ERROR_MESSAGES[error] && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{ERROR_MESSAGES[error]}</p>
      )}

      {locked ? (
        <GrowthCard glow className="flex flex-col items-center gap-3 py-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">Disponible en el plan Growth y Autopilot</h2>
          <p className="max-w-md text-sm text-zinc-600">
            Conecta tu Search Console y tu Analytics y consulta tus métricas reales de SEO y tráfico directamente
            aquí, sin abrir los dashboards de Google. Estás en el plan {plan.name}.
          </p>
          <Link href="/precios">
            <Button type="button" className="mt-1">
              Ver planes de pago
            </Button>
          </Link>
        </GrowthCard>
      ) : !integration ? (
        <GrowthCard glow className="flex flex-col items-center gap-3 py-10 text-center">
          <h2 className="text-lg font-semibold text-foreground">Conecta tu cuenta de Google</h2>
          <p className="max-w-md text-sm text-zinc-600">
            Te llevamos a Google para que autorices el acceso de solo lectura a tu Search Console y tu Analytics.
          </p>
          <form action={connectGoogleAction}>
            <Button type="submit" className="mt-1">
              Conectar Google Search Console y Analytics
            </Button>
          </form>
        </GrowthCard>
      ) : !integration.search_console_site_url || !integration.ga4_property_id ? (
        <GrowthCard className="flex flex-col gap-4">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Conectado como {integration.google_email}</h2>
            <p className="mt-1 text-sm text-zinc-600">Elige qué sitio y qué propiedad quieres ver aquí.</p>
          </div>
          <SelectPropertiesForm
            sites={availableProperties?.sites ?? []}
            properties={availableProperties?.properties ?? []}
          />
        </GrowthCard>
      ) : (
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface px-4 py-3">
            <p className="text-sm text-zinc-600">
              Conectado como <span className="font-medium text-foreground">{integration.google_email}</span>
              {integration.last_synced_at && (
                <>
                  {" · "}Última sincronización:{" "}
                  {new Date(integration.last_synced_at).toLocaleString("es-ES", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </>
              )}
            </p>
            <div className="flex items-center gap-2">
              <form action={refreshGoogleDataAction}>
                <Button type="submit" variant="secondary">
                  Actualizar ahora
                </Button>
              </form>
              <form action={disconnectGoogleAction}>
                <Button type="submit" variant="ghost" className="text-red-600 hover:bg-red-50">
                  Desconectar
                </Button>
              </form>
            </div>
          </div>

          {integration.search_console_data ? (
            <SearchConsoleCard data={integration.search_console_data as unknown as SearchConsoleSummary} />
          ) : null}
          {integration.analytics_data ? (
            <AnalyticsCard data={integration.analytics_data as unknown as AnalyticsSummary} />
          ) : null}
        </div>
      )}
    </div>
  );
}

function SearchConsoleCard({ data }: { data: SearchConsoleSummary }) {
  return (
    <GrowthCard>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Search Console · últimos 28 días
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Metric label="Clics" value={data.clicks} current={data.clicks} previous={data.previousClicks} />
        <Metric
          label="Impresiones"
          value={data.impressions}
          current={data.impressions}
          previous={data.previousImpressions}
        />
        <Metric label="CTR" value={`${(data.ctr * 100).toFixed(1)}%`} />
        <Metric label="Posición media" value={data.position.toFixed(1)} />
      </div>

      <div className="mt-5 grid gap-5 sm:grid-cols-2">
        <TopTable title="Consultas con más clics" rows={data.topQueries.map((q) => ({ label: q.query, value: q.clicks }))} />
        <TopTable title="Páginas con más clics" rows={data.topPages.map((p) => ({ label: p.page, value: p.clicks }))} />
      </div>
    </GrowthCard>
  );
}

function AnalyticsCard({ data }: { data: AnalyticsSummary }) {
  return (
    <GrowthCard>
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
        Google Analytics · últimos 28 días
      </h2>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <Metric label="Sesiones" value={data.sessions} current={data.sessions} previous={data.previousSessions} />
        <Metric
          label="Conversiones"
          value={data.conversions}
          current={data.conversions}
          previous={data.previousConversions}
        />
        <Metric label="Tasa de rebote" value={`${(data.bounceRate * 100).toFixed(1)}%`} />
      </div>

      <div className="mt-5">
        <TopTable title="Canales con más sesiones" rows={data.topChannels.map((c) => ({ label: c.channel, value: c.sessions }))} />
      </div>
    </GrowthCard>
  );
}

function Metric({
  label,
  value,
  current,
  previous,
}: {
  label: string;
  value: string | number;
  current?: number;
  previous?: number;
}) {
  return (
    <div>
      <p className="text-xs text-zinc-500">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <p className="text-xl font-semibold text-foreground">{value}</p>
        {current !== undefined && previous !== undefined && <DeltaBadge current={current} previous={previous} />}
      </div>
    </div>
  );
}

function TopTable({ title, rows }: { title: string; rows: { label: string; value: number }[] }) {
  return (
    <div>
      <p className="mb-2 text-xs font-semibold text-zinc-500">{title}</p>
      {rows.length === 0 ? (
        <p className="text-sm text-zinc-500">Sin datos todavía.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center justify-between gap-3 text-sm">
              <span className="truncate text-zinc-700">{r.label}</span>
              <span className="shrink-0 font-medium text-foreground">{r.value}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
