// types/levelsType.ts

// Definimos el tipo de las modalidades como unión de strings literales
export type ModalityLevel = 
  | "Seriado"
  | "Individual"
  | "Novel Novel"
  | "Novel Abierto"
  | "Novel Abierto A"
  | "Novel Abierto B"
  | "Nacional";

// Interfaz para la estructura almacenada en Firestore
export interface GlobalLevelsSettings {
  modalitiesLevel: ModalityLevel[];
  updateDate: string;
}

// Valores por defecto para usar cuando no hay datos disponibles
export const DEFAULT_MODALITIES: ModalityLevel[] = [
  "Seriado", 
  "Individual", 
  "Novel Novel", 
  "Novel Abierto", 
  "Novel Abierto A", 
  "Novel Abierto B", 
  "Nacional"
];

// Si necesitas convertir un índice a una modalidad (para manejar datos indexados)
export function mapIndexToModality(index: number): ModalityLevel | undefined {
  return DEFAULT_MODALITIES[index];
}

// Una función auxiliar para obtener el índice de una modalidad
export function getModalityIndex(modality: ModalityLevel): number {
  return DEFAULT_MODALITIES.indexOf(modality);
}

// Esta función te permite comparar niveles de modalidades
export function compareModalityLevels(mod1: ModalityLevel, mod2: ModalityLevel): number {
  const index1 = getModalityIndex(mod1);
  const index2 = getModalityIndex(mod2);
  
  // Si alguno no existe, retornamos NaN
  if (index1 === -1 || index2 === -1) return NaN;
  
  // Retornamos la diferencia (positiva si mod1 > mod2, negativa si mod1 < mod2)
  return index1 - index2;
}