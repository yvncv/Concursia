// app/services/competitionFlowService.ts
import { 
  doc, 
  updateDoc, 
  collection, 
  getDocs, 
  query, 
  where,
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { CustomEvent } from '@/app/types/eventType';
import { LiveCompetition } from '@/app/types/liveCompetitionType';
import { Tanda } from '@/app/types/tandaType';

/**
 * Finaliza una tanda y maneja las transiciones
 * @param eventId - ID del evento
 * @param liveCompetitionId - ID de la competencia en vivo
 * @param tandaIndex - Índice de la tanda que se finalizó
 */
export const finalizeTandaAndCheckTransitions = async (
  eventId: string,
  liveCompetitionId: string,
  tandaIndex: number
): Promise<void> => {
  try {
    // 1. Obtener la competencia actual
    const liveCompRef = doc(db, 'eventos', eventId, 'liveCompetition', liveCompetitionId);
    const liveCompSnapshot = await getDoc(liveCompRef);
    
    if (!liveCompSnapshot.exists()) {
      throw new Error('Competencia no encontrada');
    }
    
    const liveComp = { id: liveCompSnapshot.id, ...liveCompSnapshot.data() } as LiveCompetition;
    
    // CAMBIO: Solo incrementar si no hemos contado esta tanda ya
    const newCompletedTandas = Math.max(liveComp.completedTandas, tandaIndex + 1);

    // 2. Verificar si hay más tandas en esta competencia
    if (newCompletedTandas < liveComp.totalTandas) {
      // Aún hay más tandas, solo actualizar progreso
      await updateDoc(liveCompRef, {
        completedTandas: newCompletedTandas,
        currentTandaIndex: tandaIndex + 1,
        updatedAt: serverTimestamp()
      });
      
      console.log(`📊 Tanda ${tandaIndex + 1}/${liveComp.totalTandas} completada en ${liveCompetitionId}`);
      return;
    }

    // 3. Esta era la última tanda, finalizar competencia
    await updateDoc(liveCompRef, {
      status: "completed",
      isFinished: true,
      completedTandas: newCompletedTandas,
      realEndTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`✅ Competencia ${liveCompetitionId} finalizada`);

    // 4. Buscar siguiente competencia y actualizar evento
    await findNextCompetitionAndUpdateEvent(eventId, liveCompetitionId);

  } catch (error) {
    console.error('❌ Error en finalizeTandaAndCheckTransitions:', error);
    throw error;
  }
};

/**
 * Busca la siguiente competencia y actualiza el evento
 * @param eventId - ID del evento
 * @param currentCompetitionId - ID de la competencia que acaba de terminar
 */
const findNextCompetitionAndUpdateEvent = async (
  eventId: string, 
  currentCompetitionId: string
): Promise<void> => {
  try {
    // 1. Obtener evento actual
    const eventRef = doc(db, 'eventos', eventId);
    const eventSnapshot = await getDoc(eventRef);
    
    if (!eventSnapshot.exists()) {
      throw new Error('Evento no encontrado');
    }
    
    const event = { id: eventSnapshot.id, ...eventSnapshot.data() } as CustomEvent;

    // 2. Obtener todas las competencias del evento
    const liveCompetitionsRef = collection(db, 'eventos', eventId, 'liveCompetition');
    const liveCompetitionsSnapshot = await getDocs(liveCompetitionsRef);
    
    const allCompetitions = liveCompetitionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LiveCompetition[];

    // 3. Encontrar competencias pendientes (que no están completadas)
    const pendingCompetitions = allCompetitions.filter(comp => 
      comp.status === "pending" || comp.status === "active"
    );

    // 4. Actualizar lista de competencias completadas
    const updatedCompletedCompetitions = [
      ...(event.completedCompetitions || []),
      currentCompetitionId
    ];

    if (pendingCompetitions.length > 0) {
      // Hay más competencias, activar la siguiente
      const nextCompetition = pendingCompetitions[0];
      
      // Marcar siguiente competencia como activa
      const nextCompRef = doc(db, 'eventos', eventId, 'liveCompetition', nextCompetition.id);
      await updateDoc(nextCompRef, {
        status: "active",
        realStartTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Actualizar evento
      await updateDoc(eventRef, {
        currentLiveCompetitionId: nextCompetition.id,
        completedCompetitions: updatedCompletedCompetitions,
        updatedAt: serverTimestamp()
      });

      console.log(`🎯 Siguiente competencia activada: ${nextCompetition.id}`);
      console.log(`📈 Progreso: ${updatedCompletedCompetitions.length}/${allCompetitions.length} competencias completadas`);
      
    } else {
      // No hay más competencias, finalizar evento
      await updateDoc(eventRef, {
        status: 'completed',
        currentLiveCompetitionId: null,
        completedCompetitions: updatedCompletedCompetitions,
        realEndTime: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      console.log('🏆 ¡EVENTO COMPLETADO! Todas las competencias han finalizado');
    }

  } catch (error) {
    console.error('❌ Error en findNextCompetitionAndUpdateEvent:', error);
    throw error;
  }
};

/**
 * Inicia una competencia específica (marca como activa)
 * @param eventId - ID del evento
 * @param liveCompetitionId - ID de la competencia a iniciar
 */
export const startLiveCompetition = async (
  eventId: string,
  liveCompetitionId: string
): Promise<void> => {
  try {
    const liveCompRef = doc(db, 'eventos', eventId, 'liveCompetition', liveCompetitionId);
    
    await updateDoc(liveCompRef, {
      status: "active",
      realStartTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log(`🚀 Competencia ${liveCompetitionId} iniciada`);
    
  } catch (error) {
    console.error('❌ Error al iniciar competencia:', error);
    throw error;
  }
};

/**
 * Obtiene el progreso general del evento
 * @param eventId - ID del evento
 * @returns Información del progreso
 */
export const getEventProgress = async (eventId: string): Promise<{
  totalCompetitions: number;
  completedCompetitions: number;
  currentCompetition: LiveCompetition | null;
  isEventCompleted: boolean;
}> => {
  try {
    // Obtener evento
    const eventRef = doc(db, 'eventos', eventId);
    const eventSnapshot = await getDoc(eventRef);
    
    if (!eventSnapshot.exists()) {
      throw new Error('Evento no encontrado');
    }
    
    const event = { id: eventSnapshot.id, ...eventSnapshot.data() } as CustomEvent;

    // Obtener todas las competencias
    const liveCompetitionsRef = collection(db, 'eventos', eventId, 'liveCompetition');
    const liveCompetitionsSnapshot = await getDocs(liveCompetitionsRef);
    
    const allCompetitions = liveCompetitionsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as LiveCompetition[];

    // Obtener competencia actual
    let currentCompetition: LiveCompetition | null = null;
    if (event.currentLiveCompetitionId) {
      currentCompetition = allCompetitions.find(comp => 
        comp.id === event.currentLiveCompetitionId
      ) || null;
    }

    return {
      totalCompetitions: allCompetitions.length,
      completedCompetitions: (event.completedCompetitions || []).length,
      currentCompetition,
      isEventCompleted: event.status === 'completed'
    };

  } catch (error) {
    console.error('❌ Error al obtener progreso del evento:', error);
    throw error;
  }
};