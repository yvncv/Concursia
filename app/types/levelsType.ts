// types/levelsType.ts
import { CompetitionPhase } from './eventType';

export type ModalityLevel = 
  | "Seriado"
  | "Individual"
  | "Novel Novel"
  | "Novel Abierto"
  | "Novel Abierto A"
  | "Novel Abierto B"
  | "Nacional";


// Interfaz para cada modalidad individual
export interface ModalityConfig {
  name: string;
  couple: boolean;
  phases: CompetitionPhase[];
  genderSeparated: boolean;
}

// Interfaz para la estructura completa de levels en Firebase
export interface GlobalLevelsSettings {
  modalitiesLevel: { [key: string]: ModalityConfig };
  updateDate: string;
}