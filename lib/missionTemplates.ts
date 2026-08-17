import type { MissionDifficulty } from "@/types/database.types";

interface MissionTemplate {
  title: string;
  description: string;
  difficulty: MissionDifficulty;
  timeEstimateMinutes: number;
  xpReward: number;
  expectedImpact: string;
}

// Contenido editorial de partida para Sprint 1. El motor de auditoría (Sprint 3)
// sustituirá esta selección fija por misiones generadas a partir de los hallazgos reales.
export const DEFAULT_DAILY_MISSIONS: MissionTemplate[] = [
  {
    title: "Responde a una reseña reciente",
    description:
      "Los negocios que responden a sus reseñas generan más confianza y aparecen mejor posicionados en Google.",
    difficulty: "easy",
    timeEstimateMinutes: 3,
    xpReward: 10,
    expectedImpact: "Mejora tu reputación y tu posicionamiento local",
  },
  {
    title: "Actualiza el título de tu página principal",
    description:
      "Un título claro ayuda a que la gente entienda al instante qué ofreces y a que Google lo muestre mejor.",
    difficulty: "easy",
    timeEstimateMinutes: 5,
    xpReward: 10,
    expectedImpact: "Más clics desde los resultados de búsqueda",
  },
  {
    title: "Sube una foto reciente de tu negocio",
    description:
      "Las fichas con fotos actuales generan más confianza y reciben más visitas que las que no las tienen.",
    difficulty: "easy",
    timeEstimateMinutes: 2,
    xpReward: 10,
    expectedImpact: "Más confianza al primer vistazo",
  },
];

export const DEFAULT_WEEKLY_MISSION: MissionTemplate = {
  title: "Ayuda a Google a entender tu negocio",
  description:
    "Añadiendo información estructurada sobre tu negocio (nombre, dirección, horario), Google puede mostrarte mejor en búsquedas locales.",
  difficulty: "medium",
  timeEstimateMinutes: 30,
  xpReward: 50,
  expectedImpact: "Mejor visibilidad en búsquedas locales",
};
