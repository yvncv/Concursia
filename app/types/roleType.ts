import { Timestamp } from "firebase/firestore";

// Define el tipo de Event para TypeScript
export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[]; // Array de strings con los permisos asociados al rol
  createdAt: Timestamp; // Fecha y hora de creación del rol
}
