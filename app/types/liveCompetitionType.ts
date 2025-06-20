// app/types/liveCompetitionType.ts
import { Timestamp, FieldValue } from "firebase/firestore";

export type CompetitionPhase = "Eliminatoria" | "Semifinal" | "Final";

/**
 * Documento que representa la competencia en vivo de una modalidad/categoría/género específica.
 */
export interface LiveCompetition {
  id: string;                         // ID único, sugerido: "Modalidad_Categoría_Género"
  eventId: string;                    // ID del evento principal al que pertenece
  level: string;                      // Modalidad (ej. Seriado, Nacional)
  category: string;                   // Categoría (Infante, Juvenil, etc.)
  gender: "Mujeres" | "Varones" | "Mixto"; // Género de los participantes
  currentPhase: CompetitionPhase;     // Fase actual activa
  totalParticipants: number;          // Cantidad total de participantes en esta combinación
  blocks: number;                     // Cantidad de bloques simultáneos definidos
  tracksPerBlock: number;             // Cantidad de pistas por bloque
  totalTandas: number;                // Total de tandas generadas
  currentTandaIndex: number;          // Índice de la tanda actualmente activa
  createdAt: Timestamp;               // Fecha de creación del documento
  updatedAt: Timestamp;               // Última fecha de actualización
}

/**
 * Tipo para crear un nuevo documento LiveCompetition
 * Los campos de timestamp pueden ser FieldValue al crear, pero Timestamp cuando se leen
 */
export interface LiveCompetitionCreate {
  eventId: string;
  level: string;
  category: string;
  gender: "Mujeres" | "Varones" | "Mixto";
  currentPhase: CompetitionPhase;
  totalParticipants: number;
  blocks: number;
  tracksPerBlock: number;
  totalTandas: number;
  currentTandaIndex: number;
  createdAt: FieldValue;              // FieldValue cuando se crea
  updatedAt: FieldValue;              // FieldValue cuando se crea
}