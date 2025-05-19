export type CategoryLevel = 
  | "Baby" 
  | "Pre-Infante" 
  | "Infante" 
  | "Infantil"
  | "Junior" 
  | "Juvenil" 
  | "Adulto" 
  | "Senior" 
  | "Master" 
  | "Oro";

// Interfaz para la estructura almacenada en Firestore
export interface GlobalCategoriesSettings {
  categoriesByLevel: CategoryLevel[];
  updateDate: string;
}

// Valores por defecto para usar cuando no hay datos disponibles
export const DEFAULT_CATEGORIAS: CategoryLevel[] = [
  "Baby", "Pre-Infante", "Infante", "Infantil",
  "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"
];

// Si necesitas convertir un índice a una categoría (para manejar datos indexados)
export function mapIndexToCategory(index: number): CategoryLevel | undefined {
  return DEFAULT_CATEGORIAS[index];
}

// Una función auxiliar para comparar categorías (útil para determinar nivel)
export function getCategoryIndex(category: CategoryLevel): number {
  return DEFAULT_CATEGORIAS.indexOf(category);
}

// Esta función te permite comparar niveles de categorías
export function compareCategoryLevels(cat1: CategoryLevel, cat2: CategoryLevel): number {
  const index1 = getCategoryIndex(cat1);
  const index2 = getCategoryIndex(cat2);
  
  // Si alguno no existe, retornamos NaN
  if (index1 === -1 || index2 === -1) return NaN;
  
  // Retornamos la diferencia (positiva si cat1 > cat2, negativa si cat1 < cat2)
  return index1 - index2;
}