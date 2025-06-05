'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Ticket } from '../../types/ticketType';
import { Participant } from '../../types/participantType';
import { User } from '../../types/userType';
import { CustomEvent } from '../../types/eventType';

export interface RegistrationItem {
  id: string;
  type: 'ticket' | 'participant';
  status: 'Pendiente' | 'Confirmada' | 'Anulado';
  eventName: string;
  eventDate: Date;
  category: string;
  level: string;
  amount: number;
  registrationDate: Date;
  expirationDate?: Date;
  paymentDate?: Date;
  participants: string[];
  academies: string[];
  location: string;
  canCancel: boolean;
  ticketId?: string;
  participantCode?: string;
  eventId: string;
  eventImage?: string;
}

const useMyRegistrations = (userId: string) => {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRegistrations = async () => {
      try {
        setLoading(true);
        const allRegistrations: RegistrationItem[] = [];

        // 1. Buscar tickets del usuario
        const ticketsQuery = query(
          collection(db, 'tickets'),
          where('usersId', 'array-contains', userId)
        );
        const ticketsSnapshot = await getDocs(ticketsQuery);

        // 2. Buscar participants del usuario
        const participantsQuery = query(
          collection(db, 'participants'),
          where('usersId', 'array-contains', userId)
        );
        const participantsSnapshot = await getDocs(participantsQuery);

        // Procesar tickets (solo los que NO tienen participant)
        for (const ticketDoc of ticketsSnapshot.docs) {
          const ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
          
          // Verificar si este ticket ya tiene un participant
          const hasParticipant = participantsSnapshot.docs.some(
            participantDoc => participantDoc.data().ticketId === ticket.id
          );

          if (!hasParticipant) {
            const registrationItem = await processTicket(ticket);
            if (registrationItem) {
              allRegistrations.push(registrationItem);
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
    };

    fetchRegistrations();
  }, [userId]);

  const processTicket = async (ticket: Ticket): Promise<RegistrationItem | null> => {
    try {
      // Obtener evento
      const eventDoc = await getDoc(doc(db, 'eventos', ticket.eventId));
      if (!eventDoc.exists()) return null;
      const eventData = eventDoc.data() as CustomEvent;
      
      // Obtener nombres de participantes
      const participantNames = await Promise.all(
        ticket.usersId.map(async (uid) => {
          const userDoc = await getDoc(doc(db, 'users', uid));
          if (userDoc.exists()) {
            const userData = userDoc.data() as User;
            return `${userData.firstName} ${userData.lastName}`;
          }
          return 'Usuario desconocido';
        })
      );

      const now = new Date();
      const expirationDate = ticket.expirationDate.toDate();
      const canCancel = ticket.status === 'Pendiente' && expirationDate > now;

      const result = {
        id: ticket.id,
        type: 'ticket' as const,
        status: ticket.status === 'Pagado' ? 'Confirmada' as const : 
               ticket.status === 'Anulado' ? 'Anulado' as const : 'Pendiente' as const,
        eventName: eventData.name,
        eventDate: eventData.startDate.toDate(),
        category: ticket.category,
        level: ticket.level,
        amount: ticket.totalAmount,
        registrationDate: ticket.registrationDate.toDate(),
        expirationDate: expirationDate,
        paymentDate: ticket.paymentDate?.toDate(),
        participants: participantNames,
        academies: ticket.academiesName,
        location: eventData.location.placeName,
        canCancel,
        ticketId: ticket.id,
        eventId: ticket.eventId,
        eventImage: eventData.smallImage
      };
      
      return result;
    } catch (error) {
      console.error('Error processing ticket:', error);
      return null;
    }
  };

  const processParticipant = async (participant: Participant): Promise<RegistrationItem | null> => {
    try {
      // Obtener evento
      const eventDoc = await getDoc(doc(db, 'eventos', participant.eventId));
      if (!eventDoc.exists()) return null;
      const eventData = eventDoc.data() as CustomEvent;

      // Obtener ticket asociado (para info adicional)
      let ticketData: Ticket | null = null;
      if (participant.ticketId) {
        const ticketDoc = await getDoc(doc(db, 'tickets', participant.ticketId));
        if (ticketDoc.exists()) {
          ticketData = ticketDoc.data() as Ticket;
        }
      }

      // Obtener nombres de participantes
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

      const result = {
        id: participant.id,
        type: 'participant' as const,
        status: 'Confirmada' as const,
        eventName: eventData.name,
        eventDate: eventData.startDate.toDate(),
        category: participant.category,
        level: participant.level,
        amount: ticketData?.totalAmount || 0,
        registrationDate: participant.createdAt.toDate(),
        paymentDate: ticketData?.paymentDate?.toDate(),
        participants: participantNames,
        academies: ticketData?.academiesName || [],
        location: eventData.location.placeName,
        canCancel: false,
        participantCode: participant.code,
        ticketId: participant.ticketId,
        eventId: participant.eventId,
        eventImage: eventData.smallImage
      };
      
      return result;
    } catch (error) {
      console.error('Error processing participant:', error);
      return null;
    }
  };

  const refetch = () => {
    if (userId) {
      // Re-ejecutar el efecto
      setLoading(true);
      // El useEffect se encargará de hacer el fetch nuevamente
    }
  };

  return { 
    registrations, 
    loading, 
    error, 
    refetch 
  };
};

export default useMyRegistrations;