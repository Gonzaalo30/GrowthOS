import { NextResponse } from "next/server";
import { PLANS } from "@/lib/plans";
import { priceWithIVA } from "@/lib/tax";
import { SITE_URL } from "@/lib/seo";

// Convención llms.txt (llmstxt.org): un resumen real y conciso del producto,
// en markdown plano, para que los asistentes de IA que lean la web entiendan
// qué es GrowthOS sin tener que interpretar el HTML/CSS de las páginas.
// Generado a partir de los mismos datos reales que ya se muestran en /precios
// (lib/plans.ts) — nunca texto de marketing aparte que pueda desincronizarse.
export async function GET() {
  const paidPlans = PLANS.filter((plan) => plan.priceCents > 0);

  const planLines = PLANS.map((plan) => {
    const price =
      plan.priceCents === 0
        ? "gratis"
        : `${(plan.priceCents / 100).toLocaleString("es-ES")} €/mes + IVA, ${(priceWithIVA(plan.priceCents) / 100).toLocaleString("es-ES")} €/mes con IVA`;
    return `- **${plan.name}** (${price}): ${plan.tagline}`;
  }).join("\n");

  const body = `# GrowthOS

> GrowthOS analiza automáticamente la web de un negocio local (SSL, título, meta descripción, encabezados, velocidad, enlaces rotos, datos estructurados y más) y genera un Growth Score sobre 100 junto con misiones diarias concretas de 1-5 minutos para mejorarlo — sin jerga técnica. Gamifica el progreso con XP, niveles y racha, y ofrece un plan "Autopilot" en el que el equipo implementa las misiones por el cliente.

## Planes (precios reales, + IVA)

${planLines}

También hay un "Growth Sprint" (desde 1.500€ + IVA, pago único) para intervenciones intensivas y a medida cuando una mejora suelta no es suficiente, y un Centro de Mejoras con mejoras sueltas de precio cerrado + IVA (SEO técnico, velocidad, seguridad, conversión).

## Páginas principales

- [Precios](${SITE_URL}/precios): los ${paidPlans.length} planes de pago y las mejoras sueltas del Centro de Mejoras.
- [Cómo funciona](${SITE_URL}/como-funciona): el proceso paso a paso, de analizar la web a completar misiones.
- [Preguntas frecuentes](${SITE_URL}/faq): qué es GrowthOS, cómo se calcula el Growth Score, precios y datos.
- [Ejemplos por tipo de negocio](${SITE_URL}/casos-de-exito): tipo de misiones reales según el sector (sin testimonios inventados — GrowthOS es un producto nuevo).
- [Growth Sprint](${SITE_URL}/growth-sprint): intervención intensiva a medida.
- [Plan Autopilot](${SITE_URL}/plan-autopilot) y [Plan Agencia](${SITE_URL}/plan-agencia).

## Contacto

hola@gonzalomarketinglab.com
`;

  return new NextResponse(body, {
    headers: { "Content-Type": "text/markdown; charset=utf-8" },
  });
}
