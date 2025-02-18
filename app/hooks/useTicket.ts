// useTicket.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { Ticket } from '../types/ticketType';

const useTicket = (eventId: string) => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!eventId) {
            setLoading(false);
            return;
        }

        const fetchTickets = async () => {
            try {
                const q = query(collection(db, "tickets"), where("eventId", "==", eventId));
                const querySnapshot = await getDocs(q);
                const ticketsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ticket));
                setTickets(ticketsData);
            } catch (err) {
                console.error("Error fetching tickets:", err);
                setError("Failed to fetch tickets");
            } finally {
                setLoading(false);
            }
        };

        fetchTickets();
    }, [eventId]);

    const saveTicket = async (ticketData: Omit<Ticket, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "tickets"), ticketData);
            return docRef; // Devuelve el docRef que contiene la ID del ticket creado
        } catch (error) {
            console.error('Error saving ticket:', error);
            alert('Failed to save ticket.');
        }
    };

    return { tickets, loading, error, saveTicket };
};

export default useTicket;