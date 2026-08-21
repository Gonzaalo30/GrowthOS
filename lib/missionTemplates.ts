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
  /** Pasos cortos para hacerlo uno mismo, gratis */
  tutorial: string[];
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
    tutorial: [
      "Busca tu negocio en Google y entra en tu ficha (o accede directamente a Google Business Profile).",
      "Ve a la pestaña \"Reseñas\".",
      "Elige la más reciente sin respuesta y pulsa \"Responder\".",
      "Da las gracias, y si es negativa, discúlpate sin excusas y ofrece solucionarlo fuera de la reseña.",
    ],
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
    tutorial: [
      "Entra en el editor de tu web (WordPress, Wix, Squarespace...) o pide acceso a quien la gestione.",
      "Busca el campo \"Título SEO\" o \"Título de la página\" (a veces está en \"Configuración > SEO\").",
      "Escribe: qué eres + dónde estás. Ejemplo: \"Clínica Dental Sonrisa — Madrid Centro\".",
      "Guarda y comprueba en Google (búscate a ti mismo) que el cambio se refleja en 24-48h.",
    ],
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
    tutorial: [
      "En el editor de tu web, busca el campo \"Meta descripción\" o \"Descripción SEO\" de tu página principal.",
      "Escribe 1-2 frases (unos 150 caracteres) explicando qué ofreces y por qué elegirte.",
      "Incluye tu ciudad o zona si trabajas de forma local.",
      "Guarda los cambios.",
    ],
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
    tutorial: [
      "Entra en el panel de tu proveedor de hosting (donde contrataste tu web y dominio).",
      "Busca la sección \"SSL\" o \"Certificados\" — casi todos ofrecen uno gratis (Let's Encrypt).",
      "Actívalo si está desactivado. Si no lo encuentras, escribe a soporte del hosting y pide que activen el SSL.",
      "Una vez activo, comprueba que tu web carga con \"https://\" y el candado en el navegador.",
    ],
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
    tutorial: [
      "Abre tu web desde tu propio móvil (no solo desde el ordenador).",
      "Comprueba que el texto se lee sin hacer zoom y que los botones son fáciles de pulsar con el dedo.",
      "Prueba tu formulario de contacto o botón de llamada desde el móvil.",
      "Si algo se ve roto o muy pequeño, anótalo para tu diseñador web o gestor de la página.",
    ],
  },
  {
    id: "daily-add-schema",
    title: "Añade datos estructurados sobre tu negocio",
    description:
      "Con esta información, Google puede mostrar tu negocio de forma más completa en los resultados: horario, tipo de negocio, valoraciones.",
    difficulty: "medium",
    timeEstimateMinutes: 10,
    xpReward: 15,
    expectedImpact: "Mejor visibilidad y más clics en Google",
    category: "seo",
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "schema",
    tutorial: [
      "Si usas WordPress, instala un plugin de SEO gratuito (Yoast SEO o RankMath) y rellena los datos de tu negocio en su apartado \"Datos locales\" u \"Organización\".",
      "El plugin genera automáticamente los datos estructurados a partir de lo que rellenes: nombre, dirección, teléfono y horario.",
      "Si no usas WordPress, pide a quien gestione tu web que añada \"marcado Schema.org\" tipo LocalBusiness — es un cambio técnico pequeño.",
      "Comprueba el resultado con la herramienta gratuita \"Rich Results Test\" de Google, pegando la URL de tu web.",
    ],
  },
  {
    id: "daily-add-robots",
    title: "Crea un archivo robots.txt básico",
    description: "Este archivo le dice a Google qué partes de tu web puede explorar. Sin él, Google tiene que adivinarlo.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Ayuda a que Google explore tu web correctamente",
    category: "seo",
    priority: "media",
    appliesTo: "all",
    auditTrigger: "robots",
    tutorial: [
      "Comprueba si ya tienes uno entrando en tuweb.com/robots.txt desde el navegador.",
      "En WordPress, instala un plugin de SEO (Yoast, RankMath) y créalo desde su apartado de herramientas.",
      "El contenido mínimo recomendado es dos líneas: \"User-agent: *\" y debajo \"Allow: /\".",
      "Si no puedes editarlo tú, pide a quien gestione tu web que lo añada — es un archivo de texto muy simple.",
    ],
  },
  {
    id: "daily-add-sitemap",
    title: "Genera un sitemap.xml y súbelo a Google",
    description:
      "Un mapa del sitio ayuda a Google a encontrar todas tus páginas más rápido, en vez de tener que descubrirlas solo.",
    difficulty: "easy",
    timeEstimateMinutes: 8,
    xpReward: 10,
    expectedImpact: "Google indexa tus páginas más rápido",
    category: "seo",
    priority: "media",
    appliesTo: "all",
    auditTrigger: "sitemap",
    tutorial: [
      "En WordPress, un plugin de SEO (Yoast, RankMath) genera el sitemap automáticamente en tuweb.com/sitemap.xml.",
      "En Wix o Squarespace ya viene generado por defecto — compruébalo en esa misma dirección.",
      "Date de alta gratis en Google Search Console si todavía no lo has hecho.",
      "Dentro de Search Console, ve a \"Sitemaps\" y pega la URL de tu sitemap para enviarlo a Google.",
    ],
  },
  {
    id: "daily-improve-speed",
    title: "Reduce el tiempo de carga de tu página principal",
    description:
      "Tu web tarda más de lo recomendable en responder. Cuanto más tarda, más visitantes se van antes de verla.",
    difficulty: "medium",
    timeEstimateMinutes: 15,
    xpReward: 15,
    expectedImpact: "Menos visitantes que se van antes de que cargue",
    category: "rendimiento",
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "speed",
    tutorial: [
      "Revisa qué imágenes de tu página principal pesan más — fotos sin comprimir suelen ser la causa número uno.",
      "Usa una herramienta gratuita como TinyPNG o Squoosh para comprimirlas antes de subirlas.",
      "Si usas WordPress, instala un plugin de caché (WP Super Cache o similar) — suele mejorar mucho el tiempo de carga con un solo clic.",
      "Si tu hosting es muy barato o compartido, valora si merece la pena mejorar el plan — también influye en la velocidad.",
    ],
  },
  {
    id: "daily-fix-broken-links",
    title: "Revisa y arregla los enlaces rotos de tu página principal",
    description:
      "Detectamos enlaces en tu página que llevan a un error. Un cliente que hace clic y encuentra un error suele irse sin volver.",
    difficulty: "easy",
    timeEstimateMinutes: 10,
    xpReward: 10,
    expectedImpact: "Menos visitantes frustrados por enlaces que no funcionan",
    category: "seo",
    priority: "alta",
    appliesTo: "all",
    auditTrigger: "brokenLinks",
    tutorial: [
      "Recorre tu página principal y haz clic en cada enlace (menú, botones, pie de página).",
      "Anota los que lleven a una página de error (\"404\" o \"página no encontrada\").",
      "Corrige la URL de destino o elimina el enlace si ya no aplica.",
      "Si son muchos, herramientas gratuitas como \"Dr. Link Check\" revisan toda la web de una vez.",
    ],
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
    tutorial: [
      "Busca tu negocio en Google Maps o entra en Google Business Profile.",
      "Pulsa \"Editar perfil\" → \"Horario\".",
      "Revisa cada día de la semana y corrige lo que no coincida con tu horario real.",
      "No olvides los festivos o cierres especiales (\"Horario especial\").",
    ],
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
    tutorial: [
      "Abre tu web y cuenta cuánto tardas en encontrar tu teléfono sin usar Ctrl+F.",
      "Si tarda más de 5 segundos, añádelo en la cabecera (arriba del todo) y en el pie de página.",
      "En móvil, considera que el teléfono sea pulsable (que abra directamente la llamada).",
    ],
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
    tutorial: [
      "Ve al formulario de contacto de tu propia web.",
      "Rellénalo con tus datos y un mensaje de prueba, y envíalo.",
      "Comprueba que te llega el email (revisa también la carpeta de spam).",
      "Si no llega nada en unos minutos, avisa a quien gestione tu web — el formulario está roto.",
    ],
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
    tutorial: [
      "Haz una foto con buena luz de tu local, producto o equipo (con el móvil vale).",
      "Entra en Google Business Profile → \"Fotos\" → \"Añadir foto\".",
      "Súbela y clasifícala (interior, exterior, equipo...).",
    ],
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
    tutorial: [
      "Identifica una imagen grande en tu web (normalmente la de portada o cabecera).",
      "Descárgala y súbela a una herramienta gratuita como squoosh.app o tinypng.com.",
      "Descarga la versión comprimida (suele pesar 60-80% menos sin notarse la diferencia).",
      "Vuelve a subirla a tu web sustituyendo la original.",
    ],
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
    tutorial: [
      "Entra en tu web y localiza tu botón de acción principal (llamar, reservar, pedir cita...).",
      "Pregúntate: ¿lo ves en los primeros 3 segundos sin hacer scroll?",
      "Si no, en el editor de tu web súbelo más arriba o cámbialo a un color que destaque más.",
    ],
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
    tutorial: [
      "Copia los enlaces de tus perfiles activos (Instagram, Facebook...).",
      "En el editor de tu web, ve al pie de página o cabecera.",
      "Añade los iconos o enlaces de texto a cada red.",
      "Comprueba que cada enlace abre el perfil correcto (no una página de inicio genérica).",
    ],
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
    tutorial: [
      "Genera tu enlace en wa.me/34TUNUMERO (sustituye por tu número con prefijo de país, sin espacios).",
      "Puedes añadir un mensaje predefinido: wa.me/34TUNUMERO?text=Hola,%20quería%20preguntar...",
      "Añade ese enlace como botón en tu web (cabecera, pie o flotante).",
      "Pruébalo tú mismo desde el móvil para confirmar que abre WhatsApp correctamente.",
    ],
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
    tutorial: [
      "Piensa en la pregunta que más te repiten tus clientes por teléfono o WhatsApp.",
      "Escribe la pregunta tal cual la hacen, y una respuesta clara y corta.",
      "Añádela a tu web (si no tienes sección de FAQ, puedes ponerla en la página de contacto por ahora).",
    ],
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
    tutorial: [
      "Busca tu negocio en Google Maps.",
      "Comprueba que el pin está exactamente en tu puerta, no en la manzana de al lado.",
      "Si está mal, entra en Google Business Profile → \"Editar perfil\" → \"Ubicación\" y arrastra el pin al sitio correcto.",
    ],
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
    tutorial: [
      "Busca una reseña positiva reciente (Google, redes sociales) o pide permiso a un cliente satisfecho.",
      "Copia el texto (o pídeselo por escrito si es de palabra).",
      "Añádelo a tu web con el nombre de pila del cliente (con su permiso).",
    ],
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
    tutorial: [
      "Haz una foto rápida de algo de hoy en tu negocio (producto, equipo, cliente si da permiso).",
      "Publícala en tu red social principal con 1-2 frases.",
      "Añade tu ciudad o barrio como ubicación si la app lo permite.",
    ],
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
    tutorial: [
      "En el editor de tu web, selecciona una imagen (empieza por la de portada).",
      "Busca el campo \"Texto alternativo\" o \"Alt text\" en sus propiedades.",
      "Describe la imagen de forma simple: qué es y, si aplica, tu ciudad. Ej: \"Fachada de la clínica en Madrid\".",
    ],
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
    tutorial: [
      "Coge tu logo (si no lo tienes en formato cuadrado, recórtalo con cualquier editor gratuito).",
      "Súbelo a favicon.io para generar el archivo en el formato correcto.",
      "En el panel de tu web, busca \"Favicon\" o \"Icono del sitio\" y súbelo.",
    ],
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
    tutorial: [
      "Ve al pie de página de tu web.",
      "Si el año de copyright está desactualizado, edítalo (o pon un rango, ej. \"2020-2026\", para no tener que tocarlo cada año).",
    ],
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
    tutorial: [
      "Copia el texto de tu página principal y pégalo en un corrector como el de Google Docs o LanguageTool.",
      "Revisa las sugerencias y corrige lo que aplique en tu web.",
    ],
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
    tutorial: [
      "Elige una imagen de tu web con nombre genérico (IMG_1234.jpg y similares).",
      "Descárgala, renómbrala describiendo qué es + tu ciudad, separado por guiones (ej. \"taller-mecanico-valencia.jpg\").",
      "Vuelve a subirla sustituyendo la original.",
    ],
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
    tutorial: [
      "Elige tu plato más pedido o más vistoso.",
      "Hazle una foto con luz natural, a ser posible antes de que se enfríe.",
      "Súbela a Google Business Profile → \"Fotos\" → \"Comida y bebida\".",
    ],
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
    tutorial: [
      "Entra en Google Business Profile → \"Editar perfil\" → busca \"Reservas\".",
      "Si tienes un sistema de reservas online (o WhatsApp), enlázalo ahí.",
      "Si no tienes ninguno, de momento puedes enlazar tu número de teléfono como \"reserva por llamada\".",
    ],
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
    tutorial: [
      "Escribe o fotografía el menú de hoy.",
      "Publícalo en tu web (sección menú) y en tus redes sociales.",
      "Si usas Google Business Profile, también puedes añadirlo como publicación del día.",
    ],
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
    tutorial: [
      "Revisa la lista oficial de los 14 alérgenos de declaración obligatoria (gluten, lácteos, frutos secos...).",
      "Para cada plato de tu carta, marca qué alérgenos contiene.",
      "Añade esta información a tu menú online, con un símbolo o nota junto a cada plato.",
    ],
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
    tutorial: [
      "Entra en Google Business Profile → \"Editar perfil\" → \"Servicios\" o \"Descripción\".",
      "Lista tus especialidades concretas (ej. \"ortodoncia\", \"fisioterapia deportiva\", en vez de solo \"clínica\").",
      "Guarda los cambios.",
    ],
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
    tutorial: [
      "Ve a tu web y localiza el formulario o botón de pedir cita.",
      "Rellena una solicitud de prueba con tus propios datos.",
      "Comprueba que te llega la notificación (email, SMS o donde corresponda).",
      "Si falla, avisa a quien gestione tu web o tu sistema de citas cuanto antes.",
    ],
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
    tutorial: [
      "Haz una foto del equipo (con su permiso) o de una sala limpia y ordenada.",
      "Súbela a Google Business Profile y a tu web, en la sección \"Sobre nosotros\" o similar.",
    ],
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
    tutorial: [
      "Piensa en una duda o consejo que repitas a menudo a tus pacientes.",
      "Escríbelo en 3-4 frases sencillas, sin tecnicismos.",
      "Publícalo en tus redes sociales o en el blog de tu web si tienes.",
    ],
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
    tutorial: [
      "Elige una de tus propiedades más vistas o destacadas.",
      "Compara el precio publicado en tu web con el precio real actual.",
      "Corrígelo si hace falta, y aprovecha para comprobar que sigue disponible.",
    ],
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
    tutorial: [
      "Elige una propiedad con menos de 8 fotos.",
      "Si puedes, haz fotos nuevas con luz natural (abre persianas/cortinas) desde varios ángulos por habitación.",
      "Súbelas a la ficha de la propiedad en tu web o portal inmobiliario.",
    ],
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
    tutorial: [
      "Revisa la lista de servicios en tu web y en Google Business Profile.",
      "Añade los que falten (ej. \"cambio de neumáticos\", \"ITV\", \"diagnosis electrónica\").",
      "Quita los que ya no ofrezcas.",
    ],
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
    tutorial: [
      "Haz una lista de las marcas de coche o moto con las que trabajas habitualmente.",
      "Añádelas a la descripción de tu ficha de Google Business y a tu web.",
    ],
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
    tutorial: [
      "Elige una habitación limpia y bien iluminada (luz natural si es posible).",
      "Haz varias fotos: general, cama, baño.",
      "Súbelas a Google Business Profile y a tu web/portal de reservas.",
    ],
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
    tutorial: [
      "Haz una lista de todos tus servicios (piscina, desayuno, parking, wifi, mascotas...).",
      "En Google Business Profile → \"Editar perfil\" → \"Servicios\", marca cada uno que ofrezcas.",
    ],
  },

  // --- Ecommerce ---
  {
    id: "daily-ecommerce-product-photos",
    title: "Mejora las fotos de tu producto más vendido",
    description: "Unas fotos claras y desde varios ángulos reducen dudas de compra y devoluciones por \"no era lo que esperaba\".",
    difficulty: "medium",
    timeEstimateMinutes: 10,
    xpReward: 15,
    expectedImpact: "Menos devoluciones y más confianza para comprar",
    category: "contenido",
    priority: "alta",
    appliesTo: ["Ecommerce"],
    tutorial: [
      "Elige tu producto más vendido o el que más devoluciones genera.",
      "Haz fotos con luz natural desde al menos 3 ángulos, y una de detalle (textura, etiqueta, tamaño real).",
      "Si vendes ropa o algo con tamaño, incluye una foto con una referencia de escala.",
      "Sube las fotos nuevas sustituyendo o añadiéndolas a la ficha del producto.",
    ],
  },
  {
    id: "daily-ecommerce-shipping-info",
    title: "Deja claro el coste y plazo de envío antes del carrito",
    description: "Un coste de envío sorpresa en el último paso es la primera causa de carritos abandonados.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Menos carritos abandonados por sorpresas de última hora",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Ecommerce"],
    tutorial: [
      "Entra en tu tienda como si fueras cliente y mira si el coste y plazo de envío se ve antes de llegar al pago.",
      "Si no se ve, añade una línea visible en la ficha de producto o en la cabecera (\"Envío gratis desde X €\" o \"Envío en 24-48h\").",
      "Si tu plataforma lo permite (Shopify, WooCommerce, PrestaShop), activa una barra o aviso fijo con esta información.",
    ],
  },
  {
    id: "daily-ecommerce-stock-accuracy",
    title: "Comprueba que el stock de tus productos está al día",
    description: "Vender algo que en realidad no tienes genera reembolsos, reseñas negativas y clientes que no vuelven.",
    difficulty: "easy",
    timeEstimateMinutes: 8,
    xpReward: 10,
    expectedImpact: "Menos pedidos cancelados y reseñas negativas",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Ecommerce"],
    tutorial: [
      "Revisa tus 10 productos más vendidos y compara el stock de la tienda online con el stock real.",
      "Marca como agotado (o retira temporalmente) cualquier producto sin stock real.",
      "Si gestionas stock a mano, considera fijar un día fijo a la semana solo para esta revisión.",
    ],
  },
  {
    id: "daily-ecommerce-return-policy",
    title: "Publica tu política de devoluciones de forma visible",
    description: "Saber cómo devolver algo antes de comprar da confianza — y es información que estás obligado a mostrar.",
    difficulty: "easy",
    timeEstimateMinutes: 8,
    xpReward: 10,
    expectedImpact: "Más confianza para completar la compra",
    category: "contenido",
    priority: "media",
    appliesTo: ["Ecommerce"],
    tutorial: [
      "Escribe en lenguaje simple: plazo para devolver, quién paga el envío de vuelta, y cómo se inicia el proceso.",
      "Publícalo en una página propia (\"Devoluciones\") enlazada desde el pie de página.",
      "Añade un enlace corto a esa página también en la ficha de producto, cerca del botón de compra.",
    ],
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
    tutorial: [
      "Ve a technicalseo.com/tools/schema-markup-generator/ y elige el tipo \"LocalBusiness\".",
      "Rellena nombre, dirección, teléfono y horario de tu negocio.",
      "Copia el código generado (JSON-LD).",
      "Pégalo en el `<head>` de tu página principal (pide ayuda a quien gestione tu web si no sabes acceder al código).",
    ],
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
    tutorial: [
      "Entra en analytics.google.com y crea una cuenta gratuita con tu email.",
      "Crea una \"Propiedad\" con el nombre de tu negocio y tu web.",
      "Copia el ID de medición (empieza por \"G-\").",
      "Pégalo en tu web (muchos gestores como WordPress lo piden en un plugin o en \"Configuración > Analítica\").",
    ],
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
    tutorial: [
      "Entra en search.google.com/search-console y añade tu dominio como propiedad.",
      "Verifica la propiedad siguiendo el método que te ofrezca (normalmente subir un archivo o añadir un registro DNS).",
      "Una vez verificado, envía tu sitemap si lo tienes (o pídeselo a quien gestione tu web).",
    ],
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
    tutorial: [
      "Ve a pagespeed.web.dev e introduce tu web.",
      "Revisa las recomendaciones marcadas en rojo/naranja (suelen ser imágenes pesadas o scripts innecesarios).",
      "Empieza por comprimir imágenes grandes (ver la misión diaria de comprimir imágenes).",
      "Si tu web es lenta por el propio hosting, considera pedir presupuesto de mejora — es donde más ayuda un profesional.",
    ],
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
    tutorial: [
      "Entra en tagmanager.google.com y crea una cuenta con el nombre de tu negocio.",
      "Crea un \"Contenedor\" para tu web y copia los dos fragmentos de código que te da.",
      "Pégalos en tu web: uno justo después de `<head>` y otro justo después de `<body>`.",
      "Si no te sientes cómodo tocando el código, es un buen momento para pedir ayuda técnica puntual.",
    ],
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
    tutorial: [
      "Crea una cuenta gratuita en hotjar.com.",
      "Añade tu web como \"sitio\" y copia el código de instalación.",
      "Pégalo en tu web (o en Google Tag Manager si ya lo tienes instalado).",
      "Espera unos días de tráfico y revisa el mapa de calor de tu página principal.",
    ],
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
    tutorial: [
      "Busca 3-5 directorios relevantes para tu sector y ciudad (páginas amarillas, cámaras de comercio locales, directorios del sector).",
      "Registra tu negocio en cada uno con los mismos datos exactos (nombre, dirección, teléfono) que en Google.",
      "Enlaza tu web en cada ficha si te lo permiten.",
    ],
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
    tutorial: [
      "Reúne las 8-10 preguntas que más te hacen tus clientes (teléfono, WhatsApp, email).",
      "Escribe una respuesta clara y corta para cada una.",
      "Crea una nueva página en tu web llamada \"Preguntas frecuentes\" y organízalas por tema.",
    ],
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
    tutorial: [
      "Elige una herramienta gratuita o económica de reservas (ej. la que ya integre tu TPV, o alternativas gratuitas para empezar).",
      "Crea tu cuenta y configura tus horarios y aforo por turno.",
      "Añade el botón o widget de reserva en tu web y en tu ficha de Google Business.",
    ],
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
    tutorial: [
      "Busca una herramienta de citas online adecuada a tu tamaño (muchas tienen plan gratuito para empezar).",
      "Configura tu agenda, duración de cita y huecos disponibles.",
      "Añade el enlace o widget de reserva en tu web y en Google Business Profile.",
    ],
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
    tutorial: [
      "Haz tú mismo una reserva de prueba de principio a fin en tu web.",
      "Cuenta cuántos pasos/clics necesitas hasta confirmar.",
      "Si hay pasos que no son imprescindibles (registro obligatorio, demasiados campos), pide a quien gestione tu web que los reduzca.",
    ],
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
    tutorial: [
      "Graba un vídeo con el móvil recorriendo la propiedad con calma (o usa una app de tour 360° gratuita).",
      "Sube el vídeo a YouTube (puede ser \"no listado\") o directamente a tu web.",
      "Enlázalo en la ficha de esa propiedad.",
    ],
  },
  {
    id: "weekly-ecommerce-checkout-test",
    title: "Haz una compra de prueba completa y simplifica el checkout",
    description: "Cada paso de más entre \"añadir al carrito\" y \"pedido confirmado\" pierde clientes que ya habían decidido comprar.",
    difficulty: "hard",
    timeEstimateMinutes: 60,
    xpReward: 50,
    expectedImpact: "Menos abandono de carrito en el pago",
    category: "conversion",
    priority: "alta",
    appliesTo: ["Ecommerce"],
    tutorial: [
      "Haz tú mismo un pedido de prueba de principio a fin (puedes cancelarlo o reembolsarlo después).",
      "Cuenta cuántos pasos y campos obligatorios hay hasta confirmar el pago.",
      "Comprueba si te obliga a crear una cuenta — si es así, considera permitir \"comprar como invitado\".",
      "Anota cualquier paso confuso o campo innecesario y pide a quien gestione tu tienda que lo simplifique.",
    ],
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

export function findTemplateById(templateId: string | null): MissionTemplate | undefined {
  if (!templateId) return undefined;
  return (
    DAILY_MISSION_TEMPLATES.find((t) => t.id === templateId) ??
    WEEKLY_MISSION_TEMPLATES.find((t) => t.id === templateId)
  );
}
