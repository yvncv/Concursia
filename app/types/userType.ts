import { User as FirebaseUser } from 'firebase/auth';
import { Timestamp } from 'firebase/firestore';

export type User = FirebaseUser & {
  id: string; // Identificador único del usuario
  name: string; // Nombre del usuario
  email: string; // Correo electrónico del usuario
  contacto: number; // Número de contacto del usuario
  role: "user" | "organizador" | "admin"; // Rol del usuario en el sistema
  idAcademia?: string; // ID de la academia asociada al usuario (opcional)
  eventos: {
    espectados: string[]; // IDs de eventos que el usuario ha presenciado
    participados: string[]; // IDs de eventos en los que el usuario ha participado
  }; // Relación con eventos
  createdAt: Timestamp; // Fecha de creación del usuario
};
