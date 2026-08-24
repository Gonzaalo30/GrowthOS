"use client";

import { useEffect, useState } from "react";
import { PurchaseCelebrationModal } from "@/components/growth/PurchaseCelebrationModal";
import type { Opportunity } from "@/lib/opportunities";
import type { Achievement } from "@/lib/achievements";

/**
 * Se renderiza solo cuando el servidor detecta `?compra=exito` en la URL
 * (ver marketplace/page.tsx). Mismo patrón que PlanPurchaseCelebration:
 * limpia los parámetros al montar para que un refresco no repita el pop-up.
 */
export function OpportunityPurchaseCelebration({
  opportunity,
  justUnlockedAchievement,
}: {
  opportunity: Opportunity;
  justUnlockedAchievement: Achievement | null;
}) {
  const [show, setShow] = useState(true);

  useEffect(() => {
    const url = new URL(window.location.href);
    url.searchParams.delete("compra");
    url.searchParams.delete("item");
    window.history.replaceState({}, "", url);
  }, []);

  if (!show) return null;
  return (
    <PurchaseCelebrationModal
      content={{ kind: "opportunity", opportunity }}
      justUnlockedAchievement={justUnlockedAchievement}
      onClose={() => setShow(false)}
    />
  );
}
