'use client';

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Calendar, MapPin, Filter, Users, Building2, Trophy, Mail, Phone, User as UserIcon, X, Menu } from "lucide-react";
import useEvents from "@/app/hooks/useEvents";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";

export default function Resultados() {
    const searchParams = useSearchParams();
    const query = searchParams.get("query") || "";
    const { events } = useEvents();
    const { academies } = useAcademies();
    const { users } = useUsers();
    const [filteredResults, setFilteredResults] = useState([]);
    const [filter, setFilter] = useState("all");
    const [organizers, setOrganizers] = useState({});
    const [isSidebarOpen, setIsSidebarOpen] = useState(false); // Para mobile
    
    // Paginación
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Función para obtener organizador por ID
    const getOrganizerById = (organizerId) => {
        return users.find(user => user.id === organizerId);
    };

    useEffect(() => {
        if (query.trim() === "") {
            setFilteredResults([]);
            return;
        }

        const lowerQuery = query.toLowerCase();

        // Filtrar eventos con validación de tipos
        const filteredEvents = events.filter((event) => {
            const name = typeof event.name === 'string' ? event.name.toLowerCase() : '';
            const eventType = typeof event.eventType === 'string' ? event.eventType.toLowerCase() : '';
            const placeName = typeof event.location?.placeName === 'string' ? event.location.placeName.toLowerCase() : '';
            const description = typeof event.description === 'string' ? event.description.toLowerCase() : '';
            
            return (
                name.includes(lowerQuery) ||
                eventType.includes(lowerQuery) ||
                placeName.includes(lowerQuery) ||
                description.includes(lowerQuery)
            );
        });

        // Filtrar academias con validación de tipos
        const filteredAcademies = academies.filter((academy) => {
            const name = typeof academy.name === 'string' ? academy.name.toLowerCase() : '';
            const email = Array.isArray(academy.email) ? academy.email.join(' ').toLowerCase() : '';
            return name.includes(lowerQuery) || email.includes(lowerQuery);
        });

        // Filtrar usuarios con validación de tipos y manejo correcto del email array
        const filteredUsers = users.filter((user) => {
            const firstName = typeof user.firstName === 'string' ? user.firstName.toLowerCase() : '';
            const lastName = typeof user.lastName === 'string' ? user.lastName.toLowerCase() : '';
            const category = user.marinera?.participant?.category?.toLowerCase() ?? '';
            const gender = typeof user.gender === 'string' ? user.gender.toLowerCase() : '';
            
            return (
                firstName.includes(lowerQuery) ||
                lastName.includes(lowerQuery) ||
                category.includes(lowerQuery) ||
                gender.includes(lowerQuery)
            );
        });

        let results = [];
        if (filter === "events") results = filteredEvents;
        else if (filter === "academies") results = filteredAcademies;
        else if (filter === "users") results = filteredUsers;
        else results = [...filteredEvents, ...filteredAcademies, ...filteredUsers];

        setFilteredResults(results);
        setCurrentPage(1); // Reset página cuando cambian los filtros
    }, [query, events, academies, users, filter]);

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        return date.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const capitalize = (text) => {
        if (!text) return '';
        return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
    };

    const getResultType = (result) => {
        if (result.eventType) return 'event';
        if (result.roleId) return 'user';
        return 'academy';
    };

    const getResultTypeLabel = (type) => {
        switch (type) {
            case 'event': return 'Evento';
            case 'academy': return 'Academia';
            case 'user': return 'Usuario';
            default: return '';
        }
    };

    const getResultTypeColor = (type) => {
        switch (type) {
            case 'event': return 'bg-blue-100 text-blue-700';
            case 'academy': return 'bg-green-100 text-green-700';
            case 'user': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    const handleFilterChange = (newFilter) => {
        setFilter(newFilter);
        setIsSidebarOpen(false); // Cerrar sidebar en móvil después de seleccionar
        setCurrentPage(1); // Reset página cuando cambia filtro
    };

    // Cálculos de paginación
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentResults = filteredResults.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredResults.length / itemsPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        // Scroll al inicio en móvil
        if (window.innerWidth < 1024) {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Componente de paginación
    const Pagination = () => {
        if (totalPages <= 1) return null;

        const getPageNumbers = () => {
            const delta = window.innerWidth < 640 ? 1 : 2; // Menos páginas en móvil
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

        return (
            <div className="mt-6 sm:mt-8">
                {/* Info de paginación */}
                <div className="text-center text-xs sm:text-sm text-gray-600 mb-4">
                    Mostrando {indexOfFirstItem + 1} - {Math.min(indexOfLastItem, filteredResults.length)} de {filteredResults.length} resultados
                </div>

                {/* Controles de paginación */}
                <div className="flex items-center justify-center gap-1 sm:gap-2">
                    {/* Botón anterior */}
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        className={`p-2 rounded-lg transition-colors text-sm ${
                            currentPage === 1
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label="Página anterior"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </button>

                    {/* Números de página */}
                    <div className="flex items-center gap-1">
                        {getPageNumbers().map((number, index) => (
                            <div key={index}>
                                {number === '...' ? (
                                    <span className="px-2 py-2 text-gray-500 text-sm">...</span>
                                ) : (
                                    <button
                                        onClick={() => handlePageChange(number)}
                                        className={`min-w-[32px] sm:min-w-[40px] h-8 sm:h-10 rounded-lg transition-colors text-sm ${
                                            currentPage === number
                                                ? 'bg-red-600 text-white font-medium'
                                                : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    >
                                        {number}
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Botón siguiente */}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded-lg transition-colors text-sm ${
                            currentPage === totalPages
                                ? 'text-gray-400 cursor-not-allowed'
                                : 'text-gray-700 hover:bg-gray-100'
                        }`}
                        aria-label="Página siguiente"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </button>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
                {/* Header con botón de filtros para móvil */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 gap-4">
                    <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                        Resultados para: <span className="text-red-600">"{query}"</span>
                    </h1>
                    
                    {/* Botón filtros móvil */}
                    <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="hidden sm:inline">{filteredResults.length} resultados encontrados</span>
                            <span className="sm:hidden">{filteredResults.length} resultados</span>
                            <select className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm border border-gray-300 rounded-lg bg-white">
                                <option>Ordenar</option>
                                <option>Más recientes</option>
                                <option>Alfabético</option>
                            </select>
                        </div>
                        
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden flex items-center gap-2 px-3 py-2 bg-red-600 text-white rounded-lg text-sm"
                        >
                            <Filter className="w-4 h-4" />
                            Filtros
                        </button>
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Sidebar Desktop */}
                    <aside className="hidden lg:block w-80 bg-white rounded-lg shadow-sm border p-6 h-fit">
                        <h2 className="text-lg font-semibold mb-4 text-gray-900">Filtrar por:</h2>
                        <ul className="space-y-3">
                            <li>
                                <button
                                    onClick={() => setFilter("all")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        filter === "all" 
                                            ? "bg-red-600 text-white" 
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <Filter className="w-5 h-5" />
                                    Todos
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setFilter("events")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        filter === "events" 
                                            ? "bg-red-600 text-white" 
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <Calendar className="w-5 h-5" />
                                    Eventos
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setFilter("academies")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        filter === "academies" 
                                            ? "bg-red-600 text-white" 
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <Building2 className="w-5 h-5" />
                                    Academias
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => setFilter("users")}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                        filter === "users" 
                                            ? "bg-red-600 text-white" 
                                            : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                    }`}
                                >
                                    <Users className="w-5 h-5" />
                                    Usuarios
                                </button>
                            </li>
                        </ul>
                    </aside>

                    {/* Sidebar Móvil (Overlay) */}
                    {isSidebarOpen && (
                        <div className="lg:hidden fixed inset-0 z-50 flex">
                            {/* Backdrop */}
                            <div 
                                className="fixed inset-0 bg-black bg-opacity-50"
                                onClick={() => setIsSidebarOpen(false)}
                            />
                            
                            {/* Sidebar */}
                            <div className="relative bg-white w-80 max-w-[85vw] h-full p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-lg font-semibold text-gray-900">Filtrar por:</h2>
                                    <button
                                        onClick={() => setIsSidebarOpen(false)}
                                        className="p-2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                
                                <ul className="space-y-3">
                                    <li>
                                        <button
                                            onClick={() => handleFilterChange("all")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                filter === "all" 
                                                    ? "bg-red-600 text-white" 
                                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <Filter className="w-5 h-5" />
                                            Todos
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleFilterChange("events")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                filter === "events" 
                                                    ? "bg-red-600 text-white" 
                                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <Calendar className="w-5 h-5" />
                                            Eventos
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleFilterChange("academies")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                filter === "academies" 
                                                    ? "bg-red-600 text-white" 
                                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <Building2 className="w-5 h-5" />
                                            Academias
                                        </button>
                                    </li>
                                    <li>
                                        <button
                                            onClick={() => handleFilterChange("users")}
                                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors ${
                                                filter === "users" 
                                                    ? "bg-red-600 text-white" 
                                                    : "bg-gray-50 hover:bg-gray-100 text-gray-700"
                                            }`}
                                        >
                                            <Users className="w-5 h-5" />
                                            Usuarios
                                        </button>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* Resultados */}
                    <main className="flex-1 min-w-0">
                        {filteredResults.length > 0 ? (
                            <>
                                <div className="space-y-4">
                                    {currentResults.map((result) => {
                                    const type = getResultType(result);
                                    const organizer = type === 'academy' && result.organizerId ? getOrganizerById(result.organizerId) : null;
                                    
                                    return (
                                        <div key={result.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                                            <Link 
                                                href={
                                                    result.eventType 
                                                        ? `/event/${result.id}` 
                                                        : result.roleId 
                                                            ? `/user/${result.id}` 
                                                            : `/academy/${result.id}`
                                                } 
                                                className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                                            >
                                                <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                                                    <h3 className="text-lg font-semibold text-red-600 hover:text-red-700 transition-colors pr-2">
                                                        {result.name || `${result.firstName || ''} ${result.lastName || ''}`.trim()}
                                                    </h3>
                                                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getResultTypeColor(type)} self-start sm:flex-shrink-0`}>
                                                        {getResultTypeLabel(type)}
                                                    </span>
                                                </div>

                                                {/* CONTENIDO ESPECÍFICO POR TIPO */}
                                                {type === 'event' && (
                                                    <div className="space-y-3">
                                                        {/* Descripción del evento */}
                                                        {result.description && (
                                                            <p className="text-gray-600 text-sm leading-relaxed">
                                                                {truncateText(result.description, 120)}
                                                            </p>
                                                        )}
                                                        
                                                        {/* Información del evento */}
                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <Trophy className="w-4 h-4 flex-shrink-0" />
                                                                <span className="font-medium">{result.eventType}</span>
                                                            </div>
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                <span className="truncate">{capitalize(result.location?.district)}, {capitalize(result.location?.department)}</span>
                                                            </div>
                                                            {result.date && (
                                                                <div className="flex items-center gap-1">
                                                                    <Calendar className="w-4 h-4 flex-shrink-0" />
                                                                    <span>{formatDate(result.date)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {type === 'academy' && (
                                                    <div className="space-y-3">
                                                        {/* Información de contacto */}
                                                        <div className="space-y-2">
                                                            {result.email && Array.isArray(result.email) && result.email.length > 0 && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Mail className="w-4 h-4 flex-shrink-0" />
                                                                    <span className="truncate">{result.email[0]}</span>
                                                                </div>
                                                            )}
                                                            {result.phoneNumber && Array.isArray(result.phoneNumber) && result.phoneNumber.length > 0 && (
                                                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                                                    <Phone className="w-4 h-4 flex-shrink-0" />
                                                                    <span>{result.phoneNumber[0]}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Información adicional */}
                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                <span className="truncate">{capitalize(result.location?.district)}, {capitalize(result.location?.department)}</span>
                                                            </div>
                                                            {organizer && (
                                                                <div className="flex items-center gap-1">
                                                                    <UserIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span className="truncate">Organizador: {organizer.firstName} {organizer.lastName}</span>
                                                                </div>
                                                            )}
                                                            <div className="flex items-center gap-1">
                                                                <Trophy className="w-4 h-4 flex-shrink-0" />
                                                                <span>Danza</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}

                                                {type === 'user' && (
                                                    <div className="space-y-3">
                                                        {/* Información del usuario */}
                                                        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-2 sm:gap-4 text-sm text-gray-600">
                                                            {result.marinera?.participant?.category && (
                                                                <div className="flex items-center gap-1">
                                                                    <Trophy className="w-4 h-4 flex-shrink-0" />
                                                                    <span className="font-medium">{result.marinera.participant.category}</span>
                                                                </div>
                                                            )}
                                                            {result.gender && (
                                                                <div className="flex items-center gap-1">
                                                                    <UserIcon className="w-4 h-4 flex-shrink-0" />
                                                                    <span>{capitalize(result.gender)}</span>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Ubicación */}
                                                        <div className="flex items-center gap-4 text-sm text-gray-500">
                                                            <div className="flex items-center gap-1">
                                                                <MapPin className="w-4 h-4 flex-shrink-0" />
                                                                <span className="truncate">
                                                                    {result.location?.district && capitalize(result.location.district)}
                                                                    {result.location?.district && result.location?.department && ', '}
                                                                    {result.location?.department && capitalize(result.location.department)}
                                                                    {!result.location?.district && !result.location?.department && 'Ubicación no especificada'}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </Link>
                                        </div>
                                    );
                                })}
                                </div>
                                
                                {/* Componente de paginación */}
                                <Pagination />
                            </>
                        ) : (
                            <div className="bg-white rounded-lg shadow-sm border p-8 sm:p-12 text-center">
                                <div className="text-gray-400 mb-4">
                                    <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron resultados</h3>
                                <p className="text-gray-600 text-sm sm:text-base">Intenta con otros términos de búsqueda o revisa los filtros aplicados.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
}