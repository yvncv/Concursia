import { useState } from 'react';
import toast from 'react-hot-toast';
import { User } from '@/app/types/userType';
import { CustomEvent } from '@/app/types/eventType';
import { TicketEntry } from '@/app/types/ticketType';
import useProcessTicket from '@/app/hooks/tickets/useProcessTicket';

// Tipos para inscripción grupal
interface Participante {
  id: string;
  nombre: string;
  dni: string;
  edad: string | number;
  genero: string;
  telefono: string;
  academyId: string;
  academyName: string;
  birthDate: Date;
}

interface Inscripcion {
  modalidad: string;
  level: string;
  category: string;
  isPullCouple: boolean;
  participante: Participante;
  pareja: Participante | null;
  precio: number;
}

interface CreateGroupTicketParams {
  event: CustomEvent;
  user: User;
  inscripciones: Inscripcion[];
}

export const useCreateGroupTicket = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Usar el hook de tickets "En Proceso"
  const {
    findProcessTicket,
    createProcessTicket,
    addEntryToProcessTicket,
    isLoading: processLoading
  } = useProcessTicket();

  const createGroupTicket = async (params: CreateGroupTicketParams): Promise<string | null> => {
    const { event, user, inscripciones } = params;

    // Validación de parámetros básicos
    if (!user?.id || !event?.id || !inscripciones?.length) {
      const errorMsg = 'Datos incompletos para crear el ticket grupal';
      toast.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    // Validación de academia: al menos un participante debe ser de la academia del usuario
    const userAcademyId = user.marinera?.academyId;
    if (!userAcademyId) {
      const errorMsg = 'El usuario no tiene una academia asignada';
      toast.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    // Verificar que al menos un participante sea de la academia del usuario
    const hasValidAffiliation = inscripciones.some(inscripcion => 
      inscripcion.participante.academyId === userAcademyId ||
      (inscripcion.pareja && inscripcion.pareja.academyId === userAcademyId)
    );

    if (!hasValidAffiliation) {
      const errorMsg = 'Al menos un participante debe ser de tu academia en cada inscripción';
      toast.error(errorMsg);
      setError(errorMsg);
      return null;
    }

    setIsCreating(true);
    setError(null);

    // Crear toast de loading
    const loadingToastId = toast.loading('Procesando inscripciones...');

    try {
      // Buscar ticket "En Proceso" existente para esta academia/evento
      const existingTicket = await findProcessTicket(userAcademyId, event.id);

      // Convertir inscripciones a entries
      const newEntries: TicketEntry[] = inscripciones.map(inscripcion => {
        const usersId = inscripcion.pareja
          ? [inscripcion.participante.id, inscripcion.pareja.id]
          : [inscripcion.participante.id];

        // Recopilar IDs de academias (sin duplicados y sin vacíos)
        const academiesId = [
          inscripcion.participante.academyId,
          ...(inscripcion.pareja ? [inscripcion.pareja.academyId] : [])
        ].filter((id, index, arr) => id && arr.indexOf(id) === index);

        // Recopilar nombres de academias (sin duplicados y sin vacíos)
        const academiesName = [
          inscripcion.participante.academyName,
          ...(inscripcion.pareja ? [inscripcion.pareja.academyName] : [])
        ].filter((name, index, arr) => name && arr.indexOf(name) === index);

        return {
          usersId,
          academiesId,
          academiesName,
          category: inscripcion.category,
          level: inscripcion.level,
          amount: inscripcion.precio,
        };
      });

      let ticketId: string;

      if (existingTicket) {
        // CASO 1: Ya existe un ticket "En Proceso" - Agregar entries
        console.log('Agregando inscripciones a ticket existente:', existingTicket.id);
        
        // Agregar cada entry al ticket existente
        for (const entry of newEntries) {
          const success = await addEntryToProcessTicket(existingTicket.id, entry);
          if (!success) {
            throw new Error('Error al agregar inscripción al ticket existente');
          }
        }
        
        ticketId = existingTicket.id;
        
        // Toast de éxito para entries agregados
        toast.success(
          `¡${inscripciones.length} inscripción${inscripciones.length > 1 ? 'es' : ''} agregada${inscripciones.length > 1 ? 's' : ''} al ticket en proceso!`,
          { 
            id: loadingToastId,
            duration: 5000 
          }
        );

      } else {
        // CASO 2: No existe ticket - Crear nuevo ticket "En Proceso"
        console.log('Creando nuevo ticket en proceso');
        
        // Crear ticket con el primer entry
        const firstEntry = newEntries[0];
        const newTicketId = await createProcessTicket(event.id, user.id, firstEntry);
        
        if (!newTicketId) {
          throw new Error('Error al crear nuevo ticket en proceso');
        }

        // Si hay más entries, agregarlos uno por uno
        for (let i = 1; i < newEntries.length; i++) {
          const success = await addEntryToProcessTicket(newTicketId, newEntries[i]);
          if (!success) {
            throw new Error(`Error al agregar inscripción ${i + 1} al ticket`);
          }
        }
        
        ticketId = newTicketId;
        
        // Toast de éxito para ticket nuevo
        toast.success(
          `¡Nuevo ticket en proceso creado! ${inscripciones.length} inscripción${inscripciones.length > 1 ? 'es' : ''} agregada${inscripciones.length > 1 ? 's' : ''}`,
          { 
            id: loadingToastId,
            duration: 5000 
          }
        );
      }

      return ticketId;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido al crear ticket grupal';
      setError(errorMessage);
      console.error('Error creating group ticket:', err);
      
      // Toast de error
      toast.error(errorMessage, { 
        id: loadingToastId,
        duration: 6000 
      });
      
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearError = () => setError(null);

  // Función auxiliar para validar inscripciones antes de crear el ticket
  const validateInscriptions = (inscripciones: Inscripcion[], user: User): string | null => {
    if (!inscripciones?.length) {
      return 'Debe agregar al menos una inscripción';
    }

    const userAcademyId = user.marinera?.academyId;
    if (!userAcademyId) {
      return 'El usuario no tiene una academia asignada';
    }

    // Verificar que cada inscripción tenga al menos un participante de la academia del usuario
    for (let i = 0; i < inscripciones.length; i++) {
      const inscripcion = inscripciones[i];
      const hasValidAffiliation = 
        inscripcion.participante.academyId === userAcademyId ||
        (inscripcion.pareja && inscripcion.pareja.academyId === userAcademyId);

      if (!hasValidAffiliation) {
        return `La inscripción ${i + 1} no tiene participantes de tu academia`;
      }

      // Validar que tenga precio válido
      if (!inscripcion.precio || inscripcion.precio <= 0) {
        return `La inscripción ${i + 1} no tiene un precio válido`;
      }
    }

    return null; // Todas las validaciones pasaron
  };

  return {
    createGroupTicket,
    validateInscriptions,
    isCreating: isCreating || processLoading,
    error,
    clearError,
  };
};

export default useCreateGroupTicket;