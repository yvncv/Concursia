// hooks/useParticipantSearch.ts
import { useState, useCallback, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import { findUserByHashedDni } from "@/app/utils/security/dni/findUserByHashedDni";
import { CategoryLevel } from "../types/categoriesType";

export interface Participante {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: Timestamp;
  gender: string;
  phoneNumber?: string[];
  category: CategoryLevel;
  academyId?: string;
  academyName?: string;
  profileImage?: string;
}

interface ParticipantSearchResult {
  isSearching: boolean;
  searchError: string;
  participantInfo: Participante | null;
  searchParticipant: (dni: string, otherParticipantDni?: string) => Promise<Participante | null>;
  clearParticipant: () => void;
}

export function useParticipantSearch(): ParticipantSearchResult {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [participantInfo, setParticipantInfo] = useState<Participante | null>(null);
  
  // Usar useRef para mantener el caché entre renderizados
  const participantsCache = useRef<Map<string, Participante>>(new Map());
  
  const searchParticipant = useCallback(async (
    dni: string, 
    otherParticipantDni: string = ""
  ): Promise<Participante | null> => {
    // Validar formato de DNI
    const sanitizedDni = dni.trim();
    
    if (!sanitizedDni) {
      setSearchError("Ingrese un DNI válido");
      return null;
    }
    
    if (!/^\d{8}$/.test(sanitizedDni)) {
      setSearchError("El DNI debe tener exactamente 8 dígitos");
      return null;
    }
    
    // Verificar que no sea el mismo que otro participante ya buscado
    if (otherParticipantDni && sanitizedDni === otherParticipantDni.trim()) {
      setSearchError("No puede ser el mismo participante");
      return null;
    }
    
    // Verificar caché para evitar búsquedas innecesarias
    if (participantsCache.current.has(sanitizedDni)) {
      const cachedData = participantsCache.current.get(sanitizedDni)!;
      setParticipantInfo(cachedData);
      setSearchError("");
      return cachedData;
    }
    
    setIsSearching(true);
    setSearchError("");
    setParticipantInfo(null);
    
    try {
      // Usar la función correcta para buscar por DNI hasheado
      const user = await findUserByHashedDni(sanitizedDni);
      
      if (!user) {
        setSearchError("No se encontró ningún usuario con este DNI");
        return null;
      }
      
      // Verificar que el usuario tenga los campos necesarios para participar
      if (!user.marinera?.participant?.category) {
        setSearchError("El usuario no tiene categoría de participante asignada");
        return null;
      }
      
      const participantData: Participante = {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        dni: user.dni, // Este viene encriptado de la DB
        birthDate: user.birthDate,
        gender: user.gender,
        phoneNumber: user.phoneNumber,
        category: user.marinera.participant.category as CategoryLevel,
        academyId: user.marinera?.academyId || undefined,
        academyName: user.marinera?.academyName || undefined,
        profileImage: typeof user.profileImage === 'string' ? user.profileImage : undefined // ✅ Manejar string y File
      };
      
      // Guardar en caché para futuras búsquedas
      participantsCache.current.set(sanitizedDni, participantData);
      
      setParticipantInfo(participantData);
      setSearchError("");
      return participantData;
      
    } catch (error) {
      console.error("Error al buscar participante:", error);
      setSearchError("Error al buscar usuario. Intente nuevamente.");
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  const clearParticipant = useCallback((): void => {
    setParticipantInfo(null);
    setSearchError("");
  }, []);
  
  // Función auxiliar para limpiar el caché si es necesario
  const clearCache = useCallback((): void => {
    participantsCache.current.clear();
  }, []);
  
  return {
    isSearching,
    searchError,
    participantInfo,
    searchParticipant,
    clearParticipant,
    // clearCache // Opcional, por si necesitas limpiar el caché
  };
}