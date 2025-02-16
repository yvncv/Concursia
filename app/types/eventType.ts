import { Timestamp } from "firebase/firestore";

// types/eventTypes.ts

// Interfaces para la información general
export interface GeneralData {
  name: string;
  description: string;
}

// Interfaces para las fechas
export interface DatesData {
  startDate: string;
  endDate: string;
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
  price: string;
  couple: boolean;
}

// Interfaces para la información de baile
export interface DanceData {
  levels: {
    [key: string]: LevelData;
  };
  categories: string[];
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

// Interfaz para el evento en Firestore
export interface Event {
  id: string;
  name: string;
  description: string;
  startDate: any; // Timestamp de Firestore
  endDate: any; // Timestamp de Firestore
  academyId: string | undefined;
  academyName: string;
  organizerId: string;
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
      [key: string]: {
        price: number;
        couple: boolean;
      };
    };
    registrationType: string[];
  };
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: Timestamp; // Timestamp de Firestore
  updatedAt: Timestamp; // Timestamp de Firestore
}