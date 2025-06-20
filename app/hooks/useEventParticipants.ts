// hooks/useEventParticipants.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { Participant } from '../types/participantType';

// Interfaz para las estadísticas calculadas
export interface ParticipantStats {
  [levelId: string]: {
    [category: string]: {
      count: number;
      participants: Participant[];
    };
  };
}

// Interfaz para estadísticas por modalidad (para el gráfico)
export interface ModalityStats {
  name: string;
  count: number;
  percentage: number;
}

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
        
        // Calcular estadísticas
        const stats = calculateParticipantStats(participantsData);
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

  // Función para calcular estadísticas por nivel y categoría
  const calculateParticipantStats = (participantsData: Participant[]): ParticipantStats => {
    const stats: ParticipantStats = {};
    
    participantsData.forEach(participant => {
      const { level, category } = participant;
      
      if (!stats[level]) {
        stats[level] = {};
      }
      
      if (!stats[level][category]) {
        stats[level][category] = {
          count: 0,
          participants: []
        };
      }
      
      stats[level][category].count++;
      stats[level][category].participants.push(participant);
    });
    
    return stats;
  };

  // Función para calcular datos de modalidades para el gráfico
  const calculateModalityData = (stats: ParticipantStats, total: number): ModalityStats[] => {
    const modalityData: ModalityStats[] = [];
    
    Object.keys(stats).forEach(levelId => {
      const levelParticipants = Object.values(stats[levelId]).reduce(
        (sum, categoryData) => sum + categoryData.count, 
        0
      );
      
      const percentage = total > 0 ? (levelParticipants / total) * 100 : 0;
      
      modalityData.push({
        name: levelId,
        count: levelParticipants,
        percentage: Math.round(percentage) || 0
      });
    });
    
    return modalityData;
  };

  // Función helper para obtener participantes de una categoría específica
  const getParticipantsByCategory = (level: string, category: string): Participant[] => {
    return participantStats[level]?.[category]?.participants || [];
  };

  // Función helper para obtener el conteo de una categoría específica
  const getParticipantCount = (level: string, category: string): number => {
    return participantStats[level]?.[category]?.count || 0;
  };

  // Función helper para obtener todos los niveles únicos
  const getUniqueLevels = (): string[] => {
    return Object.keys(participantStats);
  };

  return {
    participants,
    participantStats,
    totalParticipants,
    modalityData,
    loadingParticipants,
    error,
    // Helper functions
    getParticipantsByCategory,
    getParticipantCount,
    getUniqueLevels
  };
};

export default useEventParticipants;