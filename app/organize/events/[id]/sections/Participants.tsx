import React, { useEffect, useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Participant } from '@/app/types/participantType';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from "@/app/hooks/useUsers";
import useAcademies from "@/app/hooks/useAcademies";
import { User } from "@/app/types/userType";
import { Ticket } from "@/app/types/ticketType";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Componentes separados
import ParticipantsStats from "./participantsModules/ParticipantsStats";
import ParticipantsSearch, { ParticipantFilterOptions } from "./participantsModules/ParticipantsSearchAndFilters";
import ParticipantsTable from "./participantsModules/ParticipantsTable";
import ParticipantDetailModal from "./participantsModules/modals/ParticipantDetailModal";
import ParticipantFilterModal from "./participantsModules/modals/ParticipantFilterModal";

// Interfaces
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

interface AvailableFilters {
    levels: string[];
    categories: string[];
    academies: string[];
    statuses: string[];
    phases: string[];
}

// Componente de Paginación
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
                                    ? 'bg-purple-600 text-white font-medium'
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

// Componente Principal
const Participants: React.FC<ParticipantsProps> = ({ event }) => {
    // ==================== ESTADOS ====================
    
    // Estados de datos
    const [allParticipants, setAllParticipants] = useState<ParticipantRow[]>([]);
    const [filteredParticipants, setFilteredParticipants] = useState<ParticipantRow[]>([]);
    const [academyNames, setAcademyNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    // Estados de UI
    const [selectedParticipant, setSelectedParticipant] = useState<ParticipantRow | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Estados de modales
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

    // Estados de paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [participantsPerPage] = useState(10);

    // Estados de filtros
    const [availableFilters, setAvailableFilters] = useState<AvailableFilters>({
        levels: [],
        categories: [],
        academies: [],
        statuses: [],
        phases: []
    });

    const [activeFilters, setActiveFilters] = useState<ParticipantFilterOptions>({
        levels: [],
        categories: [],
        academies: [],
        statuses: [],
        phases: []
    });

    // ==================== HOOKS ====================
    const { getUserById } = useUsers();
    const { academies } = useAcademies();

    // ==================== EFFECTS ====================
    
    // Cargar participantes al montar el componente
    useEffect(() => {
        fetchParticipants();
    }, [event.id]);

    // Crear mapa de nombres de academias
    useEffect(() => {
        if (academies.length) {
            const academyMap: Record<string, string> = {};
            academies.forEach((academy) => {
                academyMap[academy.id] = academy.name;
            });
            setAcademyNames(academyMap);
        }
    }, [academies]);

    // Aplicar filtros y búsqueda cuando cambian
    useEffect(() => {
        applyFiltersAndSearch();
    }, [searchTerm, allParticipants, activeFilters, academyNames]);

    // Resetear página cuando cambian los resultados filtrados
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredParticipants]);

    // ==================== FUNCIONES DE DATOS ====================

    const fetchParticipants = async () => {
        try {
            setLoading(true);
            
            // Obtener participantes del evento
            const participantsQuery = query(
                collection(db, 'participants'), 
                where('eventId', '==', event.id)
            );
            const querySnapshot = await getDocs(participantsQuery);

            // Procesar cada participante
            const participantRows: ParticipantRow[] = await Promise.all(
                querySnapshot.docs.map(async (docSnapshot) => {
                    const participant = {
                        id: docSnapshot.id,
                        ...docSnapshot.data()
                    } as Participant;

                    // Obtener usuarios del participante
                    const users = await Promise.all(
                        participant.usersId.map(userId => getUserById(userId))
                    );
                    const validUsers = users.filter(Boolean) as User[];

                    // Obtener ticket asociado (si existe)
                    let ticket: Ticket | null = null;
                    if (participant.ticketId) {
                        try {
                            const ticketDoc = await getDoc(doc(db, 'tickets', participant.ticketId));
                            if (ticketDoc.exists()) {
                                ticket = { id: ticketDoc.id, ...ticketDoc.data() } as Ticket;
                            }
                        } catch (error) {
                            console.warn(`Ticket ${participant.ticketId} no encontrado`);
                        }
                    }

                    return {
                        participant,
                        users: validUsers,
                        ticket
                    };
                })
            );

            setAllParticipants(participantRows);
            
        } catch (error) {
            console.error("Error al cargar participantes:", error);
        } finally {
            setLoading(false);
        }
    };

    const extractFilterValues = (participantsList: ParticipantRow[]) => {
        const levels = new Set<string>();
        const categories = new Set<string>();
        const academies = new Set<string>();
        const statuses = new Set<string>();
        const phases = new Set<string>();

        participantsList.forEach(({ participant }) => {
            // Extraer valores únicos
            if (participant.level) levels.add(participant.level);
            if (participant.category) categories.add(participant.category);
            if (participant.status) statuses.add(participant.status);
            if (participant.phase) phases.add(participant.phase);

            // Extraer academias (registradas)
            if (participant.academiesId?.length > 0) {
                participant.academiesId.forEach(academyId => {
                    const academyName = academyNames[academyId];
                    if (academyName) academies.add(academyName);
                });
            }

            // TODO: Agregar academiesName cuando esté disponible
            // if (participant.academiesName?.length > 0) {
            //     participant.academiesName.forEach(name => {
            //         if (name?.trim()) academies.add(name.trim());
            //     });
            // }

            // Categoría "Libre" para participantes sin academia
            if (!participant.academiesId?.length) {
                academies.add("Libre");
            }
        });

        setAvailableFilters({
            levels: Array.from(levels).sort(),
            categories: Array.from(categories).sort(),
            academies: Array.from(academies).sort(),
            statuses: Array.from(statuses).sort(),
            phases: Array.from(phases).sort()
        });
    };

    const applyFiltersAndSearch = () => {
        let filtered = [...allParticipants];

        // ===== APLICAR FILTROS =====
        const hasActiveFilters = Object.values(activeFilters).some(arr => arr.length > 0);
        
        if (hasActiveFilters) {
            filtered = filtered.filter(({ participant }) => {
                // Filtro por modalidad
                const levelMatch = activeFilters.levels.length === 0 || 
                                 activeFilters.levels.includes(participant.level);

                // Filtro por categoría
                const categoryMatch = activeFilters.categories.length === 0 || 
                                    activeFilters.categories.includes(participant.category);

                // Filtro por estado
                const statusMatch = activeFilters.statuses.length === 0 || 
                                  activeFilters.statuses.includes(participant.status);

                // Filtro por fase
                const phaseMatch = activeFilters.phases.length === 0 || 
                                 activeFilters.phases.includes(participant.phase);

                // Filtro por academia
                const academyMatch = activeFilters.academies.length === 0 || (() => {
                    // Verificar academias registradas
                    if (participant.academiesId?.length > 0) {
                        return participant.academiesId.some(academyId => {
                            const academyName = academyNames[academyId];
                            return academyName && activeFilters.academies.includes(academyName);
                        });
                    }

                    // TODO: Verificar academiesName cuando esté disponible
                    // if (participant.academiesName?.length > 0) {
                    //     return participant.academiesName.some(name => 
                    //         activeFilters.academies.includes(name)
                    //     );
                    // }

                    // Incluir "Libre" si aplica
                    return activeFilters.academies.includes("Libre");
                })();

                return levelMatch && categoryMatch && statusMatch && phaseMatch && academyMatch;
            });
        }

        // ===== APLICAR BÚSQUEDA =====
        if (searchTerm.trim()) {
            const searchLower = searchTerm.toLowerCase();
            filtered = filtered.filter(({ participant, users }) => {
                // Buscar en código del participante
                const codeMatch = participant.code?.toLowerCase().includes(searchLower);

                // Buscar en datos de usuarios
                const userMatch = users.some(user => {
                    const dniMatch = user?.dni?.toLowerCase().includes(searchLower);
                    const nameMatch = `${user?.firstName} ${user?.lastName}`.toLowerCase().includes(searchLower);
                    return dniMatch || nameMatch;
                });

                // Buscar en categoría
                const categoryMatch = participant.category?.toLowerCase().includes(searchLower);

                return codeMatch || userMatch || categoryMatch;
            });
        }

        setFilteredParticipants(filtered);
        
        // Extraer valores de filtros de todos los participantes (no filtrados)
        if (allParticipants.length > 0 && academyNames && Object.keys(academyNames).length > 0) {
            extractFilterValues(allParticipants);
        }
    };

    // ==================== HANDLERS ====================

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
    };

    const handleClearSearch = () => {
        setSearchTerm("");
    };

    const handleOpenFilters = () => {
        setIsFilterModalOpen(true);
    };

    const handleApplyFilters = (filters: ParticipantFilterOptions) => {
        setActiveFilters(filters);
    };

    const handleClearAllFilters = () => {
        setActiveFilters({
            levels: [],
            categories: [],
            academies: [],
            statuses: [],
            phases: []
        });
    };

    const handleViewParticipant = (participantRow: ParticipantRow) => {
        setSelectedParticipant(participantRow);
        setIsDetailModalOpen(true);
    };

    const handleCloseModal = () => {
        setSelectedParticipant(null);
        setIsDetailModalOpen(false);
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
    };

    // ==================== CÁLCULOS DE PAGINACIÓN ====================
    const indexOfLastParticipant = currentPage * participantsPerPage;
    const indexOfFirstParticipant = indexOfLastParticipant - participantsPerPage;
    const currentParticipants = filteredParticipants.slice(indexOfFirstParticipant, indexOfLastParticipant);
    const totalPages = Math.ceil(filteredParticipants.length / participantsPerPage);

    // ==================== LOADING STATE ====================
    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 p-6">
                <div className="max-w-7xl mx-auto">
                    <div className="animate-pulse space-y-6">
                        {/* Header skeleton */}
                        <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                        
                        {/* Stats skeleton */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="bg-white rounded-lg shadow p-4">
                                    <div className="flex items-center justify-between">
                                        <div className="space-y-2">
                                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                                            <div className="h-6 bg-gray-200 rounded w-16"></div>
                                        </div>
                                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {/* Search skeleton */}
                        <div className="bg-white rounded-lg shadow p-4">
                            <div className="h-10 bg-gray-200 rounded"></div>
                        </div>
                        
                        {/* Table skeleton */}
                        <div className="bg-white rounded-lg shadow">
                            <div className="p-6 space-y-4">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="h-16 bg-gray-100 rounded"></div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // ==================== RENDER ====================
    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-6">
                    Participantes del Evento
                </h1>

                {/* Estadísticas */}
                <ParticipantsStats participants={filteredParticipants} />

                {/* Búsqueda y Filtros */}
                <ParticipantsSearch
                    searchTerm={searchTerm}
                    onSearchChange={handleSearchChange}
                    onClearSearch={handleClearSearch}
                    onOpenFilters={handleOpenFilters}
                    activeFilters={activeFilters}
                    onClearAllFilters={handleClearAllFilters}
                    totalResults={filteredParticipants.length}
                />

                {/* Tabla de Participantes */}
                <ParticipantsTable
                    participants={currentParticipants}
                    onViewParticipant={handleViewParticipant}
                />

                {/* Información de Paginación y Controles */}
                {filteredParticipants.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {/* Info de paginación */}
                        <div className="text-center text-sm text-gray-600">
                            Mostrando {indexOfFirstParticipant + 1} - {Math.min(indexOfLastParticipant, filteredParticipants.length)} de {filteredParticipants.length} participantes
                            {searchTerm && ` (filtrados de ${allParticipants.length} total)`}
                        </div>
                        
                        {/* Controles de paginación */}
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={handlePageChange}
                        />
                    </div>
                )}
            </div>

            {/* ==================== MODALES ==================== */}
            
            {/* Modal de Detalles */}
            <ParticipantDetailModal
                isOpen={isDetailModalOpen}
                onClose={handleCloseModal}
                participantRow={selectedParticipant}
            />

            {/* Modal de Filtros */}
            <ParticipantFilterModal
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApplyFilters={handleApplyFilters}
                availableFilters={availableFilters}
                currentFilters={activeFilters}
            />
        </div>
    );
};

export default Participants;