"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { signOutOtherSessionsAction } from "@/app/actions/mfa";

export function SignOutOtherSessionsButton() {
  const [isPending, startTransition] = useTransition();
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);
    startTransition(async () => {
      const result = await signOutOtherSessionsAction();
      if (result.success) {
        setDone(true);
      } else {
        setError(result.error ?? "No hemos podido cerrar el resto de sesiones.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-1.5">
      <Button variant="secondary" onClick={handleClick} disabled={isPending} className="self-start">
        {isPending ? "Cerrando…" : "Cerrar sesión en todos los demás dispositivos"}
      </Button>
      {done && <p className="text-sm text-emerald-600">Hecho. Solo sigue activa esta sesión.</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}
