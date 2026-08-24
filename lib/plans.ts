import { getLevelProgress } from "@/lib/levels";

export type PlanId = "starter" | "growth" | "autopilot";

export interface Plan {
  id: PlanId;
  name: string;
  priceCents: number;
  /** Nombre de la variable de entorno con el price id real de Stripe. */
  priceEnvVar: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Gratis",
    priceCents: 0,
    priceEnvVar: "",
    tagline: "Para empezar a mejorar tu negocio hoy mismo.",
    features: [
      "Growth Score y auditoría automática",
      "Hasta 3 Quick Wins diarios",
      "1 misión semanal de alto impacto",
      "Gamificación completa (XP, niveles, racha, cofre diario, logros)",
      "Centro de Mejoras: mejoras sueltas con precio cerrado",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceCents: 2900,
    priceEnvVar: "STRIPE_GROWTH_PRICE_ID",
    tagline: "Para quien quiere ir más rápido haciéndolo él mismo.",
    recommended: true,
    features: [
      "Todo lo del plan Gratis",
      "Quick Wins ilimitados al día",
      "Reanaliza tu web cuando quieras, sin esperar 7 días",
      "Insignia Growth en tu perfil",
    ],
  },
  {
    id: "autopilot",
    name: "Autopilot",
    priceCents: 9900,
    priceEnvVar: "STRIPE_AUTOPILOT_PRICE_ID",
    tagline: "Para cuando no tienes tiempo de tocar nada. Lo hacemos nosotros.",
    features: [
      "Todo lo del plan Growth",
      "Implementamos hasta 4 Quick Wins diarios por semana",
      "Implementamos tu misión semanal todas las semanas",
    ],
  },
];

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function planIdForPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const plan of PLANS) {
    if (plan.priceEnvVar && process.env[plan.priceEnvVar] === priceId) return plan.id;
  }
  return null;
}

/**
 * Nº máximo de Quick Wins pendientes a la vez. Growth y Autopilot no tienen
 * tope real. El bonus de nivel (ver `lib/levels.ts`, hitos en nivel 5 y 10)
 * se suma también en plan Gratis — a propósito no le acerca al tope de pago.
 */
export function dailyQuickWinCap(planId: string | null | undefined, xp: number): number {
  const base = planId === "growth" || planId === "autopilot" ? 20 : 3;
  return base + getLevelProgress(xp).level.bonusQuickWins;
}

/** Si el plan permite reanalizar la web cuando quiera, sin esperar el ciclo de 7 días. */
export function canRefreshOnDemand(planId: string | null | undefined): boolean {
  return planId === "growth" || planId === "autopilot";
}

/** Si el plan permite conectar Google Search Console y Analytics. */
export function canUseGoogleIntegrations(planId: string | null | undefined): boolean {
  return planId === "growth" || planId === "autopilot";
}
