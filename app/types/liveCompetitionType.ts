import { Timestamp, FieldValue } from "firebase/firestore";

export type CompetitionPhase = "Eliminatoria" | "Semifinal" | "Final";
export type LiveCompetitionStatus = "pending" | "active" | "completed";

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
  blocks: number | null;              // Cantidad de bloques simultáneos definidos (null = no configurado)
  tracksPerBlock: number | null;      // Cantidad de pistas por bloque (null = no configurado)
  judgesPerBlock: number | null;      // Cantidad de jurados por bloque (null = no configurado)
  totalTandas: number;                // Total de tandas generadas
  currentTandaIndex: number;          // Índice de la tanda actualmente activa
  
  status: LiveCompetitionStatus;      // Estado de esta competencia
  realStartTime?: Timestamp;          // Cuándo inició esta competencia (primera tanda)
  realEndTime?: Timestamp;            // Cuándo terminó esta competencia (última tanda)
  isFinished: boolean;                // Si ya terminó todas sus tandas
  completedTandas: number;            // Contador de tandas finalizadas
  
  createdAt: Timestamp;               // Fecha de creación del documento
  updatedAt: Timestamp;               // Última fecha de actualización
}

/**
 * Tipo para crear un nuevo documento LiveCompetition
 */
export interface LiveCompetitionCreate {
  eventId: string;
  level: string;
  category: string;
  gender: "Mujeres" | "Varones" | "Mixto";
  currentPhase: CompetitionPhase;
  totalParticipants: number;
  blocks: number | null;              // null al crear, se configura después
  tracksPerBlock: number | null;      // null al crear, se configura después
  judgesPerBlock: number | null;      // null al crear, se configura después
  totalTandas: number;
  currentTandaIndex: number;
  
  status: LiveCompetitionStatus;      // "pending" al crear
  isFinished: boolean;                // false al crear
  completedTandas: number;            // 0 al crear
  
  createdAt: FieldValue;              // FieldValue cuando se crea
  updatedAt: FieldValue;              // FieldValue cuando se crea
}