import { Timestamp } from "firebase/firestore";

// Define el tipo de event para TypeScript
export interface Event {
  id: string; // Identificador único del event
  imagen: string; // URL de la imagen del event
  nombre: string; // Nombre del event
  descripcion: string; // Descripción del event
  fecha: Timestamp; // Fecha y hora del event
  lugar: string; // Lugar del event
  tipoEvento: string; // Tipo de event (ejemplo: Concurso, Exhibición, etc.)
  coordenadas: string; // Coordenadas del lugar del event
  direccion: string; // Dirección exacta (puede estar vacía)
  calle: string; // Calle del lugar del event
  distrito: string; // Distrito del lugar del event
  provincia: string; // Provincia del lugar del event
  departamento: string; // Departamento del lugar del event
}
