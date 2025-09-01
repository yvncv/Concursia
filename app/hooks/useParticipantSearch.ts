// hooks/useParticipantSearch.ts
import { useState, useCallback, useRef } from "react";
import { Timestamp } from "firebase/firestore";
import { findUserByHashedDni } from "@/app/utils/security/dni/findUserByHashedDni";
import { CategoryLevel, AgeCategory } from "../types/categoriesType";
import { determineCategory } from "@/app/utils/category/determineCategory";
import { useGlobalCategories } from "./useGlobalCategories";

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
  searchParticipant: (
    dni: string, 
    otherParticipantDni?: string, 
    referenceDate?: Date
  ) => Promise<Participante | null>;
  clearParticipant: () => void;
  clearCache: () => void;
  categoriesLoading: boolean;
  categoriesError: Error | null;
}

export function useParticipantSearch(): ParticipantSearchResult {
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string>("");
  const [participantInfo, setParticipantInfo] = useState<Participante | null>(null);
  
  // Usar el hook de categorías existente
  const { categorias, loading: categoriesLoading, error: categoriesError } = useGlobalCategories();
  
  // Usar useRef para mantener el caché entre renderizados
  const participantsCache = useRef<Map<string, Participante>>(new Map());
  
  const searchParticipant = useCallback(async (
    dni: string, 
    otherParticipantDni: string = "",
    referenceDate: Date = new Date()
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
    
    // Verificar que se hayan cargado las categorías
    if (categoriesLoading) {
      setSearchError("Cargando categorías, espere un momento...");
      return null;
    }
    
    if (categoriesError) {
      setSearchError("Error al cargar categorías. Intente nuevamente.");
      return null;
    }
    
    if (!categorias || categorias.length === 0) {
      setSearchError("No se han cargado las categorías. Intente nuevamente.");
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
      
      // Convertir Timestamp a Date para calcular la categoría
      let birthDate: Date;
      
      // Validar que existe la fecha de nacimiento
      if (!user.birthDate) {
        setSearchError("El usuario no tiene fecha de nacimiento registrada");
        return null;
      }
      
      // Convertir Timestamp a Date
      try {
        birthDate = user.birthDate.toDate();
        
        // Validar que la fecha sea válida
        if (isNaN(birthDate.getTime())) {
          throw new Error("Fecha inválida");
        }
      } catch (error) {
        console.error("Error al procesar fecha de nacimiento:", error);
        setSearchError("Fecha de nacimiento inválida");
        return null;
      }
      
      // Determinar la categoría basándose en la fecha de nacimiento
      const calculatedCategory = determineCategory(birthDate, referenceDate, categorias);
      
      if (!calculatedCategory) {
        setSearchError("No se pudo determinar la categoría para la edad del participante");
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
        category: calculatedCategory, // ✅ Ahora se calcula dinámicamente
        academyId: user.marinera?.academyId || undefined,
        academyName: user.marinera?.academyName || undefined,
        profileImage: typeof user.profileImage === 'string' ? user.profileImage : undefined
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
      }, [categorias, categoriesLoading, categoriesError]);
  
  const clearParticipant = useCallback((): void => {
    setParticipantInfo(null);
    setSearchError("");
  }, []);
  
  // Función para limpiar el caché
  const clearCache = useCallback((): void => {
    participantsCache.current.clear();
  }, []);
  
  return {
    isSearching,
    searchError,
    participantInfo,
    searchParticipant,
    clearParticipant,
    clearCache,
    categoriesLoading,
    categoriesError
  };
}