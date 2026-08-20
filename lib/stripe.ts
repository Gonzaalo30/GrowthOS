import Stripe from "stripe";

let client: Stripe | null = null;

/** Lanza un error claro si falta la clave, en vez de un fallo críptico de Stripe. */
export function getStripe(): Stripe {
  if (client) return client;

  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY no está configurada. Añádela a .env.local para activar los pagos.",
    );
  }

  client = new Stripe(secretKey);
  return client;
}
