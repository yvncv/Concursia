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
 * Determina el género del participante
 * @param participant - Participante
 * @returns Género del participante
 */
const determineGender = (participant: Participant): "Mujeres" | "Varones" | "Mixto" => {
  // Si es pareja (2 usuarios), es Mixto
  if (participant.usersId.length === 2) {
    return "Mixto";
  }
  
  // Para individual, necesitarías obtener el género del usuario
  // Esto requeriría una consulta adicional a la colección de usuarios
  // Por ahora, retorno un valor por defecto
  // TODO: Implementar lógica para obtener género del usuario individual
  return "Mujeres"; // Placeholder - implementar lógica real
};

/**
 * Agrupa los participantes por modalidad, categoría y género
 * @param participants - Array de participantes
 * @returns Objeto agrupado por modalidad, categoría y género
 */
const groupParticipantsByCategory = (participants: Participant[]): ParticipantsByCategory => {
  const grouped: ParticipantsByCategory = {};

  participants.forEach(participant => {
    const { level, category } = participant;
    
    // Determinar el género basado en la cantidad de usuarios
    const gender = determineGender(participant);

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
  });

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

  console.log(`🏗️ Iniciando creación de documentos LiveCompetition para evento: ${eventId}`);

  // Iterar por cada modalidad
  for (const [levelId, categories] of Object.entries(participantsByCategory)) {
    console.log(`📋 Procesando modalidad: ${levelId}`);
    
    // Iterar por cada categoría
    for (const [category, genders] of Object.entries(categories)) {
      console.log(`  📝 Procesando categoría: ${category}`);
      
      // Iterar por cada género
      for (const [gender, participants] of Object.entries(genders)) {
        console.log(`    👥 Procesando género: ${gender} (${participants.length} participantes)`);
        
        // Solo crear documento si hay participantes
        if (participants.length > 0) {
          // Crear ID único para el documento
          const docId = `${levelId}_${category}_${gender}`;
          
          // Obtener configuración de la modalidad desde el evento
          const levelConfig = event?.dance?.levels?.[levelId]?.config;
          
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
            blocks: levelConfig?.blocks || 1,
            tracksPerBlock: levelConfig?.tracksPerBlock || 1,
            totalTandas: 0,
            currentTandaIndex: 0,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };

          // Agregar al batch
          const docRef = doc(liveCompetitionRef, docId);
          batch.set(docRef, liveCompetitionData);
          documentsCreated++;

          console.log(`      ✅ Preparando documento: ${docId}`);
          console.log(`         - Participantes: ${participants.length}`);
          console.log(`         - Fase inicial: ${currentPhase}`);
          console.log(`         - Bloques: ${levelConfig?.blocks || 1}`);
          console.log(`         - Pistas por bloque: ${levelConfig?.tracksPerBlock || 1}`);
        } else {
          console.log(`      ⚠️ Saltando ${gender} - sin participantes`);
        }
      }
    }
  }

  if (documentsCreated === 0) {
    console.log('⚠️ No se encontraron combinaciones válidas para crear documentos');
    return;
  }

  console.log(`🚀 Ejecutando batch con ${documentsCreated} documentos...`);
  
  try {
    // Ejecutar batch
    await batch.commit();
    console.log(`✅ ${documentsCreated} documentos LiveCompetition creados exitosamente en la subcolección`);
  } catch (error) {
    console.error('❌ Error al ejecutar batch:', error);
    throw new Error(`Error al crear documentos LiveCompetition: ${error.message}`);
  }
};

/**
 * Función principal para iniciar el concurso
 * @param eventId - ID del evento a iniciar
 * @returns Promise<void>
 */
export const startContestWithEventData = async (eventId: string): Promise<void> => {
  try {
    console.log(`🚀 Iniciando concurso para evento: ${eventId}`);
    
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

    console.log('✅ Precondiciones verificadas');

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

    console.log(`📊 Encontrados ${participants.length} participantes`);

    if (participants.length === 0) {
      throw new Error('No hay participantes registrados en el evento');
    }

    // 4. Agrupar participantes por modalidad, categoría y género
    const participantsByCategory = groupParticipantsByCategory(participants);
    
    // Log de la agrupación para debugging
    console.log('📋 Agrupación de participantes:');
    Object.entries(participantsByCategory).forEach(([level, categories]) => {
      Object.entries(categories).forEach(([category, genders]) => {
        Object.entries(genders).forEach(([gender, participants]) => {
          console.log(`  - ${level} | ${category} | ${gender}: ${participants.length} participantes`);
        });
      });
    });

    // 5. Crear documentos LiveCompetition PRIMERO
    await createLiveCompetitionDocuments(eventId, participantsByCategory, eventData);

    // 6. Cambiar estado del evento DESPUÉS de crear todo
    await updateDoc(eventRef, {
      status: 'live',
      realStartTime: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('✅ Estado del evento actualizado a "live" con realStartTime');

    console.log('🎉 Concurso iniciado exitosamente');

  } catch (error) {
    console.error('❌ Error al iniciar el concurso:', error);
    
    // Si hubo error después de cambiar el estado, intentar revertir
    try {
      console.log('🔄 Intentando revertir cambios...');
      const eventRef = doc(db, 'eventos', eventId);
      await updateDoc(eventRef, {
        status: 'pendiente',
        updatedAt: serverTimestamp()
      });
      console.log('✅ Estado del evento revertido a "pendiente"');
    } catch (revertError) {
      console.error('❌ Error al revertir estado del evento:', revertError);
      console.error('⚠️ ATENCIÓN: El evento podría quedar en estado inconsistente');
    }
    
    throw error;
  }
};