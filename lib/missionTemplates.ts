import type { MissionDifficulty } from "@/types/database.types";
import type { BUSINESS_TYPES } from "@/lib/businessTypes";
import type { QuickAuditCheck } from "@/lib/quickAudit";

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export type MissionCategory =
  | "reputacion"
  | "contenido"
  | "seo"
  | "rendimiento"
  | "movil"
  | "conversion"
  | "analitica"
  | "local";

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  timeEstimateMinutes: number;
  xpReward: number;
  expectedImpact: string;
  category: MissionCategory;
  /** "all" o los tipos de negocio a los que aplica esta misión */
  appliesTo: BusinessType[] | "all";
  /** Si el check del análisis rápido con este id falla, esta misión sube de prioridad */
  auditTrigger?: QuickAuditCheck["id"];
}

// Librería de misiones diarias. El motor de auditoría completo (Sprint 3) añadirá
// más disparadores (velocidad real, schema, robots, sitemap, enlaces rotos...).
export const DAILY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "daily-review-reply",
    title: "Responde a una reseña reciente",
    description:
      "Los negocios que responden a sus reseñas generan más confianza y aparecen mejor posicionados en Google.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Mejora tu reputación y tu posicionamiento local",
    category: "reputacion",
    appliesTo: "all",
  },
  {
    id: "daily-update-title",
    title: "Actualiza el título de tu página principal",
    description:
      "Un título claro ayuda a que la gente entienda al instante qué ofreces y a que Google lo muestre mejor.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más clics desde los resultados de búsqueda",
    category: "seo",
    appliesTo: "all",
    auditTrigger: "title",
  },
  {
    id: "daily-fresh-photo",
    title: "Sube una foto reciente de tu negocio",
    description:
      "Las fichas con fotos actuales generan más confianza y reciben más visitas que las que no las tienen.",
    difficulty: "easy",
    timeEstimateMinutes: 2,
    xpReward: 10,
    expectedImpact: "Más confianza al primer vistazo",
    category: "contenido",
    appliesTo: "all",
  },
  {
    id: "daily-meta-description",
    title: "Escribe una descripción para Google",
    description:
      "Esa frase que aparece bajo tu web en los resultados de búsqueda influye mucho en si te hacen clic o no.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más clics desde los resultados de búsqueda",
    category: "seo",
    appliesTo: "all",
    auditTrigger: "description",
  },
  {
    id: "daily-check-ssl",
    title: "Contacta con tu hosting sobre el candado de seguridad",
    description:
      "Tu web no está cargando de forma segura. Los navegadores avisan a tus visitantes de esto, y muchos se van.",
    difficulty: "medium",
    timeEstimateMinutes: 5,
    xpReward: 15,
    expectedImpact: "Evita que se vayan visitantes desconfiados",
    category: "seo",
    appliesTo: "all",
    auditTrigger: "ssl",
  },
  {
    id: "daily-check-mobile",
    title: "Revisa cómo se ve tu web desde el móvil",
    description:
      "La mayoría de tus clientes te van a encontrar desde el móvil. Comprueba que todo se lee y se pulsa bien.",
    difficulty: "easy",
    timeEstimateMinutes: 4,
    xpReward: 10,
    expectedImpact: "Menos visitantes que se van sin mirar nada",
    category: "movil",
    appliesTo: "all",
    auditTrigger: "mobile",
  },
  {
    id: "daily-compress-image",
    title: "Comprime una imagen pesada de tu web",
    description:
      "Las imágenes muy pesadas hacen que tu web tarde en cargar, y cada segundo de espera pierde visitantes.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Tu web carga más rápido",
    category: "rendimiento",
    appliesTo: "all",
  },
  {
    id: "daily-update-hours",
    title: "Actualiza el horario en tu ficha de Google",
    description:
      "Un horario desactualizado hace que la gente se presente cuando estás cerrado, y eso genera reseñas negativas.",
    difficulty: "easy",
    timeEstimateMinutes: 2,
    xpReward: 10,
    expectedImpact: "Menos clientes frustrados por horarios erróneos",
    category: "local",
    appliesTo: "all",
  },
  {
    id: "daily-visible-phone",
    title: "Comprueba que tu teléfono se ve fácil en la web",
    description:
      "Si alguien tiene que buscar tu teléfono más de 5 segundos, probablemente se rinda y llame a otro negocio.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más llamadas de clientes potenciales",
    category: "conversion",
    appliesTo: "all",
  },
  {
    id: "daily-cta-button",
    title: "Revisa que tu botón principal destaca bien",
    description:
      "El botón de \"llamar\", \"reservar\" o \"pedir cita\" debe verse a simple vista, sin tener que buscarlo.",
    difficulty: "easy",
    timeEstimateMinutes: 4,
    xpReward: 10,
    expectedImpact: "Más visitantes que dan el siguiente paso",
    category: "conversion",
    appliesTo: "all",
  },
  {
    id: "daily-social-post",
    title: "Publica una novedad en tus redes sociales",
    description:
      "Aunque no lo notes, publicar con regularidad mantiene tu negocio visible entre tus clientes habituales.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Te mantienes presente entre tus clientes",
    category: "contenido",
    appliesTo: "all",
  },
  {
    id: "daily-restaurant-menu-photo",
    title: "Sube una foto de un plato destacado",
    description: "Las fotos de comida son lo primero que mira alguien que busca dónde comer cerca.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más clics desde búsquedas de restaurantes cercanos",
    category: "contenido",
    appliesTo: ["Restaurante"],
  },
  {
    id: "daily-restaurant-reserve-button",
    title: "Activa el botón de reserva en tu ficha de Google",
    description: "Si Google Business lo permite, un botón de reserva directo convierte muchas más visitas en mesas ocupadas.",
    difficulty: "medium",
    timeEstimateMinutes: 5,
    xpReward: 15,
    expectedImpact: "Más reservas directas desde Google",
    category: "conversion",
    appliesTo: ["Restaurante"],
  },
  {
    id: "daily-clinic-specialties",
    title: "Añade tus especialidades a la ficha de Google",
    description: "Que se vea claramente qué tratas ayuda a que te encuentren pacientes que buscan justo eso.",
    difficulty: "easy",
    timeEstimateMinutes: 4,
    xpReward: 10,
    expectedImpact: "Te encuentran pacientes con la necesidad correcta",
    category: "local",
    appliesTo: ["Clínica"],
  },
  {
    id: "daily-inmobiliaria-listing-price",
    title: "Revisa que el precio de una propiedad destacada esté actualizado",
    description: "Un precio desactualizado genera llamadas frustradas y desconfianza.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Menos consultas perdidas por datos erróneos",
    category: "contenido",
    appliesTo: ["Inmobiliaria"],
  },
  {
    id: "daily-taller-services-list",
    title: "Comprueba que tus servicios están bien listados",
    description: "Que quede claro qué reparas (y qué no) evita llamadas que no vas a poder atender.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Consultas más ajustadas a lo que ofreces",
    category: "contenido",
    appliesTo: ["Taller"],
  },
  {
    id: "daily-hotel-photo-rooms",
    title: "Sube una foto reciente de una habitación",
    description: "Las fotos de habitaciones actualizadas son de lo que más se mira antes de reservar.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más confianza antes de reservar",
    category: "contenido",
    appliesTo: ["Hotel"],
  },
];

export const WEEKLY_MISSION_TEMPLATES: MissionTemplate[] = [
  {
    id: "weekly-schema",
    title: "Ayuda a Google a entender tu negocio",
    description:
      "Añadiendo información estructurada sobre tu negocio (nombre, dirección, horario), Google puede mostrarte mejor en búsquedas locales.",
    difficulty: "medium",
    timeEstimateMinutes: 30,
    xpReward: 50,
    expectedImpact: "Mejor visibilidad en búsquedas locales",
    category: "seo",
    appliesTo: "all",
  },
  {
    id: "weekly-analytics",
    title: "Configura Google Analytics en tu web",
    description:
      "Sin esto, estás tomando decisiones a ciegas: no sabes cuánta gente visita tu web ni qué hace en ella.",
    difficulty: "medium",
    timeEstimateMinutes: 40,
    xpReward: 50,
    expectedImpact: "Empiezas a ver datos reales de tus visitantes",
    category: "analitica",
    appliesTo: "all",
  },
  {
    id: "weekly-search-console",
    title: "Da de alta tu web en Google Search Console",
    description:
      "Es la herramienta gratuita de Google para saber qué búsquedas te traen visitas y detectar problemas antes de que te afecten.",
    difficulty: "medium",
    timeEstimateMinutes: 30,
    xpReward: 50,
    expectedImpact: "Detectas problemas de Google antes de perder visitas",
    category: "analitica",
    appliesTo: "all",
  },
  {
    id: "weekly-tag-manager",
    title: "Instala Google Tag Manager",
    description:
      "Te permite añadir herramientas de medición y marketing en el futuro sin tener que tocar el código cada vez.",
    difficulty: "hard",
    timeEstimateMinutes: 45,
    xpReward: 50,
    expectedImpact: "Preparas tu web para medir mejor a futuro",
    category: "analitica",
    appliesTo: "all",
  },
  {
    id: "weekly-heatmap",
    title: "Instala un mapa de calor en tu web",
    description:
      "Herramientas como Hotjar te enseñan visualmente dónde hace clic la gente y en qué punto se va, algo que los números solos no cuentan.",
    difficulty: "medium",
    timeEstimateMinutes: 30,
    xpReward: 50,
    expectedImpact: "Entiendes por qué la gente no hace lo que esperas",
    category: "conversion",
    appliesTo: "all",
  },
  {
    id: "weekly-directories",
    title: "Da de alta tu negocio en directorios locales",
    description:
      "Aparecer en directorios relevantes de tu sector y ciudad mejora tu presencia local y genera enlaces hacia tu web.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Más presencia local y más formas de encontrarte",
    category: "local",
    appliesTo: "all",
  },
  {
    id: "weekly-speed",
    title: "Mejora la velocidad de carga de tu web",
    description:
      "Cada segundo extra de carga hace que pierdas visitantes, sobre todo desde el móvil.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos visitantes que se van antes de que cargue",
    category: "rendimiento",
    appliesTo: "all",
    auditTrigger: "mobile",
  },
  {
    id: "weekly-restaurant-online-booking",
    title: "Añade un sistema de reservas online a tu web",
    description:
      "Permitir reservar sin llamar reduce las llamadas fuera de horario y las mesas que se pierden por no coger el teléfono.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos reservas perdidas fuera de horario",
    category: "conversion",
    appliesTo: ["Restaurante"],
  },
];

function scoreTemplate(template: MissionTemplate, businessType: BusinessType, failedChecks: Set<string>): number {
  let score = 0;
  if (template.auditTrigger && failedChecks.has(template.auditTrigger)) score += 2;
  if (template.appliesTo !== "all" && template.appliesTo.includes(businessType)) score += 1;
  return score;
}

function appliesToBusiness(template: MissionTemplate, businessType: BusinessType): boolean {
  return template.appliesTo === "all" || template.appliesTo.includes(businessType);
}

export function selectDailyMissions(
  businessType: BusinessType,
  failedChecks: Set<string>,
  count = 3,
): MissionTemplate[] {
  return DAILY_MISSION_TEMPLATES.filter((t) => appliesToBusiness(t, businessType))
    .sort((a, b) => scoreTemplate(b, businessType, failedChecks) - scoreTemplate(a, businessType, failedChecks))
    .slice(0, count);
}

export function selectWeeklyMission(businessType: BusinessType, failedChecks: Set<string>): MissionTemplate {
  const candidates = WEEKLY_MISSION_TEMPLATES.filter((t) => appliesToBusiness(t, businessType)).sort(
    (a, b) => scoreTemplate(b, businessType, failedChecks) - scoreTemplate(a, businessType, failedChecks),
  );
  return candidates[0];
}
