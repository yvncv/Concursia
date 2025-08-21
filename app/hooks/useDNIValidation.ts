// app/hooks/useDNIValidation.ts
import { useState, useCallback } from "react";
import axios from "axios";
import { findUserByHashedDni } from "../utils/security/dni/findUserByHashedDni";

interface ApiData {
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  location: {
    department: string;
    province: string;
    district: string;
    ubigeo?: string;
  };
}

interface UseDNIValidationOptions {
  type: 'participant' | 'guardian';
  participantDNI?: string; // Solo requerido cuando type es 'guardian'
}

interface UseDNIValidationReturn {
  // Estados
  dni: string;
  loading: boolean;
  error: string;
  existsError: string;
  apiData: ApiData | null;
  isValidated: boolean;
  validationError: string;
  consultedDNI: string;
  
  // Nuevos estados para reintentos y modo manual
  retryCount: number;
  isManualMode: boolean;
  canEnableManualMode: boolean;
  
  // Funciones
  setDni: (dni: string) => void;
  searchDNI: () => Promise<void>;
  validateIdentity: (firstName: string, lastName: string) => void;
  cleanDNI: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  enableManualMode: () => void;
  resetRetries: () => void;
}

export const useDNIValidation = (options: UseDNIValidationOptions): UseDNIValidationReturn => {
  const { type, participantDNI } = options;
  
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existsError, setExistsError] = useState("");
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [consultedDNI, setConsultedDNI] = useState("");
  
  // Nuevos estados para el sistema de reintentos
  const [retryCount, setRetryCount] = useState(0);
  const [isManualMode, setIsManualMode] = useState(false);
  const [canEnableManualMode, setCanEnableManualMode] = useState(false);

  // Capitalizar texto para ubicaciones
  const capitalizeLocation = (text: string): string => {
    if (!text) return '';

    const nonCapitalizedWords = [
      'de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 
      'al', 'con', 'en', 'por', 'para', 'sin', 'sobre', 'bajo'
    ];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !nonCapitalizedWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Validar restricciones específicas según el tipo
  const validateRestrictions = async (dniToValidate: string): Promise<boolean> => {
    if (type === 'participant') {
      // Para participantes: verificar que no esté registrado como usuario
      const dniExists = await findUserByHashedDni(dniToValidate);
      if (dniExists) {
        setExistsError(
          "Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión."
        );
        return false;
      }
    } else if (type === 'guardian') {
      // Para apoderados: verificar que no sea el mismo DNI del menor
      if (participantDNI && dniToValidate === participantDNI) {
        setExistsError(
          "El apoderado no puede tener el mismo DNI que el participante."
        );
        return false;
      }
      // No verificamos otras restricciones - el apoderado puede ser usuario existente
      // y puede ser apoderado de múltiples menores
    }
    
    return true;
  };

  // Consultar datos en RENIEC con sistema de reintentos
  const fetchReniecData = async (dniToSearch: string): Promise<void> => {
    setLoading(true);
    // Solo limpiar errores, no el retryCount
    setError("");
    setExistsError("");
    setIsValidated(false);
    setValidationError("");

    try {
      // Validar restricciones específicas según el tipo
      const isValid = await validateRestrictions(dniToSearch);
      if (!isValid) {
        setLoading(false);
        return;
      }

      // Consultar RENIEC
      const response = await axios.post(
        "https://api.consultasperu.com/api/v1/query",
        {
          token: "24068bb2bf38ddc53748557196cf438c54f6d7b227623c99dbad83599d70b505",
          type_document: "dni",
          document_number: dniToSearch,
        }
      );

      if (response.data.success && response.data.data) {
        // Capitalizar ubicaciones antes de guardar
        const capitalizedLocation = {
          department: capitalizeLocation(response.data.data.department || ""),
          province: capitalizeLocation(response.data.data.province || ""),
          district: capitalizeLocation(response.data.data.district || ""),
          ubigeo: response.data.data.ubigeo || "",
        };
        
        setApiData({
          firstName: response.data.data.full_name
            .split(",")[1]
            .trim()
            .toUpperCase(),
          lastName: response.data.data.full_name
            .split(",")[0]
            .trim()
            .toUpperCase(),
          birthDate: response.data.data.date_of_birth || "",
          gender: response.data.data.gender,
          location: capitalizedLocation
        });
        setConsultedDNI(dniToSearch);
        // Resetear contadores en caso de éxito
        setRetryCount(0);
        setCanEnableManualMode(false);
      } else {
        // Manejar el caso de DNI no encontrado
        handleDNINotFound();
      }
    } catch (error) {
      console.error(`Error al consultar DNI ${type}:`, error);
      handleDNINotFound();
    } finally {
      setLoading(false);
    }
  };

  // Manejar caso de DNI no encontrado con sistema de reintentos
  const handleDNINotFound = (): void => {
    setRetryCount(prevCount => {
      const newRetryCount = prevCount + 1;
      
      const entityName = type === 'participant' ? 'participante' : 'apoderado';
      
      if (newRetryCount >= 2) {
        setError(`No se encontró el DNI del ${entityName} después de varios intentos.`);
        setCanEnableManualMode(true);
      } else {
        setError(`No se encontró el DNI del ${entityName}. Intento ${newRetryCount} de 2.`);
      }
      
      return newRetryCount;
    });
    
    setApiData(null);
    setConsultedDNI("");
  };

  // Buscar DNI (función pública)
  const searchDNI = useCallback(async (): Promise<void> => {
    if (dni.length === 8) {
      await fetchReniecData(dni);
    } else {
      const entityName = type === 'participant' ? 'participante' : 'apoderado';
      setError(`El DNI del ${entityName} debe tener 8 dígitos.`);
    }
  }, [dni, type]);

  // Habilitar modo manual
  const enableManualMode = useCallback((): void => {
    setIsManualMode(true);
    setApiData({
      firstName: "",
      lastName: "",
      birthDate: "",
      gender: "",
      location: {
        department: "",
        province: "",
        district: "",
        ubigeo: "",
      }
    });
    setConsultedDNI(dni);
    setError("");
    setCanEnableManualMode(false);
  }, [dni]);

  // Resetear reintentos
  const resetRetries = useCallback((): void => {
    setRetryCount(0);
    setCanEnableManualMode(false);
    setIsManualMode(false);
  }, []);

  // Validar identidad comparando datos ingresados vs RENIEC (o modo manual)
  const validateIdentity = useCallback((firstName: string, lastName: string): void => {
    if (!apiData) {
      const entityName = type === 'participant' ? 'tu' : 'del apoderado';
      setValidationError(`Por favor, ingresa primero ${entityName} DNI para validar los datos.`);
      return;
    }

    if (dni !== consultedDNI) {
      setIsValidated(false);
      setValidationError("El DNI ingresado ha sido modificado. Vuelve a consultar los datos.");
      return;
    }

    // En modo manual, solo verificar que los campos no estén vacíos
    if (isManualMode) {
      if (firstName.trim() && lastName.trim()) {
        setIsValidated(true);
        setValidationError("");
      } else {
        const entityName = type === 'participant' ? 'tu nombre y apellido' : 'el nombre y apellido del apoderado';
        setIsValidated(false);
        setValidationError(`Por favor, ingresa ${entityName} completos.`);
      }
      return;
    }

    // Validación normal con datos de RENIEC
    const userFirstName = firstName.trim().toUpperCase();
    const userLastName = lastName.trim().toUpperCase();

    if (userFirstName === apiData.firstName && userLastName === apiData.lastName) {
      setIsValidated(true);
      setValidationError("");
    } else {
      setIsValidated(false);
      const entityName = type === 'participant' ? 'Los datos ingresados' : 'Los datos del apoderado';
      setValidationError(`${entityName} no coinciden con los registrados en RENIEC.`);
    }
  }, [apiData, dni, consultedDNI, isManualMode, type]);

  // Limpiar todos los datos
  const cleanDNI = useCallback((): void => {
    setDni("");
    setApiData(null);
    setIsValidated(false);
    setConsultedDNI("");
    setError("");
    setExistsError("");
    setValidationError("");
    setRetryCount(0);
    setCanEnableManualMode(false);
    setIsManualMode(false);
  }, []);

  // Manejar Enter en el input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchDNI();
    }
  }, [searchDNI]);

  return {
    // Estados originales
    dni,
    loading,
    error,
    existsError,
    apiData,
    isValidated,
    validationError,
    consultedDNI,
    
    // Nuevos estados
    retryCount,
    isManualMode,
    canEnableManualMode,
    
    // Funciones originales
    setDni,
    searchDNI,
    validateIdentity,
    cleanDNI,
    handleKeyPress,
    
    // Nuevas funciones
    enableManualMode,
    resetRetries,
  };
};