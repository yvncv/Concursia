// app/hooks/useEventProgress.tsx
import { useState, useEffect } from 'react';
import { doc, onSnapshot, collection } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { CustomEvent } from '@/app/types/eventType';
import { LiveCompetition } from '@/app/types/liveCompetitionType';

interface EventProgressData {
  event: CustomEvent | null;
  allCompetitions: LiveCompetition[];
  currentCompetition: LiveCompetition | null;
  totalCompetitions: number;
  completedCompetitions: number;
  pendingCompetitions: number;
  isEventCompleted: boolean;
  progressPercentage: number;
  loading: boolean;
  error: string | null;
}

export const useEventProgress = (eventId: string): EventProgressData => {
  const [event, setEvent] = useState<CustomEvent | null>(null);
  const [allCompetitions, setAllCompetitions] = useState<LiveCompetition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Suscripción en tiempo real al evento
  useEffect(() => {
    if (!eventId) return;

    const eventRef = doc(db, 'eventos', eventId);
    
    const unsubscribeEvent = onSnapshot(
      eventRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const eventData = { id: docSnap.id, ...docSnap.data() } as CustomEvent;
          setEvent(eventData);
          setError(null);
        } else {
          setError('Evento no encontrado');
          setEvent(null);
        }
      },
      (err) => {
        console.error('Error al escuchar evento:', err);
        setError('Error al cargar el evento');
      }
    );

    return unsubscribeEvent;
  }, [eventId]);

  // Suscripción en tiempo real a las competencias
  useEffect(() => {
    if (!eventId) return;

    const competitionsRef = collection(db, 'eventos', eventId, 'liveCompetition');
    
    const unsubscribeCompetitions = onSnapshot(
      competitionsRef,
      (querySnapshot) => {
        const competitions = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as LiveCompetition[];
        
        setAllCompetitions(competitions);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error('Error al escuchar competencias:', err);
        setError('Error al cargar las competencias');
        setLoading(false);
      }
    );

    return unsubscribeCompetitions;
  }, [eventId]);

  // Calcular datos derivados
  const currentCompetition = event?.currentLiveCompetitionId 
    ? allCompetitions.find(comp => comp.id === event.currentLiveCompetitionId) || null
    : null;

  const completedCompetitions = (event?.completedCompetitions || []).length;
  const totalCompetitions = allCompetitions.length;
  const pendingCompetitions = allCompetitions.filter(comp => 
    comp.status === 'pending' || comp.status === 'active'
  ).length;
  
  const isEventCompleted = event?.status === 'completed' || 
    (totalCompetitions > 0 && completedCompetitions === totalCompetitions);
  
  const progressPercentage = totalCompetitions > 0 
    ? (completedCompetitions / totalCompetitions) * 100 
    : 0;

  return {
    event,
    allCompetitions,
    currentCompetition,
    totalCompetitions,
    completedCompetitions,
    pendingCompetitions,
    isEventCompleted,
    progressPercentage,
    loading,
    error
  };
};