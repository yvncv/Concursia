import { Timestamp } from "firebase/firestore";

/**
 * Representa un participante (individual o pareja) dentro de un bloque de una tanda.
 */
export interface TandaParticipant {
  participantId: string;              // ID del documento en la colección 'participants'
  scores: JudgeScore[];               // Puntajes otorgados por los jurados de su bloque
  totalScore?: number;                // Suma total de los puntajes (calculada al finalizar)
}

/**
 * Puntaje dado por un jurado a un participante.
 */
export interface JudgeScore {
  judgeId: string;                    // userId del jurado que emitió el puntaje
  score: 3 | 4 | 5 | 0 | 1 | 2 | null;                   // Puntaje otorgado
  timestamp?: Timestamp;             // Fecha/hora en que se emitió el puntaje
}
