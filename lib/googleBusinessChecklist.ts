export interface ChecklistItem {
  /** Coincide con la columna real en `google_business_checklists`. */
  field:
    | "has_complete_hours"
    | "has_enough_photos"
    | "has_correct_category"
    | "has_contact_info"
    | "responds_to_reviews";
  /** Nombre del campo del formulario/FormData (camelCase de `field`). */
  formField: "hasCompleteHours" | "hasEnoughPhotos" | "hasCorrectCategory" | "hasContactInfo" | "respondsToReviews";
  /** Estable — usado como `template_id` de la misión que genera este ítem. */
  id: string;
  question: string;
  missionTitle: string;
  missionDescription: string;
  xpReward: number;
  timeEstimateMinutes: number;
}

/**
 * Checklist honesto sobre la ficha de Google Business del propio negocio —
 * sin API de pago ni scraping. Cada "no" genera una misión diaria real y
 * accionable; no produce ninguna nota/puntuación separada.
 */
export const GOOGLE_BUSINESS_CHECKLIST: ChecklistItem[] = [
  {
    field: "has_complete_hours",
    formField: "hasCompleteHours",
    id: "gbp-hours",
    question: "¿Tienes el horario completo y actualizado en tu ficha?",
    missionTitle: "Completa el horario de tu ficha de Google Business",
    missionDescription:
      "Un horario completo y correcto evita que la gente llegue cuando estás cerrado, y Google lo tiene en cuenta para mostrarte en búsquedas de \"abierto ahora\".",
    xpReward: 15,
    timeEstimateMinutes: 10,
  },
  {
    field: "has_enough_photos",
    formField: "hasEnoughPhotos",
    id: "gbp-photos",
    question: "¿Tienes al menos 5 fotos reales de tu negocio?",
    missionTitle: "Sube al menos 5 fotos reales a tu ficha de Google",
    missionDescription:
      "Las fichas con fotos reciben muchas más visitas y llamadas que las que no tienen — sube fotos del local, del equipo o de tus productos/servicios.",
    xpReward: 15,
    timeEstimateMinutes: 15,
  },
  {
    field: "has_correct_category",
    formField: "hasCorrectCategory",
    id: "gbp-category",
    question: "¿Tienes bien elegida la categoría principal de tu negocio?",
    missionTitle: "Revisa y ajusta la categoría principal de tu ficha de Google",
    missionDescription:
      "La categoría es una de las señales más importantes para que Google te muestre en las búsquedas correctas — revisa que sea la más específica posible para lo que ofreces.",
    xpReward: 10,
    timeEstimateMinutes: 5,
  },
  {
    field: "has_contact_info",
    formField: "hasContactInfo",
    id: "gbp-contact",
    question: "¿Tienes el teléfono y la web bien puestos?",
    missionTitle: "Añade o revisa tu teléfono y tu web en la ficha de Google",
    missionDescription:
      "Sin estos datos, quien te encuentra en Google no puede contactarte directamente desde la ficha.",
    xpReward: 10,
    timeEstimateMinutes: 5,
  },
  {
    field: "responds_to_reviews",
    formField: "respondsToReviews",
    id: "gbp-reviews",
    question: "¿Respondes a las reseñas que te dejan?",
    missionTitle: "Responde a tus reseñas recientes en Google",
    missionDescription:
      "Responder a las reseñas (buenas y malas) mejora la confianza de quien está decidiendo si visitarte, y Google también lo valora.",
    xpReward: 15,
    timeEstimateMinutes: 10,
  },
];
