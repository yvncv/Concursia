// app/services/generateTandasService.ts
import { 
  collection, 
  doc, 
  getDocs, 
  writeBatch, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Participant } from '@/app/types/participantType';
import { Tanda } from '@/app/types/tandaType';
import { BlockInTanda } from '@/app/types/blockInTandaType';
import { TandaParticipant } from '@/app/types/tandaParticipantType';
import { CustomEvent } from '@/app/types/eventType'; // asegúrate de importar bien tu tipo
import { CompetitionPhase } from '@/app/types/liveCompetitionType';

/**
 * Mezcla un array de forma aleatoria (algoritmo Fisher-Yates)
 */
const shuffleArray = <T>(array: T[]): T[] => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

/**
 * Genera las tandas para una competencia específica
 * @param eventId ID del evento
 * @param liveCompetitionId ID del documento LiveCompetition (ej: "Seriado_Juvenil_Varones")
 * @param participants Array de participantes para esta categoría/género
 * @returns Array de tandas generadas
 */
export const generateTandas = async (
  eventId: string,
  liveCompetitionId: string,
  participants: Participant[],
  event: CustomEvent // <-- nuevo
): Promise<Tanda[]> => {
  try {
    // 1. Obtener configuración del LiveCompetition
    const liveCompetitionRef = doc(db, 'eventos', eventId, 'liveCompetition', liveCompetitionId);
    const liveCompetitionDoc = await getDoc(liveCompetitionRef);
    
    if (!liveCompetitionDoc.exists()) {
      throw new Error('LiveCompetition no encontrado');
    }
    
    const liveCompetitionData = liveCompetitionDoc.data();
    const { blocks, tracksPerBlock, currentPhase } = liveCompetitionData;
    
    // 2. Calcular participantes por tanda
    const participantsPerTanda = blocks * tracksPerBlock;
    const totalTandas = Math.ceil(participants.length / participantsPerTanda);
    
    // 3. Mezclar participantes aleatoriamente
    const shuffledParticipants = shuffleArray(participants);
    
    // 4. Generar tandas
    const tandas: Tanda[] = [];

    const initialJudgeIds = (event.staff || [])
      .filter(s => s.permissions.includes("judge") && s.juradoInicia)
      .map(s => s.userId);
    
    for (let tandaIndex = 0; tandaIndex < totalTandas; tandaIndex++) {
      // Obtener participantes para esta tanda
      const startIndex = tandaIndex * participantsPerTanda;
      const endIndex = Math.min(startIndex + participantsPerTanda, shuffledParticipants.length);
      const tandaParticipants = shuffledParticipants.slice(startIndex, endIndex);
      
      // Crear bloques para esta tanda
      const tandasBlocks: BlockInTanda[] = [];
      
      for (let blockIndex = 0; blockIndex < blocks; blockIndex++) {
        // Obtener participantes para este bloque
        const blockStartIndex = blockIndex * tracksPerBlock;
        const blockEndIndex = Math.min(blockStartIndex + tracksPerBlock, tandaParticipants.length);
        const blockParticipants = tandaParticipants.slice(blockStartIndex, blockEndIndex);
        
        // Convertir a TandaParticipant
        const tandaParticipantsForBlock: TandaParticipant[] = blockParticipants.map(participant => ({
          participantId: participant.id,
          scores: [] // Los puntajes se llenarán durante la competencia
        }));
        
        const block: BlockInTanda = {
          blockIndex,
          participants: tandaParticipantsForBlock,
          judgeIds: initialJudgeIds // <-- ahora asignas automáticamente los jurados
        };
        
        tandasBlocks.push(block);
      }
      
      // Crear la tanda
      const tanda: Tanda = {
        id: `tanda_${tandaIndex}`,
        index: tandaIndex,
        phase: currentPhase,
        blocks: tandasBlocks,
        status: 'pendiente',
        liveCompetitionId: liveCompetitionId,
      };
      
      tandas.push(tanda);
    }
    
    return tandas;
    
  } catch (error) {
    console.error('Error generando tandas:', error);
    throw new Error(`Error al generar tandas: ${error}`);
  }
};

/**
 * Guarda las tandas generadas en Firestore
 * @param eventId ID del evento
 * @param liveCompetitionId ID del documento LiveCompetition
 * @param phase Fase de la competencia (Final, Eliminatoria, etc.)
 * @param tandas Array de tandas a guardar
 */
export const saveTandasToFirestore = async (
  eventId: string,
  liveCompetitionId: string,
  phase: string,
  tandas: Tanda[]
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Crear cada tanda como documento en la subcolección (SIN el nivel phase)
    tandas.forEach(tanda => {
      const tandaRef = doc(
        db, 
        'eventos', 
        eventId, 
        'liveCompetition', 
        liveCompetitionId, 
        'tandas',
        tanda.id // Directamente el ID de la tanda
      );
      
      batch.set(tandaRef, {
        ...tanda,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
    });
    
    // Ejecutar batch
    await batch.commit();
    
  } catch (error) {
    console.error('Error guardando tandas:', error);
    throw new Error(`Error al guardar tandas: ${error}`);
  }
};

/**
 * Verifica si ya existen tandas para una competencia específica
 * @param eventId ID del evento
 * @param liveCompetitionId ID del documento LiveCompetition
 * @param phase Fase de la competencia
 * @returns true si ya existen tandas, false si no
 */
export const checkIfTandasExist = async (
  eventId: string,
  liveCompetitionId: string,
  phase: string
): Promise<boolean> => {
  try {
    const tandasRef = collection(
      db, 
      'eventos', 
      eventId, 
      'liveCompetition', 
      liveCompetitionId, 
      'tandas'
    );
    
    const tandasSnapshot = await getDocs(tandasRef);
    return !tandasSnapshot.empty;
    
  } catch (error) {
    console.error('Error verificando tandas existentes:', error);
    return false;
  }
};

/**
 * Función principal que orquesta todo el proceso de generación de tandas
 * @param eventId ID del evento
 * @param liveCompetitionId ID del documento LiveCompetition
 * @param phase Fase de la competencia
 * @param participants Array de participantes
 * @returns Array de tandas generadas (para mostrar en el modal)
 */
export const generateAndPrepareTandas = async (
  eventId: string,
  liveCompetitionId: string,
  phase: string,
  participants: Participant[]
): Promise<Tanda[]> => {
  try {
    // 1. Verificar si ya existen tandas
    const tandasExist = await checkIfTandasExist(eventId, liveCompetitionId, phase);
    
    if (tandasExist) {
      throw new Error('Ya existen tandas generadas para esta competencia');
    }
    
    const eventRef = doc(db, 'eventos', eventId);
    const eventSnap = await getDoc(eventRef);
    if (!eventSnap.exists()) throw new Error('Evento no encontrado');
    const eventData = { id: eventSnap.id, ...eventSnap.data() } as CustomEvent;
    
    // 2. Generar tandas
    const tandas = await generateTandas(eventId, liveCompetitionId, participants, eventData);
    
    // 3. Retornar tandas para mostrar en modal (NO las guardamos aún)
    return tandas;
    
  } catch (error) {
    console.error('Error en generateAndPrepareTandas:', error);
    throw error;
  }
};

/**
 * Confirma y guarda las tandas después de la aprobación del usuario
 * @param eventId ID del evento
 * @param liveCompetitionId ID del documento LiveCompetition
 * @param phase Fase de la competencia
 * @param tandas Array de tandas aprobadas
 */
export const confirmAndSaveTandas = async (
  eventId: string,
  liveCompetitionId: string,
  phase: string,
  tandas: Tanda[]
): Promise<void> => {
  try {
    await saveTandasToFirestore(eventId, liveCompetitionId, phase, tandas);
  } catch (error) {
    console.error('Error confirmando tandas:', error);
    throw error;
  }
};