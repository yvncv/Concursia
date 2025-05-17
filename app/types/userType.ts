import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type User = FirebaseUser & {
  id: string;
  roleId: string; // "admin" | "organizer" | "user" | "staff"
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  gender: string;
  email: string[];
  phoneNumber?: string[];
  profileImage?: string | File;
  marinera?: {
    participant?: { // campo con informacion del usuario si es participante
      level: string;
      category: string;
      participatedEvents: string[]; // eventos en los que participó
    };
    academyId?: string; // id de la academia a la que pertenece
    attendedEvents?: string[]; // eventos a los que asistió
  };
  location?: {
    department?: string;
    district?: string;
    province?: string;
  };
  createdAt: Timestamp;
};
