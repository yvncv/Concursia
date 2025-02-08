// useParticipant.ts
'use client';

import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { Participant } from '../types/participantType';

const useParticipant = (participantId: string) => {
    const [participant, setParticipant] = useState<Participant | null>(null);
    const [loadingParticipant, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchParticipant = async () => {
            try {
                const participantDoc = await getDoc(doc(db, "participants", participantId));
                if (participantDoc.exists()) {
                    setParticipant(participantDoc.data() as Participant);
                } else {
                    setParticipant(null);
                }
            } catch (err) {
                console.error("Error fetching participant:", err);
                setError("Failed to fetch participant");
            } finally {
                setLoading(false);
            }
        };

        fetchParticipant();
    }, [participantId]);

    return { participant, loadingParticipant, error };
};

export default useParticipant;