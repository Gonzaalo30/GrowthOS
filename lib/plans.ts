import { getLevelProgress } from "@/lib/levels";

export type PlanId = "starter" | "growth" | "autopilot" | "agencia";

export interface Plan {
  id: PlanId;
  name: string;
  priceCents: number;
  /** Nombre de la variable de entorno con el price id real de Stripe. */
  priceEnvVar: string;
  tagline: string;
  features: string[];
  recommended?: boolean;
  /** Si existe, el plan también se puede pagar anual con descuento (-20%, 2 meses gratis). */
  annual?: { priceCents: number; priceEnvVar: string };
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
    annual: { priceCents: 27800, priceEnvVar: "STRIPE_GROWTH_ANNUAL_PRICE_ID" },
    features: [
      "Todo lo del plan Gratis",
      "Quick Wins ilimitados al día",
      "Reanaliza tu web cuando quieras, sin esperar 7 días",
      "Conecta tu Search Console y Analytics reales para misiones más personalizadas",
      "Checklist real de tu ficha de Google Business, con misiones por cada cosa que falte",
      "Insignia Growth en tu perfil",
    ],
  },
  {
    id: "autopilot",
    name: "Autopilot",
    priceCents: 9900,
    priceEnvVar: "STRIPE_AUTOPILOT_PRICE_ID",
    tagline: "Para cuando no tienes tiempo de tocar nada. Lo hacemos nosotros.",
    annual: { priceCents: 95000, priceEnvVar: "STRIPE_AUTOPILOT_ANNUAL_PRICE_ID" },
    features: [
      "Todo lo del plan Growth",
      "Implementamos hasta 4 Quick Wins diarios por semana",
      "Implementamos tu misión semanal todas las semanas",
    ],
  },
  {
    id: "agencia",
    name: "Agencia",
    priceCents: 9900,
    priceEnvVar: "STRIPE_AGENCIA_PRICE_ID",
    tagline: "Para gestores y agencias que llevan varios negocios a la vez.",
    features: [
      "Hasta 5 negocios con funciones Growth cada uno",
      "Quick Wins ilimitados y reanálisis a demanda por negocio",
      "Conecta Search Console y Analytics, y el checklist de ficha de Google Business, por cada negocio",
      "+15€/mes por negocio adicional a partir del 5º",
      "No incluye Autopilot",
    ],
  },
];

/** Precio real del slot extra de Agencia (15€/mes), más allá de los 5 incluidos en la base. */
export const AGENCY_EXTRA_SLOT_PRICE_CENTS = 1500;

export function getPlan(id: string | null | undefined): Plan {
  return PLANS.find((p) => p.id === id) ?? PLANS[0];
}

export function planIdForPriceId(priceId: string | null | undefined): PlanId | null {
  if (!priceId) return null;
  for (const plan of PLANS) {
    if (plan.priceEnvVar && process.env[plan.priceEnvVar] === priceId) return plan.id;
    if (plan.annual?.priceEnvVar && process.env[plan.annual.priceEnvVar] === priceId) return plan.id;
  }
  return null;
}

/**
 * Nº máximo de Quick Wins pendientes a la vez. Growth y Autopilot no tienen
 * tope real. El bonus de nivel (ver `lib/levels.ts`, hitos en nivel 5 y 10)
 * se suma también en plan Gratis — a propósito no le acerca al tope de pago.
 */
export function dailyQuickWinCap(planId: string | null | undefined, xp: number): number {
  const base = planId === "growth" || planId === "autopilot" || planId === "agencia" ? 20 : 3;
  return base + getLevelProgress(xp).level.bonusQuickWins;
}

/** Si el plan permite reanalizar la web cuando quiera, sin esperar el ciclo de 7 días. */
export function canRefreshOnDemand(planId: string | null | undefined): boolean {
  return planId === "growth" || planId === "autopilot" || planId === "agencia";
}

/** Si el plan permite conectar Google Search Console y Analytics. */
export function canUseGoogleIntegrations(planId: string | null | undefined): boolean {
  return planId === "growth" || planId === "autopilot" || planId === "agencia";
}

/** Cuántos negocios puede tener un owner con suscripción de Agencia activa: 5 incluidos + slots extra comprados. */
export function agencyIncludedCapacity(extraSlots: number): number {
  return 5 + extraSlots;
}
