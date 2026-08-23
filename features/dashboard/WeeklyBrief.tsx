"use client";

import { useEffect, useState } from "react";
import { GrowthCard } from "@/components/growth/GrowthCard";
import type { BriefMission } from "@/lib/weeklyBrief";

export function WeeklyBrief({
  name,
  xpLastWeek,
  streak,
  missions,
}: {
  name: string;
  xpLastWeek: number;
  streak: number;
  missions: BriefMission[];
}) {
  // Igual que Greeting: el día de la semana se calcula en el navegador, no en
  // el servidor (que corre en UTC), para que "es lunes" corresponda a la
  // zona horaria real del usuario.
  const [isMonday, setIsMonday] = useState<boolean | null>(null);

  useEffect(() => {
    setIsMonday(new Date().getDay() === 1);
  }, []);

  if (!isMonday || missions.length === 0) return null;

  const firstName = name.split(" ")[0];

  return (
    <GrowthCard glow className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">Resumen semanal</p>
      <p className="text-sm text-zinc-600">
        Buenos días, {firstName}. La semana pasada ganaste{" "}
        <span className="font-semibold text-foreground">{xpLastWeek} XP</span>
        {streak > 0 && (
          <>
            {" "}
            y mantuviste tu racha en <span className="font-semibold text-foreground">{streak} días</span>
          </>
        )}
        .
      </p>
      <div>
        <p className="mb-1.5 text-xs font-medium text-zinc-500">
          Las {missions.length === 1 ? "1 batalla que importa" : `${missions.length} batallas que importan`}{" "}
          esta semana
        </p>
        <ul className="flex flex-col gap-1.5">
          {missions.map((m, i) => (
            <li key={m.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="text-foreground">
                <span className="mr-1.5 font-semibold text-brand-600">{i + 1}.</span>
                {m.title}
                {m.isWeekly && " 👑"}
              </span>
              <span className="shrink-0 font-semibold text-brand-600">+{m.xpReward} XP</span>
            </li>
          ))}
        </ul>
      </div>
    </GrowthCard>
  );
}
