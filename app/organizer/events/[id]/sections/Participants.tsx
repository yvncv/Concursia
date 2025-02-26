import React, { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Participant } from '@/app/types/participantType';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

interface ParticipantsProps {
    event: CustomEvent;
}

const Participants: React.FC<ParticipantsProps> = ({ event }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);

    useEffect(() => {
        const fetchParticipants = async () => {
            const q = query(collection(db, 'participants'), where('eventId', '==', event.id));
            const querySnapshot = await getDocs(q);
            const participantsList: Participant[] = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Participant));
            setParticipants(participantsList);
        };

        fetchParticipants();
    }, [event.id]);

    const headers: string[] = ["Número","Categoría", "Modalidad", "Estado", "Fase"];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Participantes del Evento</h1>
            <div className="bg-white p-4 shadow-md rounded-lg mt-4">
                <h2 className="text-lg font-semibold mb-4">Lista de Participantes</h2>
                {participants.length > 0 ? (
                    <table className="min-w-full bg-white border border-gray-300 ">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr className="bg-gray-100">
                            {headers.map((header) => (
                                <th
                                    key={header}
                                    className="py-2 px-4 border"
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {participants.map(participant => (
                            <tr key={participant.id} className="hover:bg-gray-50">
                                <td className="border px-4 py-2">{participant.code}</td>
                                <td className="border px-4 py-2">{participant.category}</td>
                                <td className="border px-4 py-2">{participant.level}</td>
                                <td className="border px-4 py-2">{participant.status}</td>
                                <td className="border px-4 py-2">{participant.phase}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <p>No hay participantes registrados para este evento.</p>
                )}
            </div>
        </div>
    );
};

export default Participants;