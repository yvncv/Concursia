// `app/types/eventType.ts`
import { Timestamp } from "firebase/firestore";

// Interfaces para la información general
export interface GeneralData {
  name: string;
  description: string;
  status: string;
}

// Interfaces para las fechas
export interface DatesData {
  startDate: Timestamp;
  endDate: Timestamp;
}

// Interfaces para los detalles
export interface DetailsData {
  capacity: string;
  eventType: string;
}

// Interfaces para la ubicación
export interface LocationData {
  latitude: string;
  longitude: string;
  department: string;
  district: string;
  placeName: string;
  province: string;
  street: string;
}

// Interfaces para el nivel
export interface LevelData {
  selected: boolean;
  categories: string[];
  price: number;
  couple: boolean;
}

// Interfaces para la información de baile
export interface DanceData {
  categories?: string[];
  levels: {
    [key: string]: LevelData;
  };
}

// Interfaces para las imágenes
export interface ImagesData {
  smallImage: string | File;
  bannerImage: string | File;
  smallImagePreview?: string;
  bannerImagePreview?: string;
}

// Interfaz principal para el formulario de evento
export interface EventFormData {
  general: GeneralData;
  dates: DatesData;
  details: DetailsData;
  location: LocationData;
  dance: DanceData;
  images: ImagesData;
}

// Define el tipo de datos para la configuración de inscripción
export interface RegistrationSettings {
    grupalCSV: boolean
    individualWeb: boolean
    sameDay: boolean
}

// Define el tipo de datos para la configuración de "jalar pareja"
export interface PullCoupleSettings {
    enabled: boolean
    criteria: "Category" | "Age"
    difference: number
}

// Define el tipo principal para todas las configuraciones del evento
export interface EventSettings {
    eventId: string // ID del evento al que pertenece la configuración
    registration: RegistrationSettings
    pullCouple: PullCoupleSettings
    // Aquí puedes seguir agregando más configuraciones en el futuro
}


// Interfaz para el evento en Firestore
export interface CustomEvent {
  id: string;
  name: string;
  description: string;
  startDate: Timestamp; // Timestamp de Firestore
  endDate: Timestamp; // Timestamp de Firestore
  academyId: string | undefined;
  academyName: string;
  organizerId: string; // ID del organizador legal
  staff?:{
    userId: string;
    userStaffType: string[]; // "inscripciones" | "presencia" | "logistica" | "recaudo";
  }[];
  smallImage: string;
  bannerImage: string;
  location: {
    street: string;
    district: string;
    province: string;
    department: string;
    placeName: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  eventType: string;
  capacity: string;
  status: string;
  settings: {
    categories: string[];
    levels: {
      [key: string]: LevelData;
    };
    registrationType: string[]; 
  };
  createdBy: string; // ID del organizador o staff que creo el evento
  lastUpdatedBy: string;
  createdAt: Timestamp; // Timestamp de Firestore
  updatedAt: Timestamp; // Timestamp de Firestore
}