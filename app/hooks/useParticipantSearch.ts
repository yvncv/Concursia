// hooks/useParticipantSearch.ts
import { useState, useCallback, useRef } from "react";
import { getFirestore, collection, query, where, getDocs, Timestamp } from "firebase/firestore";
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
    if (!dni.trim()) {
      setSearchError("Ingrese un DNI válido");
      return null;
    }
    
    // Normalizar DNI
    const normalizedDNI = dni.trim().padStart(8, '0');
    
    // Verificar que no sea el mismo que otro participante ya buscado
    if (otherParticipantDni && normalizedDNI === otherParticipantDni.trim().padStart(8, '0')) {
      setSearchError("No puede ser el mismo participante");
      return null;
    }
    
    // Verificar caché para evitar búsquedas innecesarias
    if (participantsCache.current.has(normalizedDNI)) {
      const cachedData = participantsCache.current.get(normalizedDNI)!;
      setParticipantInfo(cachedData);
      return cachedData;
    }
    
    setIsSearching(true);
    setSearchError("");
    setParticipantInfo(null);
    
    try {
      const db = getFirestore();
      const usersCollection = collection(db, "users");
      const q = query(usersCollection, where("dni", "==", normalizedDNI));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        setSearchError("No se encontró ningún usuario con este DNI");
        return null;
      }
      
      const userData = snapshot.docs[0].data() as Participante;
      userData.id = snapshot.docs[0].id;
      
      // Guardar en caché para futuras búsquedas
      participantsCache.current.set(normalizedDNI, userData);
      
      setParticipantInfo(userData);
      return userData;
    } catch (error) {
      console.error("Error al buscar participante:", error);
      setSearchError("Error al buscar usuario");
      return null;
    } finally {
      setIsSearching(false);
    }
  }, []);
  
  const clearParticipant = useCallback((): void => {
    setParticipantInfo(null);
    setSearchError("");
  }, []);
  
  return {
    isSearching,
    searchError,
    participantInfo,
    searchParticipant,
    clearParticipant
  };
}