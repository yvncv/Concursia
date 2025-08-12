// hooks/useEventParticipants.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Participant } from '../types/participantType';

// Interfaz para las estadísticas calculadas (ACTUALIZADA CON GÉNERO)
export interface ParticipantStats {
  [levelId: string]: {
    [category: string]: {
      [gender: string]: {
        count: number;
        participants: Participant[];
      };
    };
  };
}

// Interfaz para estadísticas por modalidad (para el gráfico)
export interface ModalityStats {
  name: string;
  count: number;
  percentage: number;
}

/**
 * Determina el género del participante consultando la base de datos
 * (Misma lógica que en startContestService)
 */
const determineGender = async (participant: Participant): Promise<"Mujeres" | "Varones" | "Mixto"> => {
  try {
    // Si es pareja (2 usuarios), es Mixto
    if (participant.usersId.length === 2) {
      return "Mixto";
    }
    
    // Para participantes individuales, obtener el género del usuario
    if (participant.usersId.length === 1) {
      const userId = participant.usersId[0];
      const userRef = doc(db, 'users', userId);
      const userSnapshot = await getDoc(userRef);
      
      if (!userSnapshot.exists()) {
        return "Mujeres"; // Valor por defecto en caso de error
      }
      
      const userData = userSnapshot.data();
      const userGender = userData.gender;
      
      // Mapear el género del usuario al formato esperado
      if (userGender === 'Masculino' || userGender === 'M' || userGender === 'Hombre' || userGender === 'Varones') {
        return "Varones";
      } else if (userGender === 'Femenino' || userGender === 'F' || userGender === 'Mujer' || userGender === 'Mujeres') {
        return "Mujeres";
      } else {
        return "Mujeres"; // Valor por defecto
      }
    }
    
    return "Mujeres"; // Valor por defecto
    
  } catch (error) {
    return "Mujeres"; // Valor por defecto en caso de error
  }
};

const useEventParticipants = (eventId: string) => {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [participantStats, setParticipantStats] = useState<ParticipantStats>({});
  const [totalParticipants, setTotalParticipants] = useState(0);
  const [modalityData, setModalityData] = useState<ModalityStats[]>([]);
  const [loadingParticipants, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchParticipants = async () => {
      if (!eventId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        
        // Consulta para obtener todos los participantes del evento
        const participantsQuery = query(
          collection(db, "participants"),
          where("eventId", "==", eventId)
        );
        
        const querySnapshot = await getDocs(participantsQuery);
        const participantsData: Participant[] = [];
        
        querySnapshot.forEach((doc) => {
          participantsData.push({
            id: doc.id,
            ...doc.data()
          } as Participant);
        });

        setParticipants(participantsData);
        
        // Calcular estadísticas (AHORA CON GÉNERO)
        const stats = await calculateParticipantStats(participantsData);
        setParticipantStats(stats);
        
        // Calcular total de participantes
        const total = participantsData.length;
        setTotalParticipants(total);
        
        // Calcular datos para modalidades (gráfico circular)
        const modalities = calculateModalityData(stats, total);
        setModalityData(modalities);
        
      } catch (err) {
        console.error("Error fetching participants:", err);
        setError("Failed to fetch participants");
      } finally {
        setLoading(false);
      }
    };

    fetchParticipants();
  }, [eventId]);

  // Función para calcular estadísticas por nivel, categoría Y GÉNERO
  const calculateParticipantStats = async (participantsData: Participant[]): Promise<ParticipantStats> => {
    const stats: ParticipantStats = {};
    
    // Procesar cada participante de forma secuencial para evitar sobrecarga
    for (const participant of participantsData) {
      const { level, category } = participant;
      
      // Determinar el género consultando la base de datos
      const gender = await determineGender(participant);
      
      // Inicializar estructura si no existe
      if (!stats[level]) {
        stats[level] = {};
      }
      if (!stats[level][category]) {
        stats[level][category] = {};
      }
      if (!stats[level][category][gender]) {
        stats[level][category][gender] = {
          count: 0,
          participants: []
        };
      }
      
      // Agregar participante al grupo correcto
      stats[level][category][gender].count++;
      stats[level][category][gender].participants.push(participant);
    }
    
    return stats;
  };
  

  // Función para calcular datos de modalidades para el gráfico
  const calculateModalityData = (stats: ParticipantStats, total: number): ModalityStats[] => {
    const modalityData: ModalityStats[] = [];
    
    Object.keys(stats).forEach(levelId => {
      const levelParticipants = Object.values(stats[levelId]).reduce((sum, categoryData) => {
        return sum + Object.values(categoryData).reduce((catSum, genderData) => catSum + genderData.count, 0);
      }, 0);
      
      const percentage = total > 0 ? (levelParticipants / total) * 100 : 0;
      
      modalityData.push({
        name: levelId,
        count: levelParticipants,
        percentage: Math.round(percentage) || 0
      });
    });
    
    return modalityData;
  };

  // Función helper para obtener participantes de una categoría específica (SIN GÉNERO)
  const getParticipantsByCategory = (level: string, category: string): Participant[] => {
    const categoryData = participantStats[level]?.[category];
    if (!categoryData) return [];
    
    // Combinar participantes de todos los géneros
    const allParticipants: Participant[] = [];
    Object.values(categoryData).forEach(genderData => {
      allParticipants.push(...genderData.participants);
    });
    
    return allParticipants;
  };

  // Función helper para obtener el conteo de una categoría específica (SIN GÉNERO)
  const getParticipantCount = (level: string, category: string): number => {
    const categoryData = participantStats[level]?.[category];
    if (!categoryData) return 0;
    
    // Sumar participantes de todos los géneros
    return Object.values(categoryData).reduce((sum, genderData) => sum + genderData.count, 0);
  };

  // NUEVAS funciones helper para obtener datos POR GÉNERO
  const getParticipantsByGender = (level: string, category: string, gender: string): Participant[] => {
    return participantStats[level]?.[category]?.[gender]?.participants || [];
  };

  const getParticipantCountByGender = (level: string, category: string, gender: string): number => {
    return participantStats[level]?.[category]?.[gender]?.count || 0;
  };

  // Función helper para obtener todos los niveles únicos
  const getUniqueLevels = (): string[] => {
    return Object.keys(participantStats);
  };

  // Función helper para obtener géneros únicos de una categoría
  const getGendersInCategory = (level: string, category: string): string[] => {
    return Object.keys(participantStats[level]?.[category] || {});
  };

  return {
    participants,
    participantStats,
    totalParticipants,
    modalityData,
    loadingParticipants,
    error,
    // Helper functions originales (sin género)
    getParticipantsByCategory,
    getParticipantCount,
    getUniqueLevels,
    // Nuevas helper functions (con género)
    getParticipantsByGender,
    getParticipantCountByGender,
    getGendersInCategory
  };
};

export default useEventParticipants;