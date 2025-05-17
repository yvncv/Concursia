import React, { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Participant } from '@/app/types/participantType';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from "@/app/hooks/useUsers";
import { User } from "@/app/types/userType";
import { Ticket } from "@/app/types/ticketType";
import {
    Search,
    Filter,
    Eye,
    Trophy,
    Users,
    XCircle,
    CheckCircle,
    Tag,
    CreditCard,
    Calendar,
    ListRestart,
    ChevronLeft,
    ChevronRight,
    UserCircle
} from "lucide-react";
import InfoUser from '@/app/ui/info-user/InfoUser';

interface ParticipantsProps {
    event: CustomEvent;
}

interface ParticipantRow {
    participant: Participant;
    users: User[];
    ticket?: Ticket | null;
}

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
    const getPageNumbers = () => {
        const delta = 2;
        const range = [];
        const rangeWithDots = [];
        let l;

        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || i >= currentPage - delta && i <= currentPage + delta) {
                range.push(i);
            }
        }

        range.forEach((i) => {
            if (l) {
                if (i - l === 2) {
                    rangeWithDots.push(l + 1);
                } else if (i - l !== 1) {
                    rangeWithDots.push('...');
                }
            }
            rangeWithDots.push(i);
            l = i;
        });

        return rangeWithDots;
    };

    if (totalPages <= 1) return null;

    return (
        <div className="flex items-center justify-center gap-2 mt-6">
            <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg transition-colors ${currentPage === 1
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <ChevronLeft className="w-5 h-5" />
            </button>

            {getPageNumbers().map((number, index) => (
                <React.Fragment key={index}>
                    {number === '...' ? (
                        <span className="px-3 py-2 text-gray-500">...</span>
                    ) : (
                        <button
                            onClick={() => onPageChange(number as number)}
                            className={`min-w-[40px] h-10 rounded-lg transition-colors ${currentPage === number
                                    ? 'bg-blue-600 text-white font-medium'
                                    : 'text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {number}
                        </button>
                    )}
                </React.Fragment>
            ))}

            <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
                        ? 'text-gray-400 cursor-not-allowed'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
            >
                <ChevronRight className="w-5 h-5" />
            </button>
        </div>
    );
};

const Participants: React.FC<ParticipantsProps> = ({ event }) => {
    const [participants, setParticipants] = useState<ParticipantRow[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<ParticipantRow[]>([]);
    const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { getUserById } = useUsers();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [participantsPerPage] = useState(10);

    useEffect(() => {
        fetchParticipants();
    }, [event.id]);

    useEffect(() => {
        filterParticipants();
    }, [searchTerm, participants]);

    // Reset page when filtering
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredParticipants]);

    const calculateAge = (birthDate: any): number => {
        const birth = birthDate.toDate();
        const today = new Date();
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();

        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }

        return age;
    };

    const fetchParticipants = async () => {
        try {
            const q = query(collection(db, 'participants'), where('eventId', '==', event.id));
            const querySnapshot = await getDocs(q);

            const participantRows: ParticipantRow[] = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
                    const participant = {
                        id: docSnapshot.id,
                        ...docSnapshot.data()
                    } as Participant;

                    // Obtener usuarios
                    const users = await Promise.all(
                        participant.usersId.map(userId => getUserById(userId))
                    );
                    const validUsers = users.filter(Boolean) as User[];

                    // Obtener ticket si existe
                    let ticket: Ticket | null = null;
                    if (participant.ticketId) {
                        const ticketDoc = await getDoc(doc(db, 'tickets', participant.ticketId));
                        if (ticketDoc.exists()) {
                            ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
                        }
                    }

                    return {
                        participant,
                        users: validUsers,
                        ticket
                    };
                })
            );

            setParticipants(participantRows);
            setFilteredParticipants(participantRows);
        } catch (error) {
            console.error("Error fetching participants:", error);
        } finally {
            setLoading(false);
        }
    };

    const filterParticipants = () => {
        if (!searchTerm.trim()) {
            setFilteredParticipants(participants);
            return;
        }

        const term = searchTerm.toLowerCase();
        const filtered = participants.filter(row =>
            row.participant.code.toLowerCase().includes(term) ||
            row.users.some(user =>
                user.dni.toLowerCase().includes(term) ||
                `${user.firstName} ${user.lastName}`.toLowerCase().includes(term)
            ) ||
            row.participant.category.toLowerCase().includes(term)
        );

        setFilteredParticipants(filtered);
    };

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, string> = {
            pagado: 'bg-green-100 text-green-800',
            ingresado: 'bg-blue-100 text-blue-800',
            en_tunel: 'bg-yellow-100 text-yellow-800',
            bailando: 'bg-purple-100 text-purple-800',
            evaluado: 'bg-indigo-100 text-indigo-800',
            clasificado: 'bg-emerald-100 text-emerald-800',
            eliminado: 'bg-red-100 text-red-800',
            ganador: 'bg-orange-100 text-orange-800',
            default: 'bg-gray-100 text-gray-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.default}`}>
                {status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ')}
            </span>
        );
    };


    const getPhaseBadge = (phase: string) => {
        const phaseColors = {
            initial: 'bg-blue-100 text-blue-800',
            semifinals: 'bg-purple-100 text-purple-800',
            finals: 'bg-yellow-100 text-yellow-800'
        };

        return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${phaseColors[phase] || phaseColors.initial}`}>
                {phase}
            </span>
        );
    };

    const openModal = (participantRow: ParticipantRow) => {
        setSelectedParticipant(participantRow);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setSelectedParticipant(null);
        setIsModalOpen(false);
    };

    // Pagination calculations
    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
    const currentParticipants = filteredParticipants.slice(indexOfFirstParticipant, indexOfLastParticipant);
    const totalPages = Math.ceil(filteredParticipants.length / participantsPerPage);

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse">
                        <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                        <div className="bg-white rounded-lg shadow p-6">
                            <div className="h-6 bg-gray-200 rounded w-1/6 mb-4"></div>
                            <div className="space-y-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-12 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-6">Participantes del Evento</h1>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Participantes</p>
                                <p className="text-2xl font-bold text-gray-900">{participants.length}</p>
                            </div>
                            <div className="p-3 bg-blue-100 rounded-full">
                                <Users className="w-6 h-6 text-blue-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Activos</p>
                                <p className="text-2xl font-bold text-green-600">
                                    {participants.filter(p => p.participant.status === 'active').length}
                                </p>
                            </div>
                            <div className="p-3 bg-green-100 rounded-full">
                                <CheckCircle className="w-6 h-6 text-green-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">En Competencia</p>
                                <p className="text-2xl font-bold text-purple-600">
                                    {participants.filter(p => p.participant.phase !== 'initial').length}
                                </p>
                            </div>
                            <div className="p-3 bg-purple-100 rounded-full">
                                <Trophy className="w-6 h-6 text-purple-600" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Eliminados</p>
                                <p className="text-2xl font-bold text-red-600">
                                    {participants.filter(p => p.participant.status === 'eliminated').length}
                                </p>
                            </div>
                            <div className="p-3 bg-red-100 rounded-full">
                                <XCircle className="w-6 h-6 text-red-600" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="flex gap-2">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                placeholder="Buscar por código, DNI o nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        </div>

                        <button
                            onClick={() => setSearchTerm("")}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            title="Limpiar búsqueda"
                        >
                            <ListRestart className="w-5 h-5" />
                        </button>

                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <Filter className="w-5 h-5" />
                            Filtrar
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Código
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Participante(s)
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Modalidad
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentParticipants.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                                            No se encontraron participantes
                                        </td>
                                    </tr>
                                ) : (
                                    currentParticipants.map((row) => (
                                        <tr key={row.participant.id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <Tag className="w-4 h-4 mr-2 text-gray-400" />
                                                    <span className="font-mono text-sm">{row.participant.code || '-'}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="space-y-2">
                                                    {row.users.map((user, index) => (
                                                        <div key={user.id} className="flex items-center gap-3">
                                                            {user.profileImage && user.profileImage !== '' ? (
                                                                <img
                                                                    src={user.profileImage as string}
                                                                    alt={user.firstName}
                                                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                                                    onError={(e) => {
                                                                        (e.target as HTMLImageElement).src = '';
                                                                        (e.target as HTMLImageElement).className = 'hidden';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                                                    <UserCircle className="w-5 h-5 text-gray-500" />
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-2">
                                                                <div className={`w-2 h-2 rounded-full ${user.gender === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                                                                <span className="text-sm">
                                                                    {user.dni} - {user.firstName} {user.lastName}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium">{row.participant.category}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm">{row.participant.level}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {getStatusBadge(row.participant.status)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <button
                                                    onClick={() => openModal(row)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="Ver detalles"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {currentParticipants.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-200">
                            <div className="text-center text-sm text-gray-600 mb-2">
                                Mostrando {indexOfFirstParticipant + 1} - {Math.min(indexOfLastParticipant, filteredParticipants.length)} de {filteredParticipants.length} participantes
                            </div>
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={handlePageChange}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            {isModalOpen && selectedParticipant && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                    <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold">Detalles del Participante</h2>
                            <button onClick={closeModal} className="text-gray-500 hover:text-red-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="space-y-6">
                            {/* Información básica */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h3 className="text-lg font-semibold mb-3">Información General</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Código</p>
                                        <p className="font-medium">{selectedParticipant.participant.code || 'Sin código'}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Categoría</p>
                                        <p className="font-medium">{selectedParticipant.participant.category}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Modalidad</p>
                                        <p className="font-medium">{selectedParticipant.participant.level}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Estado</p>
                                        <div className="mt-1">{getStatusBadge(selectedParticipant.participant.status)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Fase</p>
                                        <div className="mt-1">{getPhaseBadge(selectedParticipant.participant.phase)}</div>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Fecha de Registro</p>
                                        <p className="font-medium">
                                            {selectedParticipant.participant.createdAt.toDate().toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Información de usuarios */}
                            <InfoUser users = {selectedParticipant.users} title={'Participante(s)'} />

                            {/* Información del ticket */}
                            {selectedParticipant.ticket && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3">Información del Ticket</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-sm text-gray-600">ID del Ticket</p>
                                            <p className="font-mono text-sm">#{selectedParticipant.ticket.id.slice(0, 8)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Estado del Ticket</p>
                                            <p className="font-medium">{selectedParticipant.ticket.status}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Tipo de Inscripción</p>
                                            <p className="font-medium">{selectedParticipant.ticket.inscriptionType}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Monto Pagado</p>
                                            <p className="font-medium">S/ {selectedParticipant.ticket.totalAmount.toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Puntajes (si existen) */}
                            {selectedParticipant.participant.scoreIds.length > 0 && (
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="text-lg font-semibold mb-3">Puntajes</h3>
                                    <p className="text-gray-600">
                                        Este participante tiene {selectedParticipant.participant.scoreIds.length} puntaje(s) registrado(s).
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Participants;