import { Timestamp } from "firebase/firestore";

// Define el tipo de event para TypeScript
export interface Event {
  id: string; // Identificador único del evento
  imagen: string; // URL de la imagen del evento
  nombre: string; // Nombre del evento
  descripcion: string; // Descripción del evento
  fecha: Timestamp; // Fecha y hora del evento
  tipoEvento: string; // Tipo de evento (ejemplo: Concurso, Exhibición, etc.)
  lugar: {
    calle: string; // Calle del lugar del evento
    coordenadas: string; // Coordenadas del lugar del evento (latitud, longitud)
    distrito: string; // Distrito del lugar del evento
    provincia: string; // Provincia del lugar del evento
    departamento: string; // Departamento del lugar del evento
    nombreLugar: string; // Nombre del lugar del evento
  }; // Detalle del lugar, agrupado en un objeto
  idAcademia?: string; // ID de la academia asociada al evento (puede estar vacío)
  idOrganizador?: string; // ID del organizador del evento (puede estar vacío)
}