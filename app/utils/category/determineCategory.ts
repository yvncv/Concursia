// utils/category/determineCategory.ts
import { AgeCategory, CategoryLevel } from "@/app/types/categoriesType";

export const determineCategory = (
  birthDate: Date,
  referenceDate: Date,
  categories: AgeCategory[]
): CategoryLevel | undefined => {
  let age = referenceDate.getFullYear() - birthDate.getFullYear();
  const monthDiff = referenceDate.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && referenceDate.getDate() < birthDate.getDate())) {
    age--;
  }

  return categories.find(cat => age >= cat.minAge && age <= cat.maxAge)?.name;
};
