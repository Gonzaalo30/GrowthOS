import { GrowthCard } from "@/components/growth/GrowthCard";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { XPBar } from "@/components/growth/XPBar";
import { Reveal } from "@/components/motion/Reveal";
import { getLevelProgress } from "@/lib/levels";

// Ejemplo ilustrativo (no son datos de ningún usuario real) para enseñar
// desde la landing lo que ya existe de verdad dentro de la app.
const EXAMPLE_XP = 3200;
const EXAMPLE_STATS = [
  { value: "38", label: "Quick Wins completados" },
  { value: "6", label: "mejoras implementadas" },
  { value: "18", label: "días consecutivos" },
];

export function GamificationShowcase() {
  const levelProgress = getLevelProgress(EXAMPLE_XP);

  return (
    <div className="w-full bg-surface-muted">
      <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-6 py-14 text-center sm:py-20 lg:grid-cols-2 lg:gap-16 lg:text-left">
        <Reveal>
          <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Haz crecer tu negocio. Y también tu nivel.
          </h2>
          <p className="mt-3 text-lg text-zinc-600 lg:max-w-md">
            Cada mejora que haces hace avanzar tu negocio y tu progreso dentro de GrowthOS — con niveles,
            racha y logros reales, no una lista de tareas más.
          </p>
        </Reveal>

        <Reveal delay={0.15} className="w-full lg:justify-self-end">
          <GrowthCard glow className="w-full max-w-lg text-left">
            <div className="flex items-center justify-between">
              <LevelBadge level={levelProgress.level} />
              <StreakBadge days={18} />
            </div>
            <div className="mt-4">
              <XPBar xp={EXAMPLE_XP} progress={levelProgress} />
            </div>
            <div className="mt-6 grid grid-cols-3 gap-4 border-t border-border pt-5">
              {EXAMPLE_STATS.map((stat) => (
                <div key={stat.label}>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">{stat.label}</p>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-400">Ejemplo ilustrativo de progreso dentro de GrowthOS.</p>
          </GrowthCard>
        </Reveal>
      </section>
    </div>
  );
}
