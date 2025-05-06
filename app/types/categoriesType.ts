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

export interface GlobalSettings {
  categoriasPorNivel: CategoryLevel[];
  fechaActualizacion: Date;
}

// Añadir esta constante
export const DEFAULT_CATEGORIAS: CategoryLevel[] = [
  "Baby", "Pre-Infante", "Infante", "Infantil",
  "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"
];