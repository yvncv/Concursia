// types/categoriesType.ts
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

// Interfaz para la estructura completa de categories en Firebase
export interface GlobalCategoriesSettings {
  categoriesByLevel: { [key: string]: string };
  updateDate: string;
}