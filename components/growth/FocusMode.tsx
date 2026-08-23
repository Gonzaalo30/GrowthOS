"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfettiBurst } from "@/components/growth/ConfettiBurst";
import type { MissionTemplate } from "@/lib/missionTemplates";
import type { Database } from "@/types/database.types";

type Mission = Database["public"]["Tables"]["missions"]["Row"];

function useStopwatch(active: boolean) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [active]);
  return seconds;
}

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

/**
 * Pantalla completa deliberadamente oscura, distinta del resto de la app en
 * claro — es un modo de concentración puntual y reversible (Esc), no un
 * cambio de tema. Misma lógica de completar que MissionCard, delegada desde
 * fuera para no duplicar la llamada real a completeMissionAction.
 */
export function FocusMode({
  mission,
  template,
  isCompleted,
  isPending,
  isVerified,
  awardedXp,
  verifyError,
  onComplete,
  onClose,
}: {
  mission: Mission;
  template?: MissionTemplate;
  isCompleted: boolean;
  isPending: boolean;
  isVerified: boolean;
  awardedXp: number | null;
  verifyError: string | null;
  onComplete: () => void;
  onClose: () => void;
}) {
  const seconds = useStopwatch(!isCompleted);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-y-auto bg-zinc-950/97 px-6 py-12 backdrop-blur-sm">
      <button
        type="button"
        onClick={onClose}
        className="absolute right-6 top-6 rounded-md px-2 py-1 text-sm text-zinc-400 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white"
      >
        Salir (Esc)
      </button>

      <div className="relative w-full max-w-lg text-center">
        {isCompleted && <ConfettiBurst />}

        <p className="font-mono text-5xl font-semibold tracking-tight text-white tabular-nums">
          {formatTime(seconds)}
        </p>
        <p className="mt-1 text-xs uppercase tracking-wide text-zinc-500">
          {mission.type === "weekly" ? "Misión de la semana · Modo enfoque" : "Modo enfoque"}
        </p>

        <h1 className="mt-6 text-xl font-semibold text-white">{mission.title}</h1>
        <p className="mt-2 text-sm text-zinc-400">{mission.description}</p>
        {mission.expected_impact && <p className="mt-2 text-xs font-medium text-brand-400">{mission.expected_impact}</p>}

        {template && (
          <ol className="mt-6 flex flex-col gap-2 text-left">
            {template.tutorial.map((step, i) => (
              <li key={i} className="flex gap-2 text-sm text-zinc-300">
                <span className="font-semibold text-brand-400">{i + 1}.</span>
                {step}
              </li>
            ))}
          </ol>
        )}

        {template?.tip && (
          <p className="mt-4 rounded-lg bg-zinc-900 p-3 text-left text-sm text-brand-300">💡 {template.tip}</p>
        )}

        {verifyError && <p className="mt-4 text-sm text-red-400">{verifyError}</p>}

        <div className="mt-8 flex flex-col items-center gap-3">
          {isCompleted ? (
            <>
              <p className="text-2xl font-bold text-brand-400">+{awardedXp ?? mission.xp_reward} XP</p>
              <Button onClick={onClose} className="w-full max-w-xs">
                Volver
              </Button>
            </>
          ) : (
            <Button onClick={onComplete} disabled={isPending} className="w-full max-w-xs">
              {isPending ? (isVerified ? "Verificando…" : "Guardando…") : "Completar y reclamar XP"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
