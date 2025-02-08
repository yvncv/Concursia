// useParticipants.ts
import { useState, useEffect } from 'react';
import { db } from '../firebase/config';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { Participant } from '../types/participantType';

const useParticipants = () => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [loadingParticipants, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const q = query(collection(db, "participants"));

        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const participantsData = querySnapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data(),
            })) as Participant[];

            setParticipants(participantsData);
            setLoading(false);
        }, (err) => {
            console.error("Error fetching participants:", err);
            setError("Failed to fetch participants");
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return { participants, loadingParticipants, error };
};

export default useParticipants;