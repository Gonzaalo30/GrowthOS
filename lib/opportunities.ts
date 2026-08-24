export type OpportunityCategory = "seo" | "google" | "velocidad" | "conversion" | "seguridad";

export const OPPORTUNITY_CATEGORY_LABELS: Record<OpportunityCategory, string> = {
  seo: "SEO",
  google: "Google",
  velocidad: "Velocidad",
  conversion: "Conversiones",
  seguridad: "Seguridad",
};

export type OpportunityPricing = "one_time" | "monthly";

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  priceCents: number;
  pricing: OpportunityPricing;
  expectedImpact: string;
  /** Para one_time: cuándo se entrega. Para monthly: cómo funciona el servicio recurrente. */
  implementationTime: string;
  category: OpportunityCategory;
}

// Catálogo del Centro de Mejoras. Pago real vía Stripe Checkout (pago único o
// suscripción mensual según `pricing`) — "Comprar" crea un cobro de verdad,
// no una solicitud sin cobrar.
export const OPPORTUNITIES: Opportunity[] = [
  {
    id: "google-business",
    title: "Optimizar ficha de Google Business",
    description:
      "Revisamos y completamos tu ficha al completo: categorías, atributos, horarios, fotos y descripción, para que aparezcas mejor en búsquedas locales.",
    priceCents: 14900,
    pricing: "one_time",
    expectedImpact: "Más apariciones en búsquedas cercanas a ti",
    implementationTime: "2-3 días laborables",
    category: "google",
  },
  {
    id: "google-business-management",
    title: "Gestión mensual de tu ficha de Google Business",
    description:
      "Publicamos novedades, respondemos tus reseñas y mantenemos la ficha actualizada cada mes, para que nunca quede abandonada.",
    priceCents: 4900,
    pricing: "monthly",
    expectedImpact: "Ficha siempre activa y mejor posicionamiento local sostenido en el tiempo",
    implementationTime: "Servicio mensual, sin permanencia — cancelas cuando quieras",
    category: "google",
  },
  {
    id: "core-web-vitals",
    title: "Mejorar la velocidad y Core Web Vitals",
    description:
      "Optimizamos imágenes, scripts y carga de tu web para que sea rápida en cualquier móvil, algo que Google también tiene en cuenta para posicionarte.",
    priceCents: 24900,
    pricing: "one_time",
    expectedImpact: "Menos visitantes que se van antes de que cargue",
    implementationTime: "3-5 días laborables",
    category: "velocidad",
  },
  {
    id: "web-maintenance",
    title: "Mantenimiento mensual de tu web",
    description:
      "Copias de seguridad, actualizaciones y una comprobación mensual de que todo sigue funcionando correctamente (enlaces, formularios, velocidad).",
    priceCents: 3900,
    pricing: "monthly",
    expectedImpact: "Menos sustos: detectamos los problemas antes de que te los diga un cliente",
    implementationTime: "Servicio mensual, sin permanencia — cancelas cuando quieras",
    category: "velocidad",
  },
  {
    id: "schema",
    title: "Añadir datos estructurados (Schema)",
    description:
      "Implementamos información estructurada sobre tu negocio para que Google la entienda mejor y pueda mostrarte de forma más completa en los resultados.",
    priceCents: 7900,
    pricing: "one_time",
    expectedImpact: "Mejor visibilidad en búsquedas locales",
    implementationTime: "1-2 días laborables",
    category: "seo",
  },
  {
    id: "robots-sitemap",
    title: "Configurar robots.txt y sitemap.xml",
    description:
      "Creamos y publicamos estos dos archivos técnicos para que Google rastree e indexe tu web correctamente desde la base.",
    priceCents: 5900,
    pricing: "one_time",
    expectedImpact: "Google encuentra e indexa tus páginas correctamente",
    implementationTime: "1-2 días laborables",
    category: "seo",
  },
  {
    id: "broken-links",
    title: "Arreglar enlaces rotos de tu web",
    description:
      "Revisamos tu web entera, localizamos los enlaces que devuelven error y los corregimos o redirigimos.",
    priceCents: 8900,
    pricing: "one_time",
    expectedImpact: "Visitantes y Google dejan de encontrarse con errores al navegar tu web",
    implementationTime: "2-3 días laborables",
    category: "seo",
  },
  {
    id: "faq-seo",
    title: "Crear página de preguntas frecuentes",
    description:
      "Redactamos y montamos una página de FAQ optimizada con las dudas que más te repiten tus clientes, pensada también para aparecer en Google.",
    priceCents: 9900,
    pricing: "one_time",
    expectedImpact: "Menos consultas repetitivas, más SEO",
    implementationTime: "2-3 días laborables",
    category: "seo",
  },
  {
    id: "ssl-setup",
    title: "Activar conexión segura (HTTPS/SSL)",
    description:
      "Configuramos el certificado de seguridad de tu web para que deje de mostrar avisos de \"no seguro\" en el navegador.",
    priceCents: 9900,
    pricing: "one_time",
    expectedImpact: "Tu web deja de espantar visitas con el aviso de sitio no seguro",
    implementationTime: "1-2 días laborables",
    category: "seguridad",
  },
  {
    id: "mobile-responsive",
    title: "Adaptar tu web a móvil",
    description:
      "Reestructuramos tu web para que se vea y funcione bien en cualquier móvil, no solo en ordenador.",
    priceCents: 39900,
    pricing: "one_time",
    expectedImpact: "Dejas de perder a la mayoría de tus visitantes, que llegan desde el móvil",
    implementationTime: "5-7 días laborables",
    category: "conversion",
  },
  {
    id: "gsc-analytics-setup",
    title: "Te configuramos Search Console y Analytics",
    description:
      "Damos de alta y verificamos tu propiedad en Google Search Console y tu propiedad en Google Analytics, y las dejamos listas para conectar aquí en GrowthOS.",
    priceCents: 9900,
    pricing: "one_time",
    expectedImpact: "Empiezas a ver tus datos reales de SEO y tráfico sin tener que averiguar tú cómo darlos de alta",
    implementationTime: "2-3 días laborables",
    category: "google",
  },
  {
    id: "cookies-rgpd",
    title: "Configurar cookies y cumplimiento RGPD",
    description:
      "Implementamos un banner de cookies real y revisamos los avisos legales básicos de tu web para que cumplas con el RGPD.",
    priceCents: 12900,
    pricing: "one_time",
    expectedImpact: "Dejas de exponerte a sanciones por no pedir consentimiento de cookies correctamente",
    implementationTime: "2-4 días laborables",
    category: "seguridad",
  },
  {
    id: "landing-optimizada",
    title: "Optimizar tu página para conversión",
    description:
      "Revisamos y reestructuramos tu página principal para que quede claro qué ofreces y sea fácil dar el siguiente paso (llamar, reservar, pedir cita).",
    priceCents: 29900,
    pricing: "one_time",
    expectedImpact: "Más visitantes que se convierten en clientes",
    implementationTime: "4-6 días laborables",
    category: "conversion",
  },
];
