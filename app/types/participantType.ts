import { Timestamp } from "firebase/firestore";

// Define el tipo de Event para TypeScript
export interface Participant {
  id: string;
  code: string;
  usersId: string[];
  eventId: string;
  category: string;
  level: string;
  registrationDate: Timestamp;
  scores: {
    heatId: string;
    judgesId: string;
    score: number;
  }[];
  phase: string;
  status: string;
  createdAt: Timestamp; // Fecha y hora de creación del participante (Timestamp)
}
