"use client";

import { useState } from "react";
import { LevelBadge } from "@/components/growth/LevelBadge";
import { LevelsModal } from "@/components/growth/LevelsModal";
import { LEVELS, type Level } from "@/lib/levels";

/** Insignia de nivel real (del negocio con sesión), clicable para ver la lista completa. */
export function LevelsExplorer({ level }: { level: Level }) {
  const [open, setOpen] = useState(false);
  const currentLevelIndex = LEVELS.findIndex((l) => l.name === level.name);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full outline-none transition-transform hover:scale-105 focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <LevelBadge level={level} />
      </button>
      {open && <LevelsModal currentLevelIndex={currentLevelIndex} onClose={() => setOpen(false)} />}
    </>
  );
}

/** Vista pública del listado completo de niveles, sin negocio con sesión (marketing). */
export function LevelsPreviewLink({ label = "Ver todos los niveles y beneficios →" }: { label?: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-brand-600 underline-offset-2 outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        {label}
      </button>
      {open && <LevelsModal currentLevelIndex={null} onClose={() => setOpen(false)} />}
    </>
  );
}
