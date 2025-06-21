import { Timestamp } from "firebase/firestore";
import { BlockInTanda } from "./blockInTandaType";

/**
 * Representa una tanda completa, compuesta por múltiples bloques que bailan simultáneamente.
 */
export interface Tanda {
  id: string;                         // UID de la tanda
  index: number;                      // Orden secuencial de esta tanda (0, 1, 2...)
  phase: "Eliminatoria" | "Semifinal" | "Final"; // Fase a la que pertenece esta tanda
  blocks: BlockInTanda[];             // Bloques que componen esta tanda (ej. 3 bloques activos)
  status: "pendiente" | "en_proceso" | "finalizada"; // Estado actual de la tanda
  startTime?: Timestamp;              // Hora real de inicio de la tanda
  endTime?: Timestamp;                // Hora real de finalización
  liveCompetitionId: string;          // id del live competition

  /**
   * Solo se utiliza en modalidad SERIADO.
   * Mapea el índice del bloque al ID del participante que ganó en ese bloque.
   * En otras modalidades puede omitirse.
   */
  blockWinners?: {
    [blockIndex: number]: string;     // participantId del ganador por bloque
  };
}
