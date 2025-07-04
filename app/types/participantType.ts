// app/types/participantType.ts
import { Timestamp } from "firebase/firestore";

export interface Participant {
  id: string; // Autogenerado por Firebase
  code: string; // Codigo en la espalda del participante
  usersId: string[];
  academiesId: string[];
  academiesName: string[];
  eventId: string;
  category: string;
  level: string;
  scoreIds: string[]; // Referencia a los IDs de los puntajes
  ticketId: string;
  phase: string;
  status: string;
  createdAt: Timestamp; // Timestamp de Firestore
  updatedAt: Timestamp; // Timestamp de Firestore
}