import { User as FirebaseUser } from "firebase/auth";
import { Timestamp } from "firebase/firestore";

export type User = FirebaseUser & {
  id: string;
  roleId: string; // "admin" | "organizer" | "user" | "staff"
  dni: string;
  dniHash: string;
  firstName: string;
  lastName: string;
  birthDate: Timestamp;
  gender: string;
  email: string[];
  phoneNumber?: string[];
  profileImage?: string | File;
  coverImage?: string | File;
  marinera?: {
    participant?: { // campo con informacion del usuario si es participante
      level: string;
      category?: string;
      participatedEvents: string[]; // eventos en los que participó
    };
    academyId?: string; // id de la academia a la que pertenece
    academyName?: string; // name de la academia a la que pertenece
    attendedEvents?: string[]; // eventos a los que asistió
  };
  staffOf?: {
    eventId: string;
    permissions: string[]; // Puede estar en varios roles
  }[];
  location?: {
    department?: string;
    district?: string;
    province?: string;
  };
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    tiktok?: string;
    youtube?: string;
    whatsapp?: string;
    twitter?: string;
  };
  // NUEVO: Información del apoderado para menores de edad
  guardian?: {
    dni: string;
    dniHash: string;
    firstName: string;
    lastName: string;
    relationship: string; // "Padre", "Madre", "Tutor", "Abuelo/a", etc.
    authorized: boolean;
    authorizedAt: Timestamp;
  };
  createdAt: Timestamp;
};