import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';
import { User } from '@/app/types/userType';
import { CustomEvent } from '@/app/types/eventType';
import { TicketEntry, TicketData } from '@/app/types/ticketType';
import useTicket from '@/app/hooks/useTicket';

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
  const { saveTicket } = useTicket('');

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
      // Crear entries para cada inscripción
      const entries: TicketEntry[] = inscripciones.map(inscripcion => {
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

      // Calcular monto total
      const totalAmount = entries.reduce((sum, entry) => sum + entry.amount, 0);

      // Calcular fecha de expiración (24 horas)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);

      // Crear ticket data según el tipo TicketData válido
      const ticketData: TicketData = {
        status: 'Pendiente',
        eventId: event.id,
        registrationDate: Timestamp.fromDate(new Date()),
        expirationDate: Timestamp.fromDate(expirationDate),
        inscriptionType: 'Grupal',
        totalAmount,
        entries,
        createdBy: user.id,
      };

      // Validar que el monto total sea mayor a 0
      if (totalAmount <= 0) {
        throw new Error('El monto total debe ser mayor a 0');
      }

      // Guardar en Firebase
      const docRef = await saveTicket(ticketData);
      
      if (!docRef?.id) {
        throw new Error('Error al guardar en Firebase');
      }

      // Toast de éxito
      toast.success(
        `¡Ticket grupal creado exitosamente! ${inscripciones.length} inscripción${inscripciones.length > 1 ? 'es' : ''} procesada${inscripciones.length > 1 ? 's' : ''}`,
        { 
          id: loadingToastId,
          duration: 5000 
        }
      );

      return docRef.id;

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
    isCreating,
    error,
    clearError,
  };
};

export default useCreateGroupTicket;