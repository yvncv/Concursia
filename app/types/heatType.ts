import { Timestamp } from "firebase/firestore";

// Define el tipo de Event para TypeScript
export interface Heat {
  id: string; // Identificador único del evento
  eventId: string; // ID del evento al que pertenece el heat
  level: string; // Nivel del heat (A, B, C, etc.)
  category: string; // Categoría del heat (individual, team, etc.)
  phase: string; // Fase del heat (preliminar, final, etc.)
  marineras: string[]; // Marineras participantes del heat
  participantsCodes: string[]; // Códigos de los participantes del heat
  judgesIds: string[]; // IDs de los jueces del heat
  roundNumber: number; // Número de ronda del heat
  scores: {
    participantsCode: string; // Código del participante
    judgesId: string; // ID del juez
    score: number; // Puntaje del participante
  }[];
  heatStartTime: Timestamp; // Fecha y hora de inicio del heat
  heatEndTime: Timestamp; // Fecha y hora de culminación del heat
  status: string; // Estado del heat (activo, finalizado, etc.)
  createdAt: Timestamp; // Fecha y hora de creación del heat
}
