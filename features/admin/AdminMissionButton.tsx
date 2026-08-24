"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { adminCompleteMissionAction } from "@/app/actions/admin";

export function AdminMissionButton({ missionId }: { missionId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      disabled={isPending}
      onClick={() => startTransition(async () => adminCompleteMissionAction(missionId))}
    >
      {isPending ? "Guardando…" : "Marcar como implementada"}
    </Button>
  );
}
