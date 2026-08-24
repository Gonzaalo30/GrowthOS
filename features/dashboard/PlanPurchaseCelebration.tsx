"use client";

import { useEffect, useState } from "react";
import { PurchaseCelebrationModal } from "@/components/growth/PurchaseCelebrationModal";
import type { Plan } from "@/lib/plans";
import type { Achievement } from "@/lib/achievements";

/**
 * Se renderiza solo cuando el servidor detecta `?plan=success` en la URL
 * (ver dashboard/page.tsx). Al montar, limpia el parámetro de la barra de
 * direcciones sin navegar (así un refresco no repite la celebración), y
 * enseña el pop-up con estado propio, ya independiente de la URL.
 */
export function PlanPurchaseCelebration({
  plan,
  justUnlockedAchievement,
}: {
  plan: Plan;
  justUnlockedAchievement: Achievement | null;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("plan");
    window.history.replaceState({}, "", url);
  }, []);

  if (!show) return null;
  return (
    <PurchaseCelebrationModal
      content={{ kind: "plan", plan }}
      justUnlockedAchievement={justUnlockedAchievement}
      onClose={() => setShow(false)}
    />
  );
}
