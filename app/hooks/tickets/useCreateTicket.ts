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

      // Preparar academias del usuario principal
      const userAcademyId = selectedAcademy || null; // null si es nueva
      const userAcademyName = selectedAcademyName;

      // Preparar academias de la pareja (si existe)
      const coupleAcademyId = pareja ? (coupleSelectedAcademy || null) : null;
      const coupleAcademyName = pareja ? coupleSelectedAcademyName : '';

      // Crear entry
      const entry: TicketEntry = {
        usersId: pareja ? [user.id, pareja.id] : [user.id],
        academiesId: pareja 
          ? [userAcademyId, coupleAcademyId].filter(id => id !== null) // Remover nulls para el array
          : [userAcademyId].filter(id => id !== null),
        academiesName: pareja 
          ? [userAcademyName, coupleAcademyName].filter(name => name !== '')
          : [userAcademyName],
        category: user.marinera?.participant?.category || '',
        level: selectedCategory,
        amount: price,
      };

      // Crear fecha de expiración (48 horas)
      const expirationDate = new Date();
      expirationDate.setHours(expirationDate.getHours() + 48);

      // Crear ticket data
      const ticketData: TicketData = {
        status: 'Pendiente',
        eventId: event.id,
        registrationDate: Timestamp.fromDate(new Date()),
        expirationDate: Timestamp.fromDate(expirationDate),
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