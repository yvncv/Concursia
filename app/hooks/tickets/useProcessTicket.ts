'use client';

import { useState } from 'react';
import { db } from '../../firebase/config';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  deleteDoc,
  Timestamp 
} from 'firebase/firestore';
import { Ticket, TicketData, TicketEntry } from '../../types/ticketType';

const useProcessTicket = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar ticket "En Proceso" existente para una academia/evento
  const findProcessTicket = async (academyId: string, eventId: string): Promise<Ticket | null> => {
    try {
      setError(null);
      const q = query(
        collection(db, "tickets"),
        where("eventId", "==", eventId),
        where("status", "==", "En Proceso")
      );
      
      const querySnapshot = await getDocs(q);
      
      // Buscar el ticket que pertenece a esta academia
      for (const docSnap of querySnapshot.docs) {
        const ticketData = { id: docSnap.id, ...docSnap.data() } as Ticket;
        
        // Verificar si algún entry pertenece a esta academia
        const belongsToAcademy = ticketData.entries.some(entry => 
          entry.academiesId.includes(academyId)
        );
        
        if (belongsToAcademy) {
          return ticketData;
        }
      }
      
      return null;
    } catch (err) {
      console.error("Error finding process ticket:", err);
      setError("Error al buscar ticket en proceso");
      return null;
    }
  };

  // Crear nuevo ticket "En Proceso"
  const createProcessTicket = async (
    eventId: string,
    createdBy: string,
    initialEntry: TicketEntry
  ): Promise<string | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const ticketData: TicketData = {
        status: 'En Proceso',
        eventId,
        registrationDate: Timestamp.fromDate(new Date()),
        inscriptionType: 'Grupal',
        totalAmount: initialEntry.amount,
        entries: [initialEntry],
        createdBy
      };

      const docRef = await addDoc(collection(db, "tickets"), ticketData);
      return docRef.id;
    } catch (err) {
      console.error("Error creating process ticket:", err);
      setError("Error al crear ticket en proceso");
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Agregar entry a ticket "En Proceso" existente
  const addEntryToProcessTicket = async (ticketId: string, newEntry: TicketEntry): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Primero obtener el ticket actual
      const ticketRef = doc(db, "tickets", ticketId);
      const q = query(collection(db, "tickets"), where("__name__", "==", ticketId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Ticket no encontrado");
      }

      const ticketDoc = querySnapshot.docs[0];
      const currentTicket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;

      if (currentTicket.status !== 'En Proceso') {
        throw new Error("Solo se pueden modificar tickets en proceso");
      }

      // Agregar nuevo entry y recalcular total
      const updatedEntries = [...currentTicket.entries, newEntry];
      const newTotalAmount = updatedEntries.reduce((sum, entry) => sum + entry.amount, 0);

      await updateDoc(ticketRef, {
        entries: updatedEntries,
        totalAmount: newTotalAmount
      });

      return true;
    } catch (err) {
      console.error("Error adding entry to process ticket:", err);
      setError("Error al agregar inscripción al ticket");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar entry de ticket "En Proceso"
  const removeEntryFromProcessTicket = async (ticketId: string, entryIndex: number): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Obtener el ticket actual
      const q = query(collection(db, "tickets"), where("__name__", "==", ticketId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        throw new Error("Ticket no encontrado");
      }

      const ticketDoc = querySnapshot.docs[0];
      const currentTicket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;

      if (currentTicket.status !== 'En Proceso') {
        throw new Error("Solo se pueden modificar tickets en proceso");
      }

      if (entryIndex < 0 || entryIndex >= currentTicket.entries.length) {
        throw new Error("Índice de entry inválido");
      }

      // Eliminar entry y recalcular total
      const updatedEntries = currentTicket.entries.filter((_, index) => index !== entryIndex);
      const newTotalAmount = updatedEntries.reduce((sum, entry) => sum + entry.amount, 0);

      const ticketRef = doc(db, "tickets", ticketId);

      // Si no quedan entries, eliminar el ticket completo
      if (updatedEntries.length === 0 || newTotalAmount <= 0) {
        await deleteDoc(ticketRef);
        return true;
      }

      // Actualizar ticket con entries restantes
      await updateDoc(ticketRef, {
        entries: updatedEntries,
        totalAmount: newTotalAmount
      });

      return true;
    } catch (err) {
      console.error("Error removing entry from process ticket:", err);
      setError("Error al eliminar inscripción del ticket");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Enviar ticket (cambiar de "En Proceso" a "Pendiente")
  const submitProcessTicket = async (ticketId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const ticketRef = doc(db, "tickets", ticketId);
      
      await updateDoc(ticketRef, {
        status: 'Pendiente'
      });

      return true;
    } catch (err) {
      console.error("Error submitting process ticket:", err);
      setError("Error al enviar ticket");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Eliminar ticket "En Proceso" completamente
  const deleteProcessTicket = async (ticketId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const ticketRef = doc(db, "tickets", ticketId);
      await deleteDoc(ticketRef);

      return true;
    } catch (err) {
      console.error("Error deleting process ticket:", err);
      setError("Error al eliminar ticket");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    findProcessTicket,
    createProcessTicket,
    addEntryToProcessTicket,
    removeEntryFromProcessTicket,
    submitProcessTicket,
    deleteProcessTicket,
    isLoading,
    error,
    clearError
  };
};

export default useProcessTicket;