// hooks/useGlobalLevels.ts
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { ModalityLevel, DEFAULT_MODALITIES } from "../types/levelsType";

interface LevelsHookResult {
  levels: ModalityLevel[];
  modalitiesLevel: ModalityLevel[]; // Añadimos este para posible compatibilidad futura
  loading: boolean;
  error: Error | null;
}

export function useGlobalLevels(): LevelsHookResult {
  const [levels, setLevels] = useState<ModalityLevel[]>(DEFAULT_MODALITIES);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchLevels = async (): Promise<void> => {
      try {
        setLoading(true);
        const db = getFirestore();
        const levelsRef = doc(db, "globalSettings", "levels");
        const levelsSnap = await getDoc(levelsRef);
        
        if (levelsSnap.exists()) {
          const data = levelsSnap.data();
          // Verificamos que el campo existe y procesamos los datos
          if (data.modalitiesLevel) {
            let levelsArray: ModalityLevel[];
            
            if (Array.isArray(data.modalitiesLevel)) {
              // Si ya es un array, lo usamos directamente
              levelsArray = data.modalitiesLevel;
            } else {
              // Si es un objeto indexado, lo convertimos a array
              levelsArray = Object.values(data.modalitiesLevel);
            }
            
            setLevels(levelsArray);
          } else {
            console.warn("El campo modalitiesLevel no existe en el documento levels, usando valores por defecto");
          }
        } else {
          console.warn("No se encontraron modalidades en Firebase, usando valores por defecto");
        }
      } catch (err) {
        console.error("Error al cargar modalidades: ", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
      } finally {
        setLoading(false);
      }
    };
    
    fetchLevels();
  }, []);
  
  // Retornamos ambas propiedades para mayor flexibilidad
  return { 
    levels, 
    modalitiesLevel: levels, // Alias para posible compatibilidad
    loading, 
    error 
  };
}