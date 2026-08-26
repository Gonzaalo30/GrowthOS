import { GrowthCard } from "@/components/growth/GrowthCard";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { getLevelProgress } from "@/lib/levels";

// Ejemplo ilustrativo (no son datos de ningún usuario real). Misma idea que
// GamificationShowcase.tsx, pero liderando con el resultado de negocio en
// vez del nivel/XP — variante para comparar tono (ver ?variante=negocio).
const EXAMPLE_XP = 3200;
const EXAMPLE_STATS = [
  { value: "38", label: "mejoras completadas este mes" },
  { value: "6", label: "cambios reales implementados" },
];

export function GamificationShowcaseBusiness() {
  const levelProgress = getLevelProgress(EXAMPLE_XP);

  return (
    <div className="w-full bg-surface-muted">
      <section className="mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-20 text-center sm:py-28">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Resultados reales para tu negocio, semana a semana.
          </h2>
          <p className="mt-3 max-w-2xl text-lg text-zinc-600">
            Cada mejora que haces queda registrada — para que veas de verdad cuánto has avanzado, no solo
            una lista de tareas más.
          </p>
        </div>

        <GrowthCard glow className="w-full max-w-lg text-left">
          <div className="grid grid-cols-2 gap-4">
            {EXAMPLE_STATS.map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 flex items-center gap-2 border-t border-border pt-5">
            <LevelBadge level={levelProgress.level} />
            <StreakBadge days={18} />
          </div>
          <p className="mt-4 text-xs text-zinc-400">Ejemplo ilustrativo de progreso dentro de GrowthOS.</p>
        </GrowthCard>
      </section>
    </div>
  );
}
