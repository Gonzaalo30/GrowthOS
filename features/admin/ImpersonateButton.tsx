"use client";

import { Button } from "@/components/ui/Button";
import { impersonateUserAction } from "@/app/actions/admin";

export function ImpersonateButton({ userId, userLabel }: { userId: string; userLabel: string }) {
  return (
    <form
      action={impersonateUserAction}
      onSubmit={(e) => {
        const confirmed = window.confirm(
          `Vas a iniciar sesión como ${userLabel}. Se cierra tu sesión de admin — tendrás que volver a iniciar sesión después para recuperarla. ¿Continuar?`,
        );
        if (!confirmed) e.preventDefault();
      }}
    >
      <input type="hidden" name="userId" value={userId} />
      <Button type="submit" variant="secondary" className="whitespace-nowrap text-xs">
        Entrar como este usuario
      </Button>
    </form>
  );
}
