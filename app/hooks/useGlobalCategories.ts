// hooks/useGlobalCategories.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc, DocumentData } from "firebase/firestore";
import { CategoryLevel, DEFAULT_CATEGORIAS } from "../types/categoriesType";

interface CategoriesHookResult {
  categorias: CategoryLevel[];
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
          // Aseguramos que los datos cumplen con nuestro tipo
          const categoriasFromFirebase = data.categoriasPorNivel as CategoryLevel[];
          setCategorias(categoriasFromFirebase);
        } else {
          // Fallback a las categorías por defecto
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
  
  return { categorias, loading, error };
}