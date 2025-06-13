// app/register/hooks/useDNIValidation.ts
import { useState, useCallback } from "react";
import axios from "axios";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

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
  
  // Funciones
  setDni: (dni: string) => void;
  searchDNI: () => Promise<void>;
  validateIdentity: (firstName: string, lastName: string) => void;
  cleanDNI: () => void;
  handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>) => void;
}

export const useDNIValidation = (): UseDNIValidationReturn => {
  const [dni, setDni] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [existsError, setExistsError] = useState("");
  const [apiData, setApiData] = useState<ApiData | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState("");
  const [consultedDNI, setConsultedDNI] = useState("");

  // Capitalizar texto para ubicaciones
  const capitalizeLocation = (text: string): string => {
    if (!text) return '';

    // Palabras que no se capitalizan (artículos, preposiciones, conjunciones)
    const nonCapitalizedWords = [
      'de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u', 
      'al', 'con', 'en', 'por', 'para', 'sin', 'sobre', 'bajo'
    ];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Siempre capitalizar la primera palabra
        if (index === 0 || !nonCapitalizedWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };
  const checkDniExistsInFirestore = async (dniToCheck: string): Promise<boolean> => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("dni", "==", dniToCheck));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error al verificar DNI:", error);
      return false;
    }
  };

  // Consultar datos en RENIEC
  const fetchReniecData = async (dniToSearch: string): Promise<void> => {
    setLoading(true);
    setError("");
    setExistsError("");
    setIsValidated(false);
    setValidationError("");

    try {
      // Verificar si DNI ya existe
      const dniExists = await checkDniExistsInFirestore(dniToSearch);
      if (dniExists) {
        setExistsError(
          "Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión."
        );
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
      } else {
        setApiData(null);
        setConsultedDNI("");
        setError("No se encontró el DNI.");
      }
    } catch (error) {
      console.error("Error al consultar DNI:", error);
      setError("Error al consultar el DNI.");
    } finally {
      setLoading(false);
    }
  };

  // Buscar DNI (función pública)
  const searchDNI = useCallback(async (): Promise<void> => {
    if (dni.length === 8) {
      await fetchReniecData(dni);
    } else {
      setError("El DNI debe tener 8 dígitos.");
    }
  }, [dni]);

  // Validar identidad comparando datos ingresados vs RENIEC
  const validateIdentity = useCallback((firstName: string, lastName: string): void => {
    if (!apiData) {
      setValidationError("Por favor, ingresa primero tu DNI para validar tus datos.");
      return;
    }

    if (dni !== consultedDNI) {
      setIsValidated(false);
      setValidationError("El DNI ingresado ha sido modificado. Vuelve a consultar los datos.");
      return;
    }

    const userFirstName = firstName.trim().toUpperCase();
    const userLastName = lastName.trim().toUpperCase();

    if (userFirstName === apiData.firstName && userLastName === apiData.lastName) {
      setIsValidated(true);
      setValidationError("");
    } else {
      setIsValidated(false);
      setValidationError("Los datos ingresados no coinciden con los registrados en RENIEC.");
    }
  }, [apiData, dni, consultedDNI]);

  // Limpiar todos los datos
  const cleanDNI = useCallback((): void => {
    setDni("");
    setApiData(null);
    setIsValidated(false);
    setConsultedDNI("");
    setError("");
    setExistsError("");
    setValidationError("");
  }, []);

  // Manejar Enter en el input
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") {
      e.preventDefault();
      searchDNI();
    }
  }, [searchDNI]);

  return {
    // Estados
    dni,
    loading,
    error,
    existsError,
    apiData,
    isValidated,
    validationError,
    consultedDNI,
    
    // Funciones
    setDni,
    searchDNI,
    validateIdentity,
    cleanDNI,
    handleKeyPress,
  };
};