// useTicket.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc, addDoc, collection } from 'firebase/firestore';
import { Ticket } from '../types/ticketType';

const useTicket = (ticketId: string) => {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [loadingTicket, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!ticketId) {
            setLoading(false);
            return;
        }

        const fetchTicket = async () => {
            try {
                const ticketDoc = await getDoc(doc(db, "tickets", ticketId));
                if (ticketDoc.exists()) {
                    setTicket(ticketDoc.data() as Ticket);
                } else {
                    setTicket(null);
                }
            } catch (err) {
                console.error("Error fetching ticket:", err);
                setError("Failed to fetch ticket");
            } finally {
                setLoading(false);
            }
        };

        fetchTicket();
    }, [ticketId]);

    const saveTicket = async (ticketData: Omit<Ticket, 'id'>) => {
        try {
            const docRef = await addDoc(collection(db, "tickets"), ticketData);
            return docRef; // Devuelve el docRef que contiene la ID del ticket creado
        } catch (error) {
            console.error('Error saving ticket:', error);
            alert('Failed to save ticket.');
        }
    };

    return { ticket, loadingTicket, error, saveTicket };
};

export default useTicket;