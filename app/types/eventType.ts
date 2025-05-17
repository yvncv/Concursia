// `app/types/eventType.ts` (actualizado considerando que level = modalidad)
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

// Interfaces para el nivel (que es la modalidad)
export interface LevelData {
  selected: boolean;
  categories: string[];
  price: number;
  couple: boolean;
  // Nueva configuración para cada level/modalidad
  config?: LevelConfig;
}

// Nueva interfaz para la configuración de levels/modalidades
export interface LevelConfig {
  blocks: number;
  tracksPerBlock: number;
  judgesCount: number;
  notes?: string;
}

// Enumeración para las fases de competencia
export enum CompetitionPhase {
  ELIMINATORIA = "Eliminatoria",
  SEMIFINAL = "Semifinal",
  FINAL = "Final"
}

// Nueva interfaz para los items del cronograma con fases
export interface ScheduleItem {
  id: string;
  levelId: string; // ID del nivel/modalidad
  levelName: string; // Nombre del nivel/modalidad
  category: string;
  phase: CompetitionPhase; // Fase de la competencia
  participantsCount?: number; // Opcional: cantidad de participantes
  order: number;
  estimatedTime: number;
  day?: number; // Opcional: para eventos de varios días
  startTime?: string; // Opcional: hora programada de inicio
}

// Interfaces para la información de baile
export interface DanceData {
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

// Interface para la configuración de inscripción
export interface InscriptionSettings {
  groupEnabled: boolean;
  individualEnabled: boolean;
  onSiteEnabled: boolean;
}

// Interface para la configuración de "jalar pareja"
export interface PullCoupleSettings {
  enabled: boolean;
  criteria: "Category" | "Age";
  difference: number;
}

// Interface para la configuración de fases
export interface PhaseSettings {
  semifinalThreshold?: number; // Número de participantes a partir del cual se hace semifinal
  finalParticipantsCount?: number; // Número de participantes que pasan a la final
  timePerParticipant?: {
    [phase in CompetitionPhase]?: number; // Tiempo en minutos por participante en cada fase
  };
}

// Interface para todas las configuraciones del evento (actualizada)
export interface EventSettings {
  inscription: InscriptionSettings;
  pullCouple: PullCoupleSettings;
  // Nueva configuración para el cronograma
  schedule?: {
    items: ScheduleItem[];
    lastUpdated?: Timestamp;
    dayCount?: number; // Para eventos de múltiples días
  };
  // Configuración global de fases
  phases?: PhaseSettings;
}

// Interfaz principal para el formulario de evento
export interface EventFormData {
  general: GeneralData;
  dates: DatesData;
  details: DetailsData;
  location: LocationData;
  dance: DanceData;
  images: ImagesData;
  settings: EventSettings;
}

// Interfaz para el evento en Firestore
export interface CustomEvent {
  id: string;
  name: string;
  description: string;
  startDate: Timestamp;
  endDate: Timestamp;
  academyId: string | undefined;
  academyName: string;
  organizerId: string;
  staff?: {
    userId: string;
    userStaffType: string[]; // "inscripciones" | "entradas" | "evento" | "tunel"
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
  dance: {
    levels: {
      [key: string]: LevelData; // Aquí cada level puede tener su config
    };
  };
  // Nuevo campo para rastrear participantes inscritos (para determinar fases)
  participants?: {
    [levelId: string]: {
      [category: string]: {
        count: number;
        registeredIds: string[]; // IDs de los participantes inscritos
      };
    };
  };
  settings: EventSettings; 
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}