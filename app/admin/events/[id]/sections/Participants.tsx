import React, { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Participant } from '@/app/types/participantType';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import {CircleX} from "lucide-react";
import useUsers from "@/app/hooks/useUsers";
import {User} from "@/app/types/userType";

interface ParticipantsProps {
    event: CustomEvent;
}

const Participants: React.FC<ParticipantsProps> = ({ event }) => {
    const [participants, setParticipants] = useState<Participant[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { getUserById } = useUsers();
    const [users, setUsers] = useState<User[]>([]);

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

    const headers: string[] = ["Número", "Categoría", "Modalidad", "Estado", "Fase"];

    const openModal = async (participant: Participant) => {
        setSelectedParticipant(participant);
        setIsModalOpen(true);

        if (participant.level === 'Individual' || participant.level === 'Seriado') {
            const user1 = await getUserById(participant.usersId[0]);
            setUsers([user1].filter(Boolean) as User[]);
        } else {
            const user1 = await getUserById(participant.usersId[0]);
            const user2 = await getUserById(participant.usersId[1]);
            setUsers([user1, user2].filter(Boolean) as User[]);
        }
    };

    const closeModal = () => {
        setSelectedParticipant(null);
        setIsModalOpen(false);
        setUsers([]);
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Participantes del Evento</h1>
            <div className="bg-white p-4 shadow-md rounded-lg mt-4">
                <h2 className="text-lg font-semibold mb-4">Lista de Participantes</h2>
                {participants.length > 0 ? (
                    <table className="min-w-full bg-white border border-gray-300">
                        <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr className="bg-gray-100">
                            {headers.map((header) => (
                                <th key={header} className="py-2 px-4 border">
                                    {header}
                                </th>
                            ))}
                        </tr>
                        </thead>
                        <tbody>
                        {participants.map(participant => (
                            <tr key={participant.id} className="hover:bg-gray-50" >
                                <td
                                    className="border px-4 py-2 hover:text-red-600 transition-colors cursor-pointer"
                                    title="Ver más detalles"
                                    onClick={() => openModal(participant)}
                                >{participant.code}</td>
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

            {isModalOpen && selectedParticipant && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between mt-4">
                            <h2 className="text-xl font-bold mb-4 mr-40">Detalles del Participante</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <CircleX size={40} className="text-blue-500 hover:text-red-600 transition-colors"/>
                            </button>
                        </div>
                        <table className="w-full border-collapse">
                            <tbody>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Código:</td>
                                <td className="px-4 py-2">{selectedParticipant.code}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Participantes:</td>
                                <td className="px-4 py-2">
                                    <div className="space-y-2">
                                        {users.map(user => (
                                            <div key={user?.id}>{user?.dni} {user?.firstName} {user?.lastName}</div>
                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Categoría:</td>
                                <td className="px-4 py-2">{selectedParticipant.category}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Modalidad:</td>
                                <td className="px-4 py-2">{selectedParticipant.level}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Estado:</td>
                                <td className="px-4 py-2">{selectedParticipant.status}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Fase:</td>
                                <td className="px-4 py-2">{selectedParticipant.phase}</td>
                            </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Participants;