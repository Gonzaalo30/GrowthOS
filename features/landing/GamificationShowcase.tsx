import { GrowthCard } from "@/components/growth/GrowthCard";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { StreakBadge } from "@/components/growth/StreakBadge";
import { XPBar } from "@/components/growth/XPBar";
import { getLevelProgress } from "@/lib/levels";

// Ejemplo ilustrativo (no son datos de ningún usuario real) para enseñar
// desde la landing lo que ya existe de verdad dentro de la app.
const EXAMPLE_XP = 3200;
const EXAMPLE_STATS = [
  "38 Quick Wins completados",
  "6 mejoras implementadas",
  "18 días consecutivos",
];

export function GamificationShowcase() {
  const levelProgress = getLevelProgress(EXAMPLE_XP);

  return (
    <section className="mx-auto flex w-full max-w-4xl flex-col items-center gap-8 px-6 py-20 text-center">
      <div>
        <h2 className="text-3xl font-semibold tracking-tight text-foreground">
          Haz crecer tu negocio. Y también tu nivel.
        </h2>
        <p className="mt-3 max-w-xl text-zinc-600">
          Cada mejora que haces hace avanzar tu negocio y tu progreso dentro de GrowthOS — con niveles,
          racha y logros reales, no una lista de tareas más.
        </p>
      </div>

      <GrowthCard glow className="w-full max-w-sm text-left">
        <div className="flex items-center justify-between">
          <LevelBadge level={levelProgress.level} />
          <StreakBadge days={18} />
        </div>
        <div className="mt-4">
          <XPBar xp={EXAMPLE_XP} progress={levelProgress} />
        </div>
        <ul className="mt-5 flex flex-col gap-1.5">
          {EXAMPLE_STATS.map((stat) => (
            <li key={stat} className="flex items-center gap-2 text-sm text-zinc-600">
              <span className="text-brand-500">✓</span>
              {stat}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-zinc-400">Ejemplo ilustrativo de progreso dentro de GrowthOS.</p>
      </GrowthCard>
    </section>
  );
}
