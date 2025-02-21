import React, { useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import useTicket from '@/app/hooks/useTicket';
import useUsers from '@/app/hooks/useUsers';
import { Ticket } from '@/app/types/ticketType';
import { User } from '@/app/types/userType';

interface TicketsProps {
    event: CustomEvent;
}

const Tickets: React.FC<TicketsProps> = ({ event }) => {
    const { tickets, loading, error } = useTicket(event.id);
    const { getUserById } = useUsers();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);

    const openModal = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);

        if(ticket.level === 'Individual'|| ticket.level === 'Seriado'){
            const user1 = await getUserById(ticket.usersId[0]);
            setUsers([user1].filter(Boolean) as User[]);

        }else {
            const user1 = await getUserById(ticket.usersId[0]);
            const user2 = await getUserById(ticket.usersId[1]);
            setUsers([user1, user2].filter(Boolean) as User[]);
        }
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setIsModalOpen(false);
        setUsers([]);
    };

    if (loading) {
        return <div className="p-6">Loading...</div>;
    }

    if (error) {
        return <div className="p-6 text-red-500">{error}</div>;
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tickets del Evento</h1>
            <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {["ID", "Modalidad", "Categoría", "Fecha de Registro", "Estado", "Acciones"].map((header) => (
                            <th
                                key={header}
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600"
                            >
                                {header}
                            </th>
                        ))}
                    </tr>
                    </thead>
                    <tbody>
                    {tickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.id}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.level}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.category}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.registrationDate.toDate().toLocaleDateString()}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.status}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                <button className="text-gray-500 hover:underline" onClick={() => openModal(ticket)}>Detalles</button>
                                <button className="text-blue-500 hover:underline ml-2">Editar</button>
                                <button className="text-red-500 hover:underline ml-2">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <h2 className="text-xl font-bold mb-4">Detalles del Ticket</h2>
                        <table className="w-full border-collapse">
                            <tbody>
                            <tr>
                                <td className="px-4 py-2 font-semibold">ID:</td>
                                <td className="px-4 py-2">{selectedTicket.id}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Modalidad:</td>
                                <td className="px-4 py-2">{selectedTicket.level}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Categoría:</td>
                                <td className="px-4 py-2">{selectedTicket.category}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Fecha de Registro:</td>
                                <td className="px-4 py-2">{selectedTicket.registrationDate.toDate().toLocaleDateString()}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Estado:</td>
                                <td className="px-4 py-2">{selectedTicket.status}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Participantes:</td>
                                <td className="px-4 py-2">
                                    <div className="space-y-2">
                                        {users.map(user => (
                                            <div key={user.id}>{user.dni} {user.firstName} {user.lastName}</div>

                                        ))}
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Academias:</td>
                                <td className="px-4 py-2">
                                    <div className="space-y-2">
                                        <div>{selectedTicket.academiesName.map((academy, index) => (
                                            <div key={index}>{academy}</div>
                                        ))}</div>
                                    </div>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <button className="mt-4 text-blue-500 hover:underline" onClick={closeModal}>Cerrar</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Tickets;