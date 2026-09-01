export const IVA_RATE = 0.21;

/**
 * Todos los precios de `lib/plans.ts`/`lib/opportunities.ts` son precios
 * BASE (sin IVA) — el 21% se añade de verdad en el cobro real de Stripe
 * (ver `STRIPE_IVA_TAX_RATE_ID`, adjuntado a cada línea del checkout), así
 * que este cálculo debe coincidir exactamente con lo que Stripe cobra.
 */
export function priceWithIVA(cents: number): number {
  return Math.round(cents * (1 + IVA_RATE));
}

export function formatEuros(cents: number): string {
  return `${(cents / 100).toLocaleString("es-ES")} €`;
}
