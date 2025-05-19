// hooks/useGlobalCategories.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { CategoryLevel, DEFAULT_CATEGORIAS } from "../types/categoriesType";

interface CategoriesHookResult {
  categorias: CategoryLevel[];
  categoriasPorNivel: CategoryLevel[]; // Añadimos este para mantener compatibilidad
  loading: boolean;
  error: Error | null;
}

export function useGlobalCategories(): CategoriesHookResult {
  const [categorias, setCategorias] = useState<CategoryLevel[]>(DEFAULT_CATEGORIAS);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchCategorias = async (): Promise<void> => {
      try {
        setLoading(true);
        const db = getFirestore();
        const categoriasRef = doc(db, "globalSettings", "categories");
        const categoriasSnap = await getDoc(categoriasRef);
        
        if (categoriasSnap.exists()) {
          const data = categoriasSnap.data();
          // Verificamos que el campo existe y procesamos los datos
          if (data.categoriesByLevel) {
            let categoriasArray: CategoryLevel[];
            
            if (Array.isArray(data.categoriesByLevel)) {
              // Si ya es un array, lo usamos directamente
              categoriasArray = data.categoriesByLevel;
            } else {
              // Si es un objeto indexado, lo convertimos a array
              categoriasArray = Object.values(data.categoriesByLevel);
            }
            
            setCategorias(categoriasArray);
          } else {
            console.warn("El campo categoriesByLevel no existe en el documento categories, usando valores por defecto");
          }
        } else {
          console.warn("No se encontraron categorías en Firebase, usando valores por defecto");
        }
      } catch (err) {
        console.error("Error al cargar categorías: ", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategorias();
  }, []);
  
  // Retornamos ambas propiedades para mantener compatibilidad
  return { 
    categorias, 
    categoriasPorNivel: categorias, // Alias para mantener compatibilidad
    loading, 
    error 
  };
}