import { useEffect, useRef } from "react";
import { Timestamp, DocumentData } from "firebase/firestore";

// Definición de tipos
interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: Timestamp;
  gender: string;
  phoneNumber?: string[];
  category: string;
  [key: string]: any;
}

interface ValidationResult {
  allowed: boolean;
  message: string;
  diferenciaValor: number;
  categoriaFinal: string;
  esMayorParticipante: boolean;
}

interface PullCoupleValidatorProps {
  participanteInfo: Participant;
  parejaInfo: Participant;
  eventSettings: DocumentData;
  categoriasPorNivel: string[];
  calcularEdad: (birthDate: Timestamp) => number | null;
  onValidationResult: (result: ValidationResult) => void;
}

const PullCoupleValidator: React.FC<PullCoupleValidatorProps> = ({
  participanteInfo,
  parejaInfo,
  eventSettings,
  categoriasPorNivel,
  calcularEdad,
  onValidationResult
}) => {
  const previousResult = useRef<ValidationResult | null>(null);

  useEffect(() => {
    if (!eventSettings?.pullCouple?.enabled) return;

    const criteria = eventSettings.pullCouple.criteria || "Category";
    const maxDifference = eventSettings.pullCouple.difference || 0;

    let allowed = false;
    let message = "";
    let diferenciaValor = 0;
    let categoriaFinal = "";
    let esMayorParticipante = false;

    if (criteria === "Category") {
      const indexParticipante = categoriasPorNivel.indexOf(participanteInfo.category);
      const indexPareja = categoriasPorNivel.indexOf(parejaInfo.category);

      if (indexParticipante === -1 || indexPareja === -1) {
        const result: ValidationResult = {
          allowed: false,
          message: "Una o ambas categorías no están en la lista permitida.",
          diferenciaValor: 0,
          categoriaFinal: "",
          esMayorParticipante: false
        };
        if (JSON.stringify(previousResult.current) !== JSON.stringify(result)) {
          previousResult.current = result;
          onValidationResult(result);
        }
        return;
      }

      diferenciaValor = Math.abs(indexParticipante - indexPareja);
      esMayorParticipante = indexParticipante > indexPareja;

      if (diferenciaValor > 0 && diferenciaValor <= maxDifference) {
        allowed = true;
        categoriaFinal = esMayorParticipante ? participanteInfo.category : parejaInfo.category;
        message = `Se puede jalar pareja. La diferencia de ${diferenciaValor} ${diferenciaValor === 1 ? 'nivel' : 'niveles'} está dentro del límite permitido (${maxDifference}).`;
      } else if (diferenciaValor > maxDifference) {
        allowed = false;
        message = `No se puede jalar pareja. La diferencia de ${diferenciaValor} ${diferenciaValor === 1 ? 'nivel' : 'niveles'} supera el límite permitido (${maxDifference}).`;
      } else {
        allowed = false;
        message = "Ambos participantes tienen la misma categoría, no es necesario jalar pareja.";
      }
    } else if (criteria === "Age") {
      const edadParticipante = calcularEdad(participanteInfo.birthDate);
      const edadPareja = calcularEdad(parejaInfo.birthDate);

      if (edadParticipante === null || edadPareja === null) {
        const result: ValidationResult = {
          allowed: false,
          message: "No se pudo calcular la edad de uno o ambos participantes.",
          diferenciaValor: 0,
          categoriaFinal: "",
          esMayorParticipante: false
        };
        if (JSON.stringify(previousResult.current) !== JSON.stringify(result)) {
          previousResult.current = result;
          onValidationResult(result);
        }
        return;
      }

      diferenciaValor = Math.abs(edadParticipante - edadPareja);
      esMayorParticipante = edadParticipante > edadPareja;

      if (diferenciaValor > 0 && diferenciaValor <= maxDifference) {
        allowed = true;
        categoriaFinal = esMayorParticipante ? participanteInfo.category : parejaInfo.category;
        message = `Se puede jalar pareja. La diferencia de ${diferenciaValor} ${diferenciaValor === 1 ? 'año' : 'años'} está dentro del límite permitido (${maxDifference}).`;
      } else if (diferenciaValor > maxDifference) {
        allowed = false;
        message = `No se puede jalar pareja. La diferencia de ${diferenciaValor} ${diferenciaValor === 1 ? 'año' : 'años'} supera el límite permitido (${maxDifference}).`;
      } else {
        allowed = false;
        message = "Ambos participantes tienen la misma edad, no es necesario jalar pareja.";
      }
    }

    const result: ValidationResult = {
      allowed,
      message,
      diferenciaValor,
      categoriaFinal,
      esMayorParticipante
    };

    // Solo llama a onValidationResult si realmente cambió el resultado
    if (JSON.stringify(previousResult.current) !== JSON.stringify(result)) {
      previousResult.current = result;
      onValidationResult(result);
    }
  }, [participanteInfo, parejaInfo, eventSettings, categoriasPorNivel, calcularEdad, onValidationResult]);

  return null;
};

export default PullCoupleValidator;
