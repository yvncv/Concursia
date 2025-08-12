// types/categoriesType.ts
export type CategoryLevel =
  | "Baby"
  | "Pre Infante"
  | "Infante"
  | "Infantil"
  | "Junior"
  | "Juvenil"
  | "Adulto"
  | "Senior"
  | "Master"
  | "Oro";

export interface AgeCategory {
  name: CategoryLevel;
  minAge: number;
  maxAge: number;
}

export interface GlobalCategoriesSettings {
  categories: AgeCategory[];
  updateDate: string;
}