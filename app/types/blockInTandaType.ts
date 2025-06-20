import { TandaParticipant } from "./tandaParticipantType";

/**
 * Representa un bloque dentro de una tanda.
 * Cada bloque contiene sus propios participantes y jurados.
 */
export interface BlockInTanda {
  blockIndex: number;                 // Número de bloque dentro de la tanda (0, 1, 2...)
  participants: TandaParticipant[];   // Participantes asignados a este bloque
  judgeIds: string[];                 // userIds de los jurados asignados a este bloque
}
