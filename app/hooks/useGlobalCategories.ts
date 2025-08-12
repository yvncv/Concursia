// hooks/useGlobalCategories.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { AgeCategory } from "../types/categoriesType";

interface CategoriesHookResult {
  categorias: AgeCategory[];
  loading: boolean;
  error: Error | null;
}

export function useGlobalCategories(): CategoriesHookResult {
  const [categorias, setCategorias] = useState<AgeCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchCategorias = async (): Promise<void> => {
      try {
        setLoading(true);
        const db = getFirestore();
        const ref = doc(db, "globalSettings", "categories");
        const snap = await getDoc(ref);

        if (snap.exists()) {
          const data = snap.data();
          const categorias = data.categories;

          if (Array.isArray(categorias)) {
            setCategorias(categorias);
          } else {
            throw new Error("Campo 'categories' no es un array válido");
          }
        } else {
          throw new Error("No se encontró el documento de categorías");
        }
      } catch (err) {
        console.error("❌ Error al cargar categorías:", err);
        setError(err instanceof Error ? err : new Error("Error desconocido"));
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  return { categorias, loading, error };
}
