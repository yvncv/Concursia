import { Timestamp, FieldValue } from "firebase/firestore";

export type AcademyMembershipRecord = {
  id?: string;                           // ID del documento (opcional si lo tomas de doc.id)
  userId: string;                        // UID del usuario
  academyId: string;                     // ID de la academia
  joinedAt: Timestamp | FieldValue;      // Fecha en que fue aceptado (puede ser serverTimestamp)
  leftAt?: Timestamp | FieldValue;       // Fecha en que se retiró o fue retirado (opcional)
  removedBy?: string;                    // UID del organizador (si fue expulsado, opcional)
  reason?: string;                       // Comentario opcional sobre la salida
};