// app/types/eventType.ts
import { Timestamp } from "firebase/firestore";

// ——— Datos básicos ———
export interface GeneralData {
  name: string;
  description: string;
  status: string;
}

export interface DatesData {
  startDate: Timestamp;
  endDate: Timestamp;
}

export interface DetailsData {
  capacity: string;
  eventType: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  department: string;
  district: string;
  placeName: string;
  province: string;
  street: string;
}

// ——— Niveles (modalidades) ———
export interface LevelConfig {
  blocks: number;
  tracksPerBlock: number;
  judgesCount: number;
  notes?: string;
}

export interface LevelData {
  selected: boolean;
  categories: string[];
  price: number;
  couple: boolean;
  config?: LevelConfig;
}

// ——— Fases de competencia ———
export enum CompetitionPhase {
  ELIMINATORIA = "Eliminatoria",
  SEMIFINAL     = "Semifinal",
  FINAL         = "Final"
}

export type Gender = "Mujeres" | "Varones" | "Mixto";

// Nueva interfaz para los items del cronograma con fases
export interface ScheduleItem {
  id: string;
  levelId: string; // ID del nivel/modalidad
  category: string;
  gender?: Gender;
  phase: CompetitionPhase; // Fase de la competencia
  participantsCount?: number; // Opcional: cantidad de participantes
  order: number;
  estimatedTime: number;
  day?: number;
  startTime?: string;
}

// ——— Datos de baile ———
export interface DanceData {
  levels: {
    [key: string]: LevelData;
  };
}

// ——— Imágenes ———
export interface ImagesData {
  smallImage: string | File;
  bannerImage: string | File;
  smallImagePreview?: string;
  bannerImagePreview?: string;
}

// ——— Configuración de inscripciones ———
export interface InscriptionSettings {
  groupEnabled: boolean;
  individualEnabled: boolean;
  onSiteEnabled: boolean;
}

// ——— Configuración de jalar pareja ———
export interface PullCoupleSettings {
  enabled: boolean;
  criteria: "Category" | "Age";
  difference: number;
}

// ——— Configuración de fases ———
export interface PhaseSettings {
  semifinalThreshold?: number;
  finalParticipantsCount?: number;
  timePerParticipant?: {
    [phase in CompetitionPhase]?: number;
  };
}

// ——— Configuración global del evento ———
export interface EventSettings {
  inscription: InscriptionSettings;
  registration?: RegistrationSettings;
  pullCouple: PullCoupleSettings;
  schedule?: {
    items: ScheduleItem[];
    lastUpdated?: Timestamp;
    dayCount?: number;
  };
  phases?: PhaseSettings;
}

// ——— Configuración de registro (antes registración) ———
export interface RegistrationSettings {
  grupalCSV: boolean;
  individualWeb: boolean;
  sameDay: boolean;
}

// ——— Modelo completo del formulario ———
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
  realStartTime?: Timestamp;
  realEndTime?: Timestamp;
  academyId?: string;
  academyName: string;
  organizerId: string;
  staff?: {
    userId: string;
    permissions: string[];
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
      [key: string]: LevelData;
    };
  };
  participants?: {
    [levelId: string]: {
      [category: string]: {
        count: number;
        registeredIds: string[];
      };
    };
  };
  settings: EventSettings;
  createdBy: string;
  lastUpdatedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
