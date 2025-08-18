'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Ticket } from '../../types/ticketType';
import { Participant } from '../../types/participantType';
import { User } from '../../types/userType';
import { CustomEvent } from '../../types/eventType';
import { Academy } from '../../types/academyType';

export interface RegistrationItem {
  id: string;
  type: 'ticket' | 'participant' | 'group_ticket'; // Nuevo tipo para tickets grupales
  status: 'Pendiente' | 'Confirmada' | 'Anulado';
  eventName: string;
  eventDate: Date;
  category: string;
  level: string;
  amount: number;
  registrationDate: Date;
  paymentDate?: Date;
  participants: string[];
  academies: string[];
  location: string;
  canCancel: boolean;
  ticketId?: string;
  participantCode?: string;
  eventId: string;
  eventImage?: string;
  // Nuevos campos para tickets grupales
  isGroupTicket?: boolean;
  totalParticipants?: number;
  inscriptionSummary?: string; // Resumen: "3 inscripciones, 5 participantes"
  createdByMe?: boolean; // Indica si el usuario actual creó este ticket
}

const useMyRegistrations = (userId: string) => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función auxiliar para obtener nombres de academias
  const getAcademyNames = async (academyIds: string[]): Promise<string[]> => {
    if (!academyIds || academyIds.length === 0) {
      return ['Libre'];
    }

    try {
      const academyNames = await Promise.all(
        academyIds.map(async (academyId) => {
          if (!academyId || academyId.trim() === '') {
            return 'Libre';
          }

          try {
            const academyDoc = await getDoc(doc(db, 'academias', academyId));
            if (academyDoc.exists()) {
              const academyData = academyDoc.data() as Academy;
              return academyData.name || 'Libre';
            } else {
              return 'Libre';
            }
          } catch (individualError) {
            console.error('Error al obtener academia:', academyId, individualError);
            return 'Libre';
          }
        })
      );
      return academyNames;
    } catch (error) {
      console.error('Error general getting academy names:', error);
      return academyIds.map(() => 'Libre');
    }
  };

  // Función para procesar academias (IDs + nombres)
  const processAcademies = async (academyIds: string[], academyNames: string[]): Promise<string[]> => {
    if (academyNames && academyNames.length > 0) {
      return academyNames.filter(name => name && name.trim() !== '');
    }

    if (academyIds && academyIds.length > 0) {
      return await getAcademyNames(academyIds);
    }

    return ['Libre'];
  };

  // NUEVO: Procesar tickets grupales creados por el usuario
  const processGroupTicket = async (ticket: Ticket): Promise<RegistrationItem | null> => {
    try {
      // Obtener evento
      const eventDoc = await getDoc(doc(db, 'eventos', ticket.eventId));
      if (!eventDoc.exists()) return null;
      const eventData = eventDoc.data() as CustomEvent;

      // Calcular totales
      const totalParticipants = ticket.entries.reduce((total, entry) => total + entry.usersId.length, 0);
      const totalInscriptions = ticket.entries.length;

      // Obtener todas las academias únicas
      const allAcademyIds = new Set<string>();
      const allAcademyNames = new Set<string>();

      ticket.entries.forEach(entry => {
        entry.academiesId?.forEach(id => allAcademyIds.add(id));
        entry.academiesName?.forEach(name => allAcademyNames.add(name));
      });

      const academyNames = await processAcademies(
        Array.from(allAcademyIds),
        Array.from(allAcademyNames)
      );

      // Obtener nombres de TODOS los participantes del ticket
      const allParticipantIds = new Set<string>();
      ticket.entries.forEach(entry => {
        entry.usersId.forEach(uid => allParticipantIds.add(uid));
      });

      const participantNames = await Promise.all(
        Array.from(allParticipantIds).map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            return `${userData.firstName} ${userData.lastName}`;
          }
          return 'Usuario desconocido';
        })
      );

      // Obtener modalidades únicas
      const modalidades = [...new Set(ticket.entries.map(entry => entry.level))];
      const categorias = [...new Set(ticket.entries.map(entry => entry.category))];

      const result: RegistrationItem = {
        id: `group-${ticket.id}`,
        type: 'group_ticket',
        status: ticket.status === 'Pagado' ? 'Confirmada' : 'Pendiente',
        eventName: eventData.name,
        eventDate: eventData.startDate.toDate(),
        category: categorias.length === 1 ? categorias[0] : `${categorias.length} categorías`,
        level: modalidades.length === 1 ? modalidades[0] : `${modalidades.length} modalidades`,
        amount: ticket.totalAmount,
        registrationDate: ticket.registrationDate.toDate(),
        paymentDate: ticket.paymentDate?.toDate(),
        participants: participantNames,
        academies: academyNames,
        location: eventData.location.placeName,
        canCancel: ticket.status !== 'Anulado',
        ticketId: ticket.id,
        eventId: ticket.eventId,
        eventImage: eventData.smallImage,
        isGroupTicket: true,
        totalParticipants,
        inscriptionSummary: `${totalInscriptions} inscripción${totalInscriptions !== 1 ? 'es' : ''}, ${totalParticipants} participante${totalParticipants !== 1 ? 's' : ''}`,
        createdByMe: true
      };

      return result;
    } catch (error) {
      console.error('Error processing group ticket:', error);
      return null;
    }
  };

  // Procesar entries del ticket (para participación individual)
  const processTicketEntries = async (ticket: Ticket, userId: string): Promise<RegistrationItem[]> => {
    try {
      const eventDoc = await getDoc(doc(db, 'eventos', ticket.eventId));
      if (!eventDoc.exists()) return [];
      const eventData = eventDoc.data() as CustomEvent;

      const registrationItems: RegistrationItem[] = [];

      for (let i = 0; i < ticket.entries.length; i++) {
        const entry = ticket.entries[i];

        if (entry.usersId.includes(userId)) {
          const participantNames = await Promise.all(
            entry.usersId.map(async (uid) => {
              const userDoc = await getDoc(doc(db, 'users', uid));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                return `${userData.firstName} ${userData.lastName}`;
              }
              return 'Usuario desconocido';
            })
          );

          const academyNames = await processAcademies(
            entry.academiesId || [],
            entry.academiesName || []
          );

          const canCancel = entry.status !== 'Anulado' && ticket.status !== 'Anulado';

          const registrationItem: RegistrationItem = {
            id: `${ticket.id}-entry-${i}`,
            type: 'ticket',
            status: entry.status === 'Anulado' ? 'Anulado' :
              ticket.status === 'Pagado' ? 'Confirmada' : 'Pendiente',
            eventName: eventData.name,
            eventDate: eventData.startDate.toDate(),
            category: entry.category,
            level: entry.level,
            amount: entry.amount,
            registrationDate: ticket.registrationDate.toDate(),
            paymentDate: ticket.paymentDate?.toDate(),
            participants: participantNames,
            academies: academyNames,
            location: eventData.location.placeName,
            canCancel,
            ticketId: ticket.id,
            eventId: ticket.eventId,
            eventImage: eventData.smallImage,
            isGroupTicket: false,
            createdByMe: false
          };

          registrationItems.push(registrationItem);
        }
      }

      return registrationItems;
    } catch (error) {
      console.error('Error processing ticket entries:', error);
      return [];
    }
  };

  // Procesar participants (inscripciones confirmadas)
  const processParticipant = async (participant: Participant): Promise<RegistrationItem | null> => {
    try {
      const eventDoc = await getDoc(doc(db, 'eventos', participant.eventId));
      if (!eventDoc.exists()) return null;
      const eventData = eventDoc.data() as CustomEvent;

      let ticketData: Ticket | null = null;
      if (participant.ticketId) {
        const ticketDoc = await getDoc(doc(db, 'tickets', participant.ticketId));
        if (ticketDoc.exists()) {
          ticketData = ticketDoc.data() as Ticket;
        }
      }

      const participantNames = await Promise.all(
        participant.usersId.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            return `${userData.firstName} ${userData.lastName}`;
          }
          return 'Usuario desconocido';
        })
      );

      let academyNames: string[] = ['Libre'];

      if (participant.academiesId && participant.academiesId.length > 0) {
        academyNames = await getAcademyNames(participant.academiesId);
      } else if (ticketData?.entries) {
        const matchingEntry = ticketData.entries.find(entry =>
          entry.usersId.some(uid => participant.usersId.includes(uid))
        );
        if (matchingEntry) {
          academyNames = await processAcademies(
            matchingEntry.academiesId || [],
            matchingEntry.academiesName || []
          );
        }
      }

      const result: RegistrationItem = {
        id: participant.id,
        type: 'participant',
        status: 'Confirmada',
        eventName: eventData.name,
        eventDate: eventData.startDate.toDate(),
        category: participant.category,
        level: participant.level,
        amount: ticketData?.totalAmount || 0,
        registrationDate: participant.createdAt.toDate(),
        paymentDate: ticketData?.paymentDate?.toDate(),
        participants: participantNames,
        academies: academyNames,
        location: eventData.location.placeName,
        canCancel: false,
        participantCode: participant.code,
        ticketId: participant.ticketId,
        eventId: participant.eventId,
        eventImage: eventData.smallImage,
        isGroupTicket: false,
        createdByMe: false
      };

      return result;
    } catch (error) {
      console.error('Error processing participant:', error);
      return null;
    }
  };

  const fetchRegistrations = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const allRegistrations: RegistrationItem[] = [];

      // 1. Buscar TODOS los tickets
      const ticketsQuery = query(collection(db, 'tickets'));
      const ticketsSnapshot = await getDocs(ticketsQuery);

      // 2. Buscar participants del usuario
      const participantsQuery = query(
        collection(db, 'participants'),
        where('usersId', 'array-contains', userId)
      );
      const participantsSnapshot = await getDocs(participantsQuery);

      // 3. NUEVO: Buscar tickets creados por el usuario (organizador)
      const myTicketsQuery = query(
        collection(db, 'tickets'),
        where('createdBy', '==', userId)
      );
      const myTicketsSnapshot = await getDocs(myTicketsQuery);

      // Procesar tickets donde el usuario participa individualmente
      for (const ticketDoc of ticketsSnapshot.docs) {
        const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;

        const hasUserInEntries = ticket.entries.some(entry =>
          entry.usersId.includes(userId)
        );

        // Solo procesar si NO es un ticket creado por el usuario (para evitar duplicados)
        if (hasUserInEntries && ticket.createdBy !== userId) {
          const hasParticipant = participantsSnapshot.docs.some(
            participantDoc => participantDoc.data().ticketId === ticket.id
          );

          if (!hasParticipant) {
            const registrationItems = await processTicketEntries(ticket, userId);
            allRegistrations.push(...registrationItems);
          }
        }
      }

      // NUEVO: Procesar tickets grupales creados por el usuario
      for (const ticketDoc of myTicketsSnapshot.docs) {
        const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
        
        // Verificar si ya tiene participants (ticket procesado)
        const hasParticipant = participantsSnapshot.docs.some(
          participantDoc => participantDoc.data().ticketId === ticket.id
        );

        if (!hasParticipant) {
          const groupTicketItem = await processGroupTicket(ticket);
          if (groupTicketItem) {
            allRegistrations.push(groupTicketItem);
          }
        }
      }

      // Procesar participants (inscripciones confirmadas)
      for (const participantDoc of participantsSnapshot.docs) {
        const participant = { id: participantDoc.id, ...participantDoc.data() } as Participant;
        const registrationItem = await processParticipant(participant);
        if (registrationItem) {
          allRegistrations.push(registrationItem);
        }
      }

      // Ordenar por fecha más reciente
      allRegistrations.sort((a, b) => b.registrationDate.getTime() - a.registrationDate.getTime());
      
      setRegistrations(allRegistrations);
      setError(null);
    } catch (err) {
      console.error('Error fetching registrations:', err);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  const refetch = useCallback(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return {
    registrations,
    loading,
    error,
    refetch
  };
};

export default useMyRegistrations;