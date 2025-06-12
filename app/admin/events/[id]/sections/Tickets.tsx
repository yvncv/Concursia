import React, { useState, useEffect } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import useTicket from '@/app/hooks/useTicket';
import useUsers from '@/app/hooks/useUsers';
import { Ticket } from '@/app/types/ticketType';
import { User } from '@/app/types/userType';
import { CircleX } from "lucide-react";
import DeleteTicket from "@/app/organize/events/[id]/sections/ticketsModules/deleteTicket";
import ConfirmTicket from "@/app/organize/events/[id]/sections/ticketsModules/confirmTicket";

interface TicketsProps {
    event: CustomEvent;
}

const Tickets: React.FC<TicketsProps> = ({ event }) => {
    const { tickets, loading, error, fetchTickets } = useTicket(event.id);
    const { getUserById } = useUsers();
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [selectedEntryIndex, setSelectedEntryIndex] = useState<number>(0);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [users, setUsers] = useState<User[]>([]);
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

    useEffect(() => {
        setFilteredTickets(tickets);
    }, [tickets]);

    const openModal = async (ticket: Ticket, entryIndex: number = 0) => {
        setSelectedTicket(ticket);
        setSelectedEntryIndex(entryIndex);
        setIsModalOpen(true);

        // Obtener usuarios de la entry específica
        const entry = ticket.entries[entryIndex];
        if (entry) {
            const usersPromises = entry.usersId.map(userId => getUserById(userId));
            const usersResults = await Promise.all(usersPromises);
            setUsers(usersResults.filter(Boolean) as User[]);
        }
    };

    const closeModal = () => {
        setSelectedTicket(null);
        setSelectedEntryIndex(0);
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
                const filtered = tickets.filter(ticket => 
                    ticket.entries.some(entry => entry.level === criteria)
                );
                setFilteredTickets(filtered);
            }
            if (filter === 'categories') {
                const filtered = tickets.filter(ticket => 
                    ticket.entries.some(entry => entry.category === criteria)
                );
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

    // Helper para obtener el primer level de las entries
    const getFirstLevel = (ticket: Ticket): string => {
        return ticket.entries[0]?.level || 'N/A';
    };

    // Helper para obtener la primera categoría de las entries
    const getFirstCategory = (ticket: Ticket): string => {
        return ticket.entries[0]?.category || 'N/A';
    };

    if (loading) { return <div className="p-6">Loading...</div>; }
    if (error) { return <div className="p-6 text-red-500">{error}</div>; }

    const headers: string[] = ["ID", "Modalidad", "Categoría", "Entries", "Fecha de Registro", "Estado", "Acciones"];
    const levels: string[] = ["Todos", "seriado", "individual", "novel novel", "novel abierto", "novel abierto a", "novel abierto b", "nacional"];
    const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];
    const status: string[] = ["Pendiente", "Pagado"];

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Tickets del Evento</h1>
            <button onClick={toggleFilterMenu} className="mb-4 px-4 py-2 bg-blue-500 text-white rounded">
                Filtrar Tickets
            </button>
            
            {isFilterMenuOpen && (
                <div className="mb-4 p-4 bg-gray-100 rounded shadow flex">
                    <div className="flex-1">
                        <h3 className="font-bold mb-2">Modalidades</h3>
                        {levels.map(level => (
                            <button 
                                onClick={() => filterTickets('levels', level)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded" 
                                key={level}
                            >
                                {level}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-2">Categorías</h3>
                        {categories.map(category => (
                            <button 
                                onClick={() => filterTickets('categories', category)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded" 
                                key={category}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold mb-2">Estados</h3>
                        {status.map(state => (
                            <button 
                                onClick={() => filterTickets('status', state)}
                                className="block w-full text-left px-4 py-2 hover:bg-gray-200 rounded" 
                                key={state}
                            >
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
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                {ticket.id.substring(0, 8)}...
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                {getFirstLevel(ticket)}
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                {getFirstCategory(ticket)}
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                                    {ticket.entries.length} entry(s)
                                </span>
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                {ticket.registrationDate.toDate().toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                <span className={`px-2 py-1 rounded text-xs ${
                                    ticket.status === 'Pagado' ? 'bg-green-100 text-green-800' :
                                    ticket.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {ticket.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 border-b dark:border-gray-600">
                                <button 
                                    className="text-blue-500 hover:underline"
                                    onClick={() => openModal(ticket, 0)}
                                >
                                    Detalles
                                </button>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {isModalOpen && selectedTicket && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Detalles del Ticket</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                                <CircleX size={24} className="text-blue-500 hover:text-red-600 transition-colors"/>
                            </button>
                        </div>

                        {/* Información general del ticket */}
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                            <h3 className="font-bold text-lg mb-2">Información General</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <span className="font-semibold">ID:</span> {selectedTicket.id}
                                </div>
                                <div>
                                    <span className="font-semibold">Estado:</span> {selectedTicket.status}
                                </div>
                                <div>
                                    <span className="font-semibold">Fecha de Registro:</span> {selectedTicket.registrationDate.toDate().toLocaleString()}
                                </div>
                                <div>
                                    <span className="font-semibold">Fecha de Pago:</span> {
                                        selectedTicket.paymentDate ? selectedTicket.paymentDate.toDate().toLocaleString() : 'No disponible'
                                    }
                                </div>
                                <div>
                                    <span className="font-semibold">Monto Total:</span> S/ {selectedTicket.totalAmount}
                                </div>
                                <div>
                                    <span className="font-semibold">Tipo:</span> {selectedTicket.inscriptionType}
                                </div>
                            </div>
                        </div>

                        {/* Entries del ticket */}
                        <div className="mb-6">
                            <h3 className="font-bold text-lg mb-2">Inscripciones (Entries)</h3>
                            <div className="space-y-4">
                                {selectedTicket.entries.map((entry, index) => (
                                    <div key={index} className="border rounded-lg p-4">
                                        <div className="flex justify-between items-center mb-2">
                                            <h4 className="font-semibold">Entry #{index + 1}</h4>
                                            <button
                                                onClick={() => setSelectedEntryIndex(index)}
                                                className={`px-3 py-1 rounded text-sm ${
                                                    selectedEntryIndex === index 
                                                        ? 'bg-blue-500 text-white' 
                                                        : 'bg-gray-200 text-gray-700'
                                                }`}
                                            >
                                                {selectedEntryIndex === index ? 'Seleccionada' : 'Seleccionar'}
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div>
                                                <span className="font-medium">Modalidad:</span> {entry.level}
                                            </div>
                                            <div>
                                                <span className="font-medium">Categoría:</span> {entry.category}
                                            </div>
                                            <div>
                                                <span className="font-medium">Monto:</span> S/ {entry.amount}
                                            </div>
                                            <div>
                                                <span className="font-medium">Participantes:</span> {entry.usersId.length}
                                            </div>
                                        </div>
                                        <div className="mt-2">
                                            <span className="font-medium">Academias:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {entry.academiesName?.map((academy, acadIndex) => (
                                                    <span 
                                                        key={acadIndex} 
                                                        className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded"
                                                    >
                                                        {academy}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Participantes de la entry seleccionada */}
                        <div className="mb-6">
                            <h3 className="font-bold text-lg mb-2">
                                Participantes de Entry #{selectedEntryIndex + 1}
                            </h3>
                            <div className="space-y-2">
                                {users.map(user => (
                                    <div key={user?.id} className="p-3 bg-gray-50 rounded">
                                        <div className="font-medium">{user?.firstName} {user?.lastName}</div>
                                        <div className="text-sm text-gray-600">DNI: {user?.dni}</div>
                                        <div className="text-sm text-gray-600">Email: {user?.email[0]}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex justify-between">
                            <div></div>
                            {selectedTicket.status === 'Pendiente' && (
                                <div className="space-x-2">
                                    <button 
                                        className="bg-green-500 hover:bg-green-600 rounded-xl px-4 py-2 text-white transition-colors"
                                        onClick={() => handleConfirmTicket(selectedTicket)}
                                    >
                                        Confirmar
                                    </button>
                                    <button 
                                        className="bg-red-500 hover:bg-red-600 rounded-xl px-4 py-2 text-white transition-colors"
                                        onClick={() => handleDeleteTicket(selectedTicket)}
                                    >
                                        Eliminar
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <DeleteTicket
                isOpen={isDeleteModalOpen}
                onClose={handleModalClose}
                ticket={selectedTicket!}
            />
            <ConfirmTicket
                isOpen={isConfirmModalOpen}
                onClose={handleModalClose}
                ticket={selectedTicket!}
            />
        </div>
    );
};

export default Tickets;