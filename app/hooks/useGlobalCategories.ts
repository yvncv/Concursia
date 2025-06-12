// hooks/useGlobalCategories.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { CategoryLevel } from "../types/categoriesType";

interface CategoriesHookResult {
  categorias: CategoryLevel[];
  categoriasPorNivel: CategoryLevel[]; // Alias para compatibilidad
  loading: boolean;
  error: Error | null;
}

export function useGlobalCategories(): CategoriesHookResult {
  const [categorias, setCategorias] = useState<CategoryLevel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchCategorias = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore();
        const categoriasRef = doc(db, "globalSettings", "categories");
        const categoriasSnap = await getDoc(categoriasRef);
        
        if (categoriasSnap.exists()) {
          const data = categoriasSnap.data();
          
          if (data.categoriesByLevel) {
            const categoriesData = data.categoriesByLevel;
            
            // Convertir objeto indexado a array
            const categoriasArray: CategoryLevel[] = [];
            
            Object.values(categoriesData).forEach(categoryName => {
              if (typeof categoryName === 'string') {
                categoriasArray.push(categoryName as CategoryLevel);
              }
            });
            
            setCategorias(categoriasArray);
            
          } else {
            throw new Error("Campo categoriesByLevel no encontrado en el documento");
          }
        } else {
          throw new Error("Documento categories no encontrado en globalSettings");
        }
        
      } catch (err) {
        console.error("❌ Error al cargar categorías desde Firebase:", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        
        // En caso de error, dejar array vacío
        setCategorias([]);
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchCategorias();
  }, []);
  
  return { 
    categorias, 
    categoriasPorNivel: categorias, // Alias para compatibilidad
    loading, 
    error 
  };
}