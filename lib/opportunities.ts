export interface Opportunity {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  expectedImpact: string;
  implementationTime: string;
}

// Catálogo del marketplace. Sin pago todavía (Stripe llega en el Sprint 4):
// "Aplicar esta mejora" registra una solicitud real, no procesa un cobro.
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "google-business",
    title: "Optimizar ficha de Google Business",
    description:
      "Revisamos y completamos tu ficha al completo: categorías, atributos, horarios, fotos y descripción, para que aparezcas mejor en búsquedas locales.",
    priceCents: 14900,
    expectedImpact: "Más apariciones en búsquedas cercanas a ti",
    implementationTime: "2-3 días laborables",
  },
  {
    id: "core-web-vitals",
    title: "Mejorar la velocidad y Core Web Vitals",
    description:
      "Optimizamos imágenes, scripts y carga de tu web para que sea rápida en cualquier móvil, algo que Google también tiene en cuenta para posicionarte.",
    priceCents: 24900,
    expectedImpact: "Menos visitantes que se van antes de que cargue",
    implementationTime: "3-5 días laborables",
  },
  {
    id: "schema",
    title: "Añadir datos estructurados (Schema)",
    description:
      "Implementamos información estructurada sobre tu negocio para que Google la entienda mejor y pueda mostrarte de forma más completa en los resultados.",
    priceCents: 17900,
    expectedImpact: "Mejor visibilidad en búsquedas locales",
    implementationTime: "1-2 días laborables",
  },
  {
    id: "faq-seo",
    title: "Crear página de preguntas frecuentes",
    description:
      "Redactamos y montamos una página de FAQ optimizada con las dudas que más te repiten tus clientes, pensada también para aparecer en Google.",
    priceCents: 9900,
    expectedImpact: "Menos consultas repetitivas, más SEO",
    implementationTime: "2-3 días laborables",
  },
  {
    id: "landing-optimizada",
    title: "Optimizar tu página para conversión",
    description:
      "Revisamos y reestructuramos tu página principal para que quede claro qué ofreces y sea fácil dar el siguiente paso (llamar, reservar, pedir cita).",
    priceCents: 29900,
    expectedImpact: "Más visitantes que se convierten en clientes",
    implementationTime: "4-6 días laborables",
  },
];
