import { Timestamp } from "firebase/firestore";

// Define el tipo de Event para TypeScript
export interface Event {
  id: string; // Identificador único del evento
  name: string; // Nombre del evento
  description: string; // Descripción del evento
  startDate: Timestamp; // Fecha y hora de inicio del evento
  endDate: Timestamp; // Fecha y hora de culminación del evento
  academyId?: string; // ID de la academia asociada al evento (opcional)
  academyName?: string; // Nombre de la academia asociada al evento (opcional)
  organizerId?: string; // ID del organizador del evento (opcional)
  smallImage: string; // URL de la imagen pequeña para vistas previas (opcional)
  bannerImage: string; // URL del banner del evento (opcional)
  location: {
    street: string; // Calle del lugar del evento
    district: string; // Distrito del lugar del evento
    province: string; // Provincia del lugar del evento
    department: string; // Departamento del lugar del evento
    placeName: string; // Nombre del lugar del evento
    coordinates: {
      latitude: string; // Latitud del lugar del evento
      longitude: string; // Longitud del lugar del evento
    };
  };
  eventType: string; // Tipo de evento (ejemplo: "concurso")
  capacity: string;
  status: string; // Estado del evento (ejemplo: "pendiente", "en curso", "finalizado")
  settings: {
    categoriesPrices: { 
      [category: string]: number 
    }; // Detalle de precios para tipos de inscripción
    levels: string[]; // Niveles permitidos (ejemplo: "novel", "nacional")
    registrationType: string[]; // Tipos de inscripción permitidos (ejemplo: "individual", "grupal")
  };
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: Timestamp; // Fecha de creación del evento
  updatedAt: Timestamp; // Última actualización del evento
}
