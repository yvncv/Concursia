// hooks/useGlobalLevels.ts - CORREGIDO
import { useState, useEffect } from "react";
import { getFirestore, doc, getDoc } from "firebase/firestore";
import { 
  ModalityLevel, 
  ModalityConfig
} from "../types/levelsType";
import { CompetitionPhase } from "../types/eventType"; // 🔥 CAMBIO: Importar desde eventType

interface LevelsHookResult {
  levels: ModalityLevel[];
  modalitiesLevel: ModalityLevel[]; // Alias para compatibilidad
  modalityConfigs: { [key: string]: ModalityConfig };
  loading: boolean;
  error: Error | null;
  // Funciones auxiliares
  getModalityConfig: (modality: ModalityLevel) => ModalityConfig | null;
  isCouple: (modality: ModalityLevel) => boolean;
  getPhases: (modality: ModalityLevel) => CompetitionPhase[];
  isGenderSeparated: (modality: ModalityLevel) => boolean;
}

export function useGlobalLevels(): LevelsHookResult {
  const [levels, setLevels] = useState<ModalityLevel[]>([]);
  const [modalityConfigs, setModalityConfigs] = useState<{ [key: string]: ModalityConfig }>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchLevels = async (): Promise<void> => {
      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore();
        const levelsRef = doc(db, "globalSettings", "levels");
        const levelsSnap = await getDoc(levelsRef);
        
        if (levelsSnap.exists()) {
          const data = levelsSnap.data();
          
          if (data.modalitiesLevel) {
            const modalitiesData = data.modalitiesLevel;
            
            // Verificar el formato mirando el primer valor
            const firstKey = Object.keys(modalitiesData)[0];
            const firstValue = modalitiesData[firstKey];
            
            if (typeof firstValue === 'string') {
              // 📜 Formato antiguo: { "0": "Seriado", "1": "Individual", ... }
              console.log("📜 Detectado formato simple de modalidades");
              
              const modalityNames: ModalityLevel[] = [];
              Object.values(modalitiesData).forEach(name => {
                if (typeof name === 'string') {
                  modalityNames.push(name as ModalityLevel);
                }
              });
              
              setLevels(modalityNames);
              setModalityConfigs({}); // No hay configuraciones adicionales
              
            } else if (typeof firstValue === 'object' && firstValue !== null && 'name' in firstValue) {
              
              const modalityNames: ModalityLevel[] = [];
              const configsMap: { [key: string]: ModalityConfig } = {};
              
              Object.values(modalitiesData).forEach(configData => {
                if (configData && typeof configData === 'object' && 'name' in configData) {
                  const config = configData as any; // Firebase data
                  
                  // Convertir a ModalityConfig con tipos correctos
                  const modalityConfig: ModalityConfig = {
                    name: config.name,
                    couple: Boolean(config.couple),
                    phases: Array.isArray(config.phases) 
                      ? config.phases.filter((phase: any) => 
                          // 🔥 CAMBIO: Usar valores correctos del enum de eventType
                          ['Eliminatoria', 'Semifinal', 'Final'].includes(phase)
                        ).map((phase: string) => phase as CompetitionPhase)
                      : [CompetitionPhase.ELIMINATORIA, CompetitionPhase.SEMIFINAL, CompetitionPhase.FINAL],
                    genderSeparated: Boolean(config.genderSeparated)
                  };
                  
                  modalityNames.push(config.name as ModalityLevel);
                  configsMap[config.name] = modalityConfig;
                }
              });
              
              setLevels(modalityNames);
              setModalityConfigs(configsMap);
              
            } else {
              throw new Error("Formato de modalitiesLevel no reconocido en Firebase");
            }
          } else {
            throw new Error("Campo modalitiesLevel no encontrado en el documento");
          }
        } else {
          throw new Error("Documento levels no encontrado en globalSettings");
        }
        
      } catch (err) {
        console.error("❌ Error al cargar modalidades desde Firebase:", err);
        setError(err instanceof Error ? err : new Error('Error desconocido'));
        
        // En caso de error, dejar arrays vacíos
        setLevels([]);
        setModalityConfigs({});
        
      } finally {
        setLoading(false);
      }
    };
    
    fetchLevels();
  }, []);
  
  // 🎯 Funciones auxiliares
  const getModalityConfig = (modality: ModalityLevel): ModalityConfig | null => {
    return modalityConfigs[modality] || null;
  };
  
  const isCouple = (modality: ModalityLevel): boolean => {
    const config = modalityConfigs[modality];
    if (config) {
      return config.couple;
    }
    
    // Fallback basado en el nombre si no hay configuración
    return !["Seriado", "Individual"].includes(modality);
  };
  
  const getPhases = (modality: ModalityLevel): CompetitionPhase[] => {
    const config = modalityConfigs[modality];
    if (config && config.phases && config.phases.length > 0) {
      return config.phases;
    }
    
    // 🔥 CAMBIO: Fallback con valores correctos del enum de eventType
    if (modality === "Seriado") {
      return [CompetitionPhase.FINAL]; // "Final"
    }
    return [CompetitionPhase.ELIMINATORIA, CompetitionPhase.SEMIFINAL, CompetitionPhase.FINAL]; // "Eliminatoria", "Semifinal", "Final"
  };
  
  const isGenderSeparated = (modality: ModalityLevel): boolean => {
    const config = modalityConfigs[modality];
    if (config) {
      return config.genderSeparated;
    }
    
    // Fallback basado en el nombre si no hay configuración
    return ["Seriado", "Individual"].includes(modality);
  };
  
  return { 
    levels, 
    modalitiesLevel: levels, // Alias para compatibilidad
    modalityConfigs,
    loading, 
    error,
    // Funciones auxiliares
    getModalityConfig,
    isCouple,
    getPhases,
    isGenderSeparated
  };
}