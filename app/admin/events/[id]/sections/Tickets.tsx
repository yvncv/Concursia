import React, { useState, useEffect } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import useTicket from '@/app/hooks/useTicket';
import useUsers from '@/app/hooks/useUsers';
import { Ticket } from '@/app/types/ticketType';
import { User } from '@/app/types/userType';
import { CircleX } from "lucide-react";
import DeleteTicket from "@/app/organizer/events/[id]/sections/ticketsModules/deleteTicket";
import ConfirmTicket from "@/app/organizer/events/[id]/sections/ticketsModules/confirmTicket";

interface TicketsProps {
    event: CustomEvent;
}

const Tickets: React.FC<TicketsProps> = ({ event }) => {
    const { tickets, loading, error,fetchTickets} = useTicket(event.id);
    const { getUserById } = useUsers();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        setFilteredTickets(tickets);
    }, [tickets]);

    const openModal = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);

        if (ticket.level === 'Individual' || ticket.level === 'Seriado') {
            const user1 = await getUserById(ticket.usersId[0]);
            setUsers([user1].filter(Boolean) as User[]);
        } else {
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

    const toggleFilterMenu = () => {
        setIsFilterMenuOpen(!isFilterMenuOpen);
    };

    const filterTickets = (filter: string, criteria: string) => {
        if (criteria === 'Todos') {
            setFilteredTickets(tickets);
        } else {
            if (filter === 'levels') {
                const filtered = tickets.filter(ticket => ticket.level === criteria);
                setFilteredTickets(filtered);
            }
            if (filter === 'categories') {
                const filtered = tickets.filter(ticket => ticket.category === criteria);
                setFilteredTickets(filtered);
            }
            if (filter === 'status') {
                const filtered = tickets.filter(ticket => ticket.status === criteria);
                setFilteredTickets(filtered);
            }
        }
        setIsFilterMenuOpen(false);
    };

    const handleDeleteTicket = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsDeleteModalOpen(true);
    };

    const handleConfirmTicket = async (ticket: Ticket) => {
        setSelectedTicket(ticket);
        setIsConfirmModalOpen(true);
    };

    const handleModalClose = () => {
        setIsDeleteModalOpen(false);
        setIsConfirmModalOpen(false);
        closeModal();
        fetchTickets();
    };

    if (loading) { return <div className="p-6">Loading...</div>; }
    if (error) { return <div className="p-6 text-red-500">{error}</div>; }

    const headers: string[] = ["ID", "Modalidad", "Categoría", "Fecha de Registro", "Estado", "Acciones"];
    const levels: string[] = ["Todos", "Seriado", "Individual", "Novel Novel", "Novel Abierto", "Novel Abierto A", "Novel Abierto B", "Nacional"];
    const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];
    const status: string[] = ["Pendiente", "Pagado"];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tickets del Evento</h1>
            <button onClick={toggleFilterMenu} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">Filtrar Tickets</button>
            {isFilterMenuOpen && (
                <div className="mb-4 p-4 bg-gray-100 rounded shadow flex">
                    <div className="flex-1">
                        {levels.map(level => (
                            <button onClick={() => filterTickets('levels', level)}
                                    className="block w-full text-left px-4 py-2" key={level}>
                                {level}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        {categories.map(category => (
                            <button onClick={() => filterTickets('categories', category)}
                                    className="block w-full text-left px-4 py-2" key={category}>
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        {status.map(state => (
                            <button onClick={() => filterTickets('status', state)}
                                    className="block w-full text-left px-4 py-2" key={state}>
                                {state}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            <div className="overflow-x-auto rounded-xl">
                <table className="w-full border-collapse">
                    <thead className="bg-gray-100 dark:bg-gray-700">
                    <tr>
                        {headers.map((header) => (
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
                    {filteredTickets.map((ticket) => (
                        <tr key={ticket.id}>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.id}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.level}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.category}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.registrationDate.toDate().toLocaleDateString()}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">{ticket.status}</td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                <button className="text-blue-500 hover:underline"
                                        onClick={() => openModal(ticket)}>Detalles
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg">
                        <div className="flex justify-between mt-4">
                            <h2 className="text-xl font-bold mb-4">Detalles del Ticket</h2>
                            <div>
                                <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                    <CircleX size={40} className="text-blue-500 hover:text-red-600 transition-colors"/>
                                </button>
                            </div>
                        </div>

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
                                <td className="px-4 py-2">{selectedTicket.registrationDate.toDate().toLocaleString()}</td>
                            </tr>
                            <tr>
                                <td className="px-4 py-2 font-semibold">Fecha de Pago:</td>
                                <td className="px-4 py-2">
                                    {selectedTicket.paymentDate ? selectedTicket.paymentDate.toDate().toLocaleString() : 'No disponible'}
                                </td>
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
                                            <div key={user?.id}>{user?.dni} {user?.firstName} {user?.lastName}</div>
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
                        <div className="flex justify-between mt-4">
                            <button className="text-blue-500 hover:underline"></button>
                            {selectedTicket.status === 'Pendiente' && (
                            <div>

                                    <button className="bg-green-500 rounded-xl p-4 text-white hover:underline ml-2"
                                            onClick={() => handleConfirmTicket(selectedTicket)}
                                    >Confirmar</button>
                                <button className="bg-red-500 rounded-xl p-4 text-white hover:underline ml-2"
                                        onClick={() => handleDeleteTicket(selectedTicket)}
                                >Eliminar</button>
                            </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <DeleteTicket
                isOpen={isDeleteModalOpen}
                onClose={() => { handleModalClose(); }}
                ticket={selectedTicket!} // Use non-null assertion operator
            />
            <ConfirmTicket
                isOpen={isConfirmModalOpen}
                onClose={() => { handleModalClose(); }}
                ticket={selectedTicket!} // Use non-null assertion operator
            />
        </div>
    );
};

export default Tickets;