// app/types/participantType.ts
import { Timestamp } from "firebase/firestore";

export interface Participant {
  id: string; // Autogenerado por Firebase
  code: string; // Codigo en la espalda del participante
  usersId: string[];
  eventId: string;
  category: string;
  level: string;
  registrationDate: Timestamp;
  scoreIds: string[]; // Referencia a los IDs de los puntajes
  ticketId: string;
  phase: string;
  status: string;
  createdAt: Timestamp; // Timestamp de Firestore
  updatedAt: Timestamp; // Timestamp de Firestore
}