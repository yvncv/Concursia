// app/services/startContestService.ts
import { 
  doc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  writeBatch, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config'; // Ajustar según tu configuración
import { CustomEvent } from '@/app/types/eventType';
import { Participant } from '@/app/types/participantType';
import { LiveCompetition, LiveCompetitionCreate, CompetitionPhase } from '@/app/types/liveCompetitionType';

interface ParticipantsByCategory {
  [levelId: string]: {
    [category: string]: {
      [gender: string]: Participant[];
    };
  };
}

/**
 * Determina el género del participante consultando la base de datos
 * @param participant - Participante
 * @returns Género del participante
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
    
    // Si no hay usuarios asignados (caso anómalo)
    return "Mujeres"; // Valor por defecto
    
  } catch (error) {
    return "Mujeres"; // Valor por defecto en caso de error
  }
};

/**
 * Agrupa los participantes por modalidad, categoría y género (VERSIÓN ASYNC)
 * @param participants - Array de participantes
 * @returns Objeto agrupado por modalidad, categoría y género
 */
const groupParticipantsByCategory = async (participants: Participant[]): Promise<ParticipantsByCategory> => {
  const grouped: ParticipantsByCategory = {};

  // Procesar cada participante de forma secuencial para evitar sobrecarga
  for (const participant of participants) {
    const { level, category } = participant;
    
    // Determinar el género consultando la base de datos
    const gender = await determineGender(participant);

    // Inicializar estructura si no existe
    if (!grouped[level]) {
      grouped[level] = {};
    }
    if (!grouped[level][category]) {
      grouped[level][category] = {};
    }
    if (!grouped[level][category][gender]) {
      grouped[level][category][gender] = [];
    }

    // Agregar participante al grupo
    grouped[level][category][gender].push(participant);
  }

  return grouped;
};

/**
 * Crea los documentos LiveCompetition para cada combinación
 * @param eventId - ID del evento
 * @param participantsByCategory - Participantes agrupados
 * @param event - Datos del evento (para obtener configuración)
 */
const createLiveCompetitionDocuments = async (
  eventId: string, 
  participantsByCategory: ParticipantsByCategory,
  event: CustomEvent
): Promise<void> => {
  const batch = writeBatch(db);
  const liveCompetitionRef = collection(db, 'eventos', eventId, 'liveCompetition');
  let documentsCreated = 0;

  // Iterar por cada modalidad
  for (const [levelId, categories] of Object.entries(participantsByCategory)) {
    // Iterar por cada categoría
    for (const [category, genders] of Object.entries(categories)) {
      // Iterar por cada género
      for (const [gender, participants] of Object.entries(genders)) {
        // Solo crear documento si hay participantes
        if (participants.length > 0) {
          // Crear ID único para el documento
          const docId = `${levelId}_${category}_${gender}`;
          
          // Obtener configuración de la modalidad desde el evento
          const levelConfig = event?.dance?.levels?.[levelId]?.config;
          
          // Calcular total de tandas basado en la configuración
          const blocks = levelConfig?.blocks || 1;
          const tracksPerBlock = levelConfig?.tracksPerBlock || 1;
          const totalTandas = Math.ceil(participants.length / (blocks * tracksPerBlock));
          
          // Determinar fase inicial basada en el tipo de modalidad
          const currentPhase: CompetitionPhase = levelId.toLowerCase().includes('seriado') 
            ? 'Final' 
            : 'Eliminatoria';

          // Crear documento LiveCompetition
          const liveCompetitionData: LiveCompetitionCreate = {
            eventId,
            level: levelId,
            category,
            gender: gender as "Mujeres" | "Varones" | "Mixto",
            currentPhase,
            totalParticipants: participants.length,
            blocks,
            tracksPerBlock,
            totalTandas,
            currentTandaIndex: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          // Agregar al batch
          const docRef = doc(liveCompetitionRef, docId);
          batch.set(docRef, liveCompetitionData);
          documentsCreated++;
        }
      }
    }
  }

  if (documentsCreated === 0) {
    return;
  }

  try {
    // Ejecutar batch
    await batch.commit();
  } catch (error) {
    throw new Error(`Error al crear documentos LiveCompetition: ${error}`);
  }
};

/**
 * Función principal para iniciar el concurso
 * @param eventId - ID del evento a iniciar
 * @returns Promise<void>
 */
export const startContestWithEventData = async (eventId: string): Promise<void> => {
  try {
    // 1. Obtener datos del evento
    const eventRef = doc(db, 'eventos', eventId);
    const eventSnapshot = await getDoc(eventRef);
    
    if (!eventSnapshot.exists()) {
      throw new Error('Evento no encontrado');
    }

    const eventData = { id: eventSnapshot.id, ...eventSnapshot.data() } as CustomEvent;

    // 2. Verificar precondiciones
    if (eventData.status !== 'pendiente') {
      throw new Error(`El evento no está en estado pendiente. Estado actual: ${eventData.status}`);
    }

    // 3. Obtener todos los participantes del evento
    const participantsQuery = query(
      collection(db, 'participants'),
      where('eventId', '==', eventId)
    );
    const participantsSnapshot = await getDocs(participantsQuery);
    const participants = participantsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Participant[];

    if (participants.length === 0) {
      throw new Error('No hay participantes registrados en el evento');
    }

    // 4. Agrupar participantes por modalidad, categoría y género
    const participantsByCategory = await groupParticipantsByCategory(participants);

    // 5. Crear documentos LiveCompetition
    await createLiveCompetitionDocuments(eventId, participantsByCategory, eventData);

    // 6. Cambiar estado del evento
    await updateDoc(eventRef, {
      status: 'activo',
      realStartTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

  } catch (error) {
    // Si hubo error, intentar revertir cambios
    try {
      const eventRef = doc(db, 'eventos', eventId);
      await updateDoc(eventRef, {
        status: 'pendiente',
        updatedAt: serverTimestamp()
      });
    } catch (revertError) {
      // Error al revertir - el evento podría quedar inconsistente
    }
    
    throw error;
  }
};