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

export type MissionPriority = "alta" | "media" | "baja";

export interface MissionTemplate {
  id: string;
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  timeEstimateMinutes: number;
  xpReward: number;
  expectedImpact: string;
  category: MissionCategory;
  /** Importancia relativa: alta sale primero, baja son "tonterías" para más adelante */
  priority: MissionPriority;
  /** "all" o los tipos de negocio a los que aplica esta misión */
  appliesTo: BusinessType[] | "all";
  /** Si el check del análisis rápido con este id falla, esta misión sube de prioridad */
  auditTrigger?: QuickAuditCheck["id"];
}

// Librería de misiones diarias. El motor de auditoría completo (Sprint 3) añadirá
// más disparadores (velocidad real, schema, robots, sitemap, enlaces rotos...).
// La rotación (no repetir misiones ya hechas, refrescar cada día) es trabajo de Sprint 2:
// esta librería solo decide QUÉ misiones existen y con qué prioridad.
export const DAILY_MISSION_TEMPLATES: MissionTemplate[] = [
  // --- Universales, prioridad alta ---
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
    priority: "alta",
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
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "title",
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
    priority: "alta",
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
    priority: "alta",
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
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "mobile",
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
    priority: "alta",
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
    priority: "alta",
    appliesTo: "all",
  },
  {
    id: "daily-contact-form-test",
    title: "Prueba tu formulario de contacto",
    description:
      "Envíate un mensaje de prueba. Un formulario roto significa clientes interesados que nunca sabes que existieron.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Dejas de perder clientes por un formulario roto",
    category: "conversion",
    priority: "alta",
    appliesTo: "all",
  },

  // --- Universales, prioridad media ---
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
    priority: "media",
    appliesTo: "all",
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
    priority: "media",
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
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "daily-social-links",
    title: "Enlaza tus redes sociales desde tu web",
    description: "Si alguien quiere conocerte mejor antes de decidirse, ponle fácil encontrar tus redes.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más formas de que confíen en ti antes de contactar",
    category: "conversion",
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "daily-whatsapp-link",
    title: "Añade un enlace directo a WhatsApp",
    description: "Muchos clientes prefieren escribir antes que llamar. Ponles un acceso directo.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más consultas de gente que no quiere llamar",
    category: "conversion",
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "daily-faq-add",
    title: "Añade una pregunta frecuente que te hagan a menudo",
    description: "Responder antes de que pregunten ahorra tiempo a ambos y da imagen profesional.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Menos consultas repetitivas, más confianza",
    category: "contenido",
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "daily-google-map-check",
    title: "Comprueba que el mapa de tu ficha señala el sitio correcto",
    description: "Un pin mal colocado manda clientes al sitio equivocado, sobre todo en coche.",
    difficulty: "easy",
    timeEstimateMinutes: 2,
    xpReward: 10,
    expectedImpact: "Menos clientes perdidos literalmente",
    category: "local",
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "daily-testimonial-add",
    title: "Añade un testimonio real de un cliente",
    description: "Las palabras de un cliente convencen más que las tuyas propias.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más confianza para quien te visita por primera vez",
    category: "contenido",
    priority: "media",
    appliesTo: "all",
  },

  // --- Universales, prioridad baja ("tonterías" para más adelante) ---
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
    priority: "baja",
    appliesTo: "all",
  },
  {
    id: "daily-alt-text",
    title: "Cambia el texto alternativo de una imagen",
    description: "Ese texto ayuda a Google (y a personas con discapacidad visual) a entender qué muestra la imagen.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 5,
    expectedImpact: "Pequeña mejora acumulativa de SEO",
    category: "seo",
    priority: "baja",
    appliesTo: "all",
  },
  {
    id: "daily-favicon",
    title: "Añade un favicon a tu web",
    description: "Ese pequeño icono en la pestaña del navegador da un toque profesional.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 5,
    expectedImpact: "Imagen más cuidada",
    category: "contenido",
    priority: "baja",
    appliesTo: "all",
  },
  {
    id: "daily-footer-copyright",
    title: "Actualiza el año en el pie de tu web",
    description: "Un pie de página desactualizado es un pequeño detalle que resta profesionalidad.",
    difficulty: "easy",
    timeEstimateMinutes: 2,
    xpReward: 5,
    expectedImpact: "Imagen más cuidada",
    category: "contenido",
    priority: "baja",
    appliesTo: "all",
  },
  {
    id: "daily-spelling-check",
    title: "Revisa la ortografía de tu página principal",
    description: "Una errata en la primera impresión resta credibilidad, aunque el resto esté perfecto.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 5,
    expectedImpact: "Imagen más cuidada",
    category: "contenido",
    priority: "baja",
    appliesTo: "all",
  },
  {
    id: "daily-image-filename",
    title: "Renombra el archivo de una imagen de forma descriptiva",
    description: "\"foto-clinica-dental-madrid.jpg\" ayuda más a Google que \"IMG_2024.jpg\".",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 5,
    expectedImpact: "Pequeña mejora acumulativa de SEO",
    category: "seo",
    priority: "baja",
    appliesTo: "all",
  },

  // --- Restaurante ---
  {
    id: "daily-restaurant-menu-photo",
    title: "Sube una foto de un plato destacado",
    description: "Las fotos de comida son lo primero que mira alguien que busca dónde comer cerca.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más clics desde búsquedas de restaurantes cercanos",
    category: "contenido",
    priority: "alta",
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
    priority: "alta",
    appliesTo: ["Restaurante"],
  },
  {
    id: "daily-restaurant-menu-update",
    title: "Publica el menú del día actualizado",
    description: "Un menú desactualizado genera llamadas para preguntar algo que ya deberías haber contestado.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Menos llamadas para preguntar el menú",
    category: "contenido",
    priority: "media",
    appliesTo: ["Restaurante"],
  },
  {
    id: "daily-restaurant-allergens",
    title: "Añade los alérgenos a tu menú online",
    description: "Cada vez más gente filtra por esto antes de elegir dónde comer, y es obligatorio informarlo.",
    difficulty: "medium",
    timeEstimateMinutes: 10,
    xpReward: 15,
    expectedImpact: "Cumples con la normativa y ganas clientes con alergias",
    category: "contenido",
    priority: "media",
    appliesTo: ["Restaurante"],
  },

  // --- Clínica (incluye dental, fisioterapia y similares) ---
  {
    id: "daily-clinic-specialties",
    title: "Añade tus especialidades a la ficha de Google",
    description: "Que se vea claramente qué tratas ayuda a que te encuentren pacientes que buscan justo eso.",
    difficulty: "easy",
    timeEstimateMinutes: 4,
    xpReward: 10,
    expectedImpact: "Te encuentran pacientes con la necesidad correcta",
    category: "local",
    priority: "alta",
    appliesTo: ["Clínica"],
  },
  {
    id: "daily-clinic-booking-form",
    title: "Prueba tu formulario de cita previa",
    description: "Reserva una cita de prueba tú mismo. Si falla, estás perdiendo pacientes sin saberlo.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 15,
    expectedImpact: "Dejas de perder pacientes por un fallo técnico",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Clínica"],
  },
  {
    id: "daily-clinic-team-photo",
    title: "Sube una foto del equipo o de la consulta",
    description: "Ver caras reales antes de una cita médica o de fisioterapia reduce mucho la incertidumbre del paciente.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más confianza antes de la primera visita",
    category: "contenido",
    priority: "media",
    appliesTo: ["Clínica"],
  },
  {
    id: "daily-clinic-health-tip",
    title: "Publica un consejo de salud relacionado con tu especialidad",
    description: "Aporta valor real (ej. \"3 estiramientos antes de correr\" si eres fisio) y te posiciona como referente.",
    difficulty: "easy",
    timeEstimateMinutes: 8,
    xpReward: 10,
    expectedImpact: "Te posicionas como referente en tu especialidad",
    category: "contenido",
    priority: "media",
    appliesTo: ["Clínica"],
  },

  // --- Inmobiliaria ---
  {
    id: "daily-inmobiliaria-listing-price",
    title: "Revisa que el precio de una propiedad destacada esté actualizado",
    description: "Un precio desactualizado genera llamadas frustradas y desconfianza.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Menos consultas perdidas por datos erróneos",
    category: "contenido",
    priority: "alta",
    appliesTo: ["Inmobiliaria"],
  },
  {
    id: "daily-inmobiliaria-more-photos",
    title: "Añade más fotos a una propiedad destacada",
    description: "Las fichas con más fotos reciben más contactos, sobre todo si incluyen luz natural y espacios vacíos.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más contactos por esa propiedad",
    category: "contenido",
    priority: "media",
    appliesTo: ["Inmobiliaria"],
  },

  // --- Taller ---
  {
    id: "daily-taller-services-list",
    title: "Comprueba que tus servicios están bien listados",
    description: "Que quede claro qué reparas (y qué no) evita llamadas que no vas a poder atender.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Consultas más ajustadas a lo que ofreces",
    category: "contenido",
    priority: "alta",
    appliesTo: ["Taller"],
  },
  {
    id: "daily-taller-brands",
    title: "Añade las marcas con las que trabajas a tu ficha",
    description: "Mucha gente busca \"taller [marca de su coche] cerca de mí\" específicamente.",
    difficulty: "easy",
    timeEstimateMinutes: 4,
    xpReward: 10,
    expectedImpact: "Apareces en búsquedas más específicas",
    category: "local",
    priority: "media",
    appliesTo: ["Taller"],
  },

  // --- Hotel ---
  {
    id: "daily-hotel-photo-rooms",
    title: "Sube una foto reciente de una habitación",
    description: "Las fotos de habitaciones actualizadas son de lo que más se mira antes de reservar.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Más confianza antes de reservar",
    category: "contenido",
    priority: "alta",
    appliesTo: ["Hotel"],
  },
  {
    id: "daily-hotel-amenities",
    title: "Añade los servicios del hotel a tu ficha (piscina, desayuno, parking...)",
    description: "Estos filtros son de lo primero que mira alguien comparando dónde alojarse.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Apareces en más búsquedas filtradas",
    category: "local",
    priority: "media",
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
    priority: "alta",
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
    priority: "alta",
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
    priority: "alta",
    appliesTo: "all",
  },
  {
    id: "weekly-speed",
    title: "Mejora la velocidad de carga de tu web",
    description: "Cada segundo extra de carga hace que pierdas visitantes, sobre todo desde el móvil.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos visitantes que se van antes de que cargue",
    category: "rendimiento",
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "mobile",
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
    priority: "media",
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
    priority: "media",
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
    priority: "media",
    appliesTo: "all",
  },
  {
    id: "weekly-faq-page",
    title: "Crea una página de preguntas frecuentes",
    description: "Reúne en un solo sitio las dudas que más te repiten, y ahorra tiempo a ti y a tus clientes.",
    difficulty: "medium",
    timeEstimateMinutes: 45,
    xpReward: 50,
    expectedImpact: "Menos consultas repetitivas, más autonomía del cliente",
    category: "contenido",
    priority: "baja",
    appliesTo: "all",
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
    priority: "alta",
    appliesTo: ["Restaurante"],
  },
  {
    id: "weekly-clinic-online-booking",
    title: "Añade un sistema de cita previa online",
    description: "Permitir pedir cita sin llamar reduce las llamadas fuera de horario y capta pacientes que buscan de noche.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos citas perdidas por no poder llamar",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Clínica"],
  },
  {
    id: "weekly-hotel-booking-engine",
    title: "Revisa y mejora tu motor de reservas",
    description: "Cada paso de más entre \"quiero reservar\" y \"reservado\" pierde clientes que se van a otra web.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos abandonos durante la reserva",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Hotel"],
  },
  {
    id: "weekly-inmobiliaria-virtual-tour",
    title: "Añade un tour virtual o vídeo a una propiedad destacada",
    description: "Reduce las visitas de curiosos y capta interesados de verdad antes incluso de contactarte.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Contactos más cualificados",
    category: "conversion",
    priority: "media",
    appliesTo: ["Inmobiliaria"],
  },
];

const PRIORITY_WEIGHT: Record<MissionPriority, number> = { alta: 2, media: 1, baja: 0 };

function scoreTemplate(template: MissionTemplate, businessType: BusinessType, failedChecks: Set<string>): number {
  let score = PRIORITY_WEIGHT[template.priority];
  if (template.auditTrigger && failedChecks.has(template.auditTrigger)) score += 3;
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
