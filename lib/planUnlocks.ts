import type { PlanId } from "@/lib/plans";

export interface PlanUnlockTip {
  title: string;
  tip: string;
}

/**
 * Copy del pequeño tutorial post-compra: qué se ha desbloqueado y cómo usarlo
 * de verdad, no solo la lista de features de marketing de `lib/plans.ts`.
 */
export const PLAN_UNLOCK_TIPS: Partial<Record<PlanId, PlanUnlockTip[]>> = {
  growth: [
    {
      title: "Quick Wins ilimitados al día",
      tip: "Ya no tienes el tope de 3 misiones diarias — complétalas todas según vayan apareciendo.",
    },
    {
      title: "Reanaliza tu web cuando quieras",
      tip: "Pulsa \"Reanalizar\" en tu dashboard para ver tu Growth Score actualizado al momento, sin esperar 7 días.",
    },
    {
      title: "Conecta tu Search Console y Analytics",
      tip: "Desde \"Analítica de Google\" en el menú, conecta tus cuentas reales para ver tus datos sin salir de aquí.",
    },
    {
      title: "Insignia Growth en tu perfil",
      tip: "Ya aparece en tu cuenta y en tus logros.",
    },
  ],
  autopilot: [
    {
      title: "Implementamos tus Quick Wins por ti",
      tip: "No tienes que tocar nada: nuestro equipo revisa tu cuenta y te implementa el trabajo real en tu web, hasta 4 por semana.",
    },
    {
      title: "Implementamos tu misión semanal",
      tip: "Tu misión de alto impacto de cada semana también te la hacemos nosotros.",
    },
    {
      title: "Todo lo de Growth sigue activo",
      tip: "Quick Wins ilimitados, reanálisis a demanda y tu conexión con Search Console/Analytics, incluidos.",
    },
  ],
};
