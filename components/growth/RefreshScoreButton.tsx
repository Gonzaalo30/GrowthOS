"use client";

import { useState, useTransition } from "react";
import { forceRefreshGrowthScoreAction } from "@/app/actions/audit";

export function RefreshScoreButton() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await forceRefreshGrowthScoreAction();
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "No se ha podido reanalizar.");
      }
    });
  }

  if (done) {
    return <p className="text-xs text-emerald-600">Analizado. Tu Growth Score está al día.</p>;
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="text-xs font-medium text-brand-600 underline decoration-dotted underline-offset-2 hover:text-brand-700 disabled:opacity-50"
      >
        {isPending ? "Analizando…" : "Reanalizar ahora"}
      </button>
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
}
