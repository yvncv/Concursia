// hooks/usePullCoupleValidation.ts
import { useState, useEffect, useCallback } from "react";
import { useGlobalCategories } from "./useGlobalCategories";
import { Participante } from "./useParticipantSearch";
import { Timestamp } from "firebase/firestore";

interface PullCoupleValidation {
  allowed: boolean;
  message: string;
  diferenciaValor: number;
  categoriaFinal: string;
  esMayorParticipante: boolean;
}

interface ValidationHookResult extends PullCoupleValidation {
  isPullCoupleActive: boolean;
  activatePullCouple: (activate: boolean) => void;
  calcularEdad: (birthDate: Timestamp) => number | null;
}

interface EventSettings {
  pullCouple?: {
    enabled: boolean;
    maxLevelDifference?: number;
  };
}

export function usePullCoupleValidation(
  participanteInfo: Participante | null,
  parejaInfo: Participante | null,
  eventSettings: EventSettings | null
): ValidationHookResult {
  const [validation, setValidation] = useState<PullCoupleValidation>({
    allowed: false,
    message: "",
    diferenciaValor: 0,
    categoriaFinal: "",
    esMayorParticipante: false
  });
  
  const [isPullCoupleActive, setIsPullCoupleActive] = useState<boolean>(false);
  
  // Usar hook de Firebase en lugar del contexto
  const { categorias: categoriasPorNivel, loading } = useGlobalCategories();
  
  // Función para calcular edad
  const calcularEdad = useCallback((birthDate: Timestamp): number | null => {
    if (!birthDate) return null;
    
    const hoy = new Date();
    const fechaNac = birthDate.toDate();
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const m = hoy.getMonth() - fechaNac.getMonth();
    
    if (m < 0 || (m === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    
    return edad;
  }, []);
  
  // Lógica de validación
  useEffect(() => {
    // No ejecutar la validación si estamos cargando las categorías
    if (loading || !participanteInfo || !parejaInfo || !eventSettings?.pullCouple?.enabled) {
      setValidation({
        allowed: false,
        message: "",
        diferenciaValor: 0,
        categoriaFinal: "",
        esMayorParticipante: false
      });
      return;
    }
    
    try {
      // Crear array de nombres de categorías para la comparación
      const nombresCategorias = categoriasPorNivel.map(cat => cat.name);
      
      // Obtener índices en la escala de categorías usando los nombres
      const indexParticipante = nombresCategorias.indexOf(participanteInfo.category as any);
      const indexPareja = nombresCategorias.indexOf(parejaInfo.category as any);
      
      if (indexParticipante === -1 || indexPareja === -1) {
        setValidation({
          allowed: false,
          message: "Una de las categorías no es válida",
          diferenciaValor: 0,
          categoriaFinal: "",
          esMayorParticipante: false
        });
        return;
      }
      
      // Calcular diferencia de categorías
      const diferencia = Math.abs(indexParticipante - indexPareja);
      const maxDiferencia = eventSettings.pullCouple.maxLevelDifference || 1;
      
      // Determinar quién tiene mayor nivel
      const esMayorParticipante = indexParticipante > indexPareja;
      
      // Validar la diferencia y determinar categoría final
      if (diferencia > 0) {
        if (diferencia <= maxDiferencia) {
          // Se permite jalar pareja
          const categoriaFinal = esMayorParticipante
            ? participanteInfo.category
            : parejaInfo.category;
          
          setValidation({
            allowed: true,
            message: `Se puede aplicar "Jalar Pareja". Se usará la categoría ${categoriaFinal}.`,
            diferenciaValor: diferencia,
            categoriaFinal,
            esMayorParticipante
          });
        } else {
          // Diferencia demasiado grande
          setValidation({
            allowed: false,
            message: `La diferencia de niveles (${diferencia}) excede el máximo permitido (${maxDiferencia}).`,
            diferenciaValor: diferencia,
            categoriaFinal: "",
            esMayorParticipante
          });
        }
      } else {
        // Misma categoría, no es necesario jalar
        setValidation({
          allowed: false,
          message: "Ambos participantes tienen la misma categoría. No es necesario jalar pareja.",
          diferenciaValor: 0,
          categoriaFinal: participanteInfo.category,
          esMayorParticipante: false
        });
      }
    } catch (error) {
      console.error("Error en validación de jalar pareja:", error);
      setValidation({
        allowed: false,
        message: "Error al validar las categorías.",
        diferenciaValor: 0,
        categoriaFinal: "",
        esMayorParticipante: false
      });
    }
  }, [participanteInfo, parejaInfo, eventSettings, categoriasPorNivel, loading]);
  
  const activatePullCouple = useCallback((activate: boolean): void => {
    setIsPullCoupleActive(activate && validation.allowed && validation.diferenciaValor > 0);
  }, [validation]);
  
  return {
    ...validation,
    isPullCoupleActive,
    activatePullCouple,
    calcularEdad
  };
}