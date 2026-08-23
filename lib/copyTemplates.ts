import type { BusinessType } from "@/lib/missionTemplates";

export interface CopyTemplate {
  id: string;
  businessType: BusinessType;
  /** La situación real que resuelve, no un título genérico. */
  situation: string;
  subject: string;
  body: string;
}

// Una plantilla real por tipo de negocio, cada una resolviendo una situación
// concreta y frecuente de ese sector — nada de relleno genérico tipo
// "plantilla de marketing #4". Recompensa del cofre diario (Sprint 4.14).
export const COPY_TEMPLATES: CopyTemplate[] = [
  {
    id: "clinica-recordatorio-revision",
    businessType: "Clínica",
    situation: "Recordatorio de revisión periódica a un paciente",
    subject: "Es hora de tu revisión en [Nombre de la clínica]",
    body: "Hola [Nombre],\n\nSegún nuestros registros, ya toca tu revisión periódica. Dejar pasar más tiempo puede complicar algo que ahora mismo es sencillo de resolver.\n\nReserva tu cita en los próximos días y te dejamos elegir el horario que mejor te venga: [enlace de reserva / teléfono].\n\nUn saludo,\nEl equipo de [Nombre de la clínica]",
  },
  {
    id: "restaurante-reactivar-clientes",
    businessType: "Restaurante",
    situation: "Reactivar clientes que no vuelven hace 60 días",
    subject: "Te echamos de menos en [Nombre del restaurante] 🍽️",
    body: "Hola [Nombre],\n\nHace un tiempo que no te vemos por aquí y queremos que sepas que nos encantaría volver a recibirte.\n\nPara ponerte fácil la vuelta, te invitamos a [oferta concreta: postre gratis / 10% en tu próxima visita] la próxima vez que reserves.\n\nSolo tienes que mencionar este email al llegar.\n\nTe esperamos,\n[Nombre del restaurante]",
  },
  {
    id: "inmobiliaria-seguimiento-visita",
    businessType: "Inmobiliaria",
    situation: "Seguimiento a un lead que visitó una propiedad y no decidió",
    subject: "¿Sigues buscando algo como [dirección/zona de la propiedad]?",
    body: "Hola [Nombre],\n\nHace unos días visitaste [dirección de la propiedad] y quería saber si sigue interesándote o si prefieres que te enseñe otras opciones parecidas que han entrado esta semana.\n\nSin compromiso — dime qué es lo que no terminó de convencerte (precio, zona, distribución) y busco algo más ajustado.\n\nUn saludo,\n[Nombre del agente]",
  },
  {
    id: "taller-recordatorio-itv",
    businessType: "Taller",
    situation: "Recordatorio de revisión o ITV próxima",
    subject: "Tu vehículo tiene la ITV/revisión cerca",
    body: "Hola [Nombre],\n\nSegún la fecha de tu última revisión, te toca pasar la ITV/revisión en las próximas semanas. Mejor adelantarse: así evitamos sorpresas de última hora y colas.\n\nPide cita cuando te venga bien, te lo dejamos preparado en [tiempo estimado].\n\nUn saludo,\n[Nombre del taller]",
  },
  {
    id: "hotel-reactivar-huespedes",
    businessType: "Hotel",
    situation: "Reactivar huéspedes anteriores antes de temporada alta",
    subject: "Tu próxima escapada a [ciudad/zona] te está esperando",
    body: "Hola [Nombre],\n\nNos encantó tenerte en [nombre del hotel] la última vez. Antes de que se llene la temporada, queríamos avisarte con tiempo por si te apetece repetir.\n\nReservando antes de [fecha], te guardamos [oferta concreta: mejor precio / upgrade / desayuno incluido].\n\nTe esperamos,\n[Nombre del hotel]",
  },
  {
    id: "ecommerce-carrito-abandonado",
    businessType: "Ecommerce",
    situation: "Recuperar un carrito abandonado",
    subject: "Se te olvidó algo en el carrito 🛒",
    body: "Hola [Nombre],\n\nDejaste [producto] en tu carrito. Sigue disponible, pero no por mucho tiempo si es de las que vuela.\n\nTermina tu pedido aquí: [enlace al carrito]. Si tuviste alguna duda (talla, envío, plazo), respóndenos y te ayudamos ahora mismo.\n\nUn saludo,\n[Nombre de la tienda]",
  },
  {
    id: "autonomo-seguimiento-presupuesto",
    businessType: "Autónomo",
    situation: "Seguimiento a un presupuesto enviado sin respuesta",
    subject: "¿Alguna duda sobre el presupuesto que te envié?",
    body: "Hola [Nombre],\n\nHace unos días te envié el presupuesto para [proyecto/servicio] y no he tenido noticias tuyas. Puede que se te haya pasado, o que tengas alguna duda sobre el precio o los plazos.\n\nDime lo que sea y lo hablamos — a veces con un pequeño ajuste llegamos a algo que funcione para los dos.\n\nUn saludo,\n[Tu nombre]",
  },
  {
    id: "otra-pyme-pedir-resena",
    businessType: "Otra PYME",
    situation: "Pedir una reseña a un cliente satisfecho",
    subject: "¿Nos ayudas con 2 minutos?",
    body: "Hola [Nombre],\n\nNos alegra que [producto/servicio] te haya funcionado bien. Si tienes 2 minutos, nos ayudaría muchísimo que dejaras tu opinión en Google — así otros negocios como el tuyo saben que pueden confiar en nosotros.\n\nAquí tienes el enlace directo: [enlace a reseña de Google].\n\n¡Gracias de verdad!\n[Tu nombre]",
  },
];

export function getTemplatesForBusinessType(businessType: BusinessType): CopyTemplate[] {
  return COPY_TEMPLATES.filter((t) => t.businessType === businessType);
}

export function getTemplateById(id: string): CopyTemplate | undefined {
  return COPY_TEMPLATES.find((t) => t.id === id);
}
