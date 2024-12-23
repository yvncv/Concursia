import { Timestamp } from "firebase/firestore";

// Define the event type for TypeScript
export interface Evento {
  id: string;
  imagen: string;
  nombre: string;
  descripcion: string;
  fecha: Timestamp;
  lugar: string;
  tipoEvento: string;
  //mapa
  ubicacion: string;
}