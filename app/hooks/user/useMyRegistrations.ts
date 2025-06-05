'use client';

import { useState, useEffect } from 'react';
import { db } from '../../firebase/config';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { Ticket } from '../../types/ticketType';
import { Participant } from '../../types/participantType';
import { User } from '../../types/userType';
import { CustomEvent } from '../../types/eventType';
import { Academy } from '../../types/academyType';

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
            // AQUÍ ESTÁ EL CAMBIO: Procesar cada entry que incluya al usuario
            const registrationItems = await processTicketEntries(ticket, userId);
            allRegistrations.push(...registrationItems);
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

  // Función auxiliar para obtener nombres de academias
  const getAcademyNames = async (academyIds: string[]): Promise<string[]> => {
    if (!academyIds || academyIds.length === 0) {
      return ['Libre']; // Si no hay academias, es libre
    }

    try {
      const academyNames = await Promise.all(
        academyIds.map(async (academyId) => {
          // Si el ID está vacío, nulo o undefined, directamente retornar "Libre"
          if (!academyId || academyId.trim() === '') {
            return 'Libre';
          }

          try {
            const academyDoc = await getDoc(doc(db, 'academias', academyId));
            
            if (academyDoc.exists()) {
              const academyData = academyDoc.data() as Academy;
              
              // Verificar si tiene el campo name
              if (academyData.name) {
                return academyData.name;
              } else {
                return 'Libre'; // Academia sin nombre = Libre
              }
            } else {
              return 'Libre'; // Academia no encontrada = Libre
            }
          } catch (individualError) {
            console.error('Error al obtener academia:', academyId, individualError);
            return 'Libre'; // Error al cargar = Libre
          }
        })
      );
      return academyNames;
    } catch (error) {
      console.error('Error general getting academy names:', error);
      return academyIds.map(() => 'Libre'); // Error general = Libre
    }
  };

  // NUEVA FUNCIÓN: Procesar entries del ticket
  const processTicketEntries = async (ticket: Ticket, userId: string): Promise<RegistrationItem[]> => {
    try {
      // Obtener evento
      const eventDoc = await getDoc(doc(db, 'eventos', ticket.eventId));
      if (!eventDoc.exists()) return [];
      const eventData = eventDoc.data() as CustomEvent;

      const registrationItems: RegistrationItem[] = [];

      // Procesar solo las entries que incluyan al usuario actual
      for (let i = 0; i < ticket.entries.length; i++) {
        const entry = ticket.entries[i];
        
        // Solo procesar si esta entry incluye al usuario actual
        if (entry.usersId.includes(userId)) {
          // Obtener nombres de participantes de ESTA entry específica
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

          // Obtener nombres de academias de ESTA entry específica
          const academyNames = await getAcademyNames(entry.academiesId);

          const now = new Date();
          const expirationDate = ticket.expirationDate.toDate();
          const canCancel = ticket.status === 'Pendiente' && expirationDate > now;

          const registrationItem: RegistrationItem = {
            id: `${ticket.id}-entry-${i}`, // ID único para cada entry
            type: 'ticket',
            status: ticket.status === 'Pagado' ? 'Confirmada' : 
                   ticket.status === 'Anulado' ? 'Anulado' : 'Pendiente',
            eventName: eventData.name,
            eventDate: eventData.startDate.toDate(),
            category: entry.category, // Categoría específica de esta entry
            level: entry.level,       // Nivel específico de esta entry
            amount: entry.amount,     // Monto específico de esta entry
            registrationDate: ticket.registrationDate.toDate(),
            expirationDate: expirationDate,
            paymentDate: ticket.paymentDate?.toDate(),
            participants: participantNames, // Solo los participantes de esta entry
            academies: academyNames,        // Solo las academias de esta entry
            location: eventData.location.placeName,
            canCancel,
            ticketId: ticket.id,
            eventId: ticket.eventId,
            eventImage: eventData.smallImage
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

  // La función processParticipant se mantiene igual
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

      // Obtener nombres de academias
      let academyNames: string[] = ['Libre']; // Default
      
      // Si el participant tiene su propio academiesId, usarlo
      if (participant.academiesId && participant.academiesId.length > 0) {
        academyNames = await getAcademyNames(participant.academiesId);
      }
      // Si no, intentar usar los datos del ticket
      else if (ticketData?.academiesName && ticketData.academiesName.length > 0) {
        academyNames = ticketData.academiesName;
      }
      // Si el ticket tiene academiesId en lugar de academiesName
      else if (ticketData?.entries) {
        // Buscar la entry que corresponde a este participant
        const matchingEntry = ticketData.entries.find(entry => 
          entry.usersId.some(uid => participant.usersId.includes(uid))
        );
        if (matchingEntry && matchingEntry.academiesId.length > 0) {
          academyNames = await getAcademyNames(matchingEntry.academiesId);
        }
      }

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
        academies: academyNames,
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
      setLoading(true);
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