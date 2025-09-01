import { useState } from 'react';
import { Timestamp } from 'firebase/firestore';
import { User } from '@/app/types/userType';
import { CustomEvent } from '@/app/types/eventType';
import { TicketEntry, TicketData } from '@/app/types/ticketType';
import useTicket from '@/app/hooks/useTicket';

interface CreateTicketParams {
  event: CustomEvent;
  user: User;
  pareja?: User | null;
  selectedCategory: string;
  selectedAcademy: string;        // ID de academia o vacío si es nueva
  selectedAcademyName: string;    // Nombre de academia
  coupleSelectedAcademy?: string; // ID de academia pareja o vacío si es nueva
  coupleSelectedAcademyName?: string; // Nombre de academia pareja
}

export const useCreateTicket = () => {
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { saveTicket } = useTicket('');

  const createTicket = async (params: CreateTicketParams): Promise<string | null> => {
    const {
      event,
      user,
      pareja,
      selectedCategory,
      selectedAcademy,
      selectedAcademyName,
      coupleSelectedAcademy = '',
      coupleSelectedAcademyName = ''
    } = params;

    setIsCreating(true);
    setError(null);

    try {
      // Validaciones básicas
      if (!user?.id || !event?.id || !selectedCategory || !selectedAcademyName) {
        throw new Error('Datos incompletos para crear el ticket');
      }

      // Obtener precio
      const price = Number(event.dance?.levels?.[selectedCategory]?.price) || 0;
      if (price <= 0) {
        throw new Error('Precio no válido');
      }

      // Preparar arrays de academias
      const academiesId: string[] = [];
      const academiesName: string[] = [];

      // Academia del usuario principal
      if (selectedAcademy) {
        academiesId.push(selectedAcademy);
      }
      academiesName.push(selectedAcademyName);

      // Academia de la pareja (si existe)
      if (pareja) {
        if (coupleSelectedAcademy) {
          academiesId.push(coupleSelectedAcademy);
        }
        if (coupleSelectedAcademyName) {
          academiesName.push(coupleSelectedAcademyName);
        }
      }

      // Crear entry
      const entry: TicketEntry = {
        usersId: pareja ? [user.id, pareja.id] : [user.id],
        academiesId,
        academiesName,
        category: user.marinera?.participant?.category || '',
        level: selectedCategory,
        amount: price,
      };

      // Calcular fecha de expiración (24 horas)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 24);

      // Crear ticket data
      const ticketData: TicketData = {
        status: 'Pendiente',
        eventId: event.id,
        registrationDate: Timestamp.fromDate(new Date()),
        inscriptionType: 'Individual',
        totalAmount: entry.amount,
        entries: [entry],
        createdBy: user.id,
      };

      // Guardar en Firebase
      const docRef = await saveTicket(ticketData);
      
      if (!docRef?.id) {
        throw new Error('Error al guardar en Firebase');
      }

      return docRef.id;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      console.error('Error creating ticket:', err);
      return null;
    } finally {
      setIsCreating(false);
    }
  };

  const clearError = () => setError(null);

  return {
    createTicket,
    isCreating,
    error,
    clearError,
  };
};

export default useCreateTicket;