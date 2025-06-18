import React, { useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Users, Clock, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';
import { LiveContestRunning } from './LiveModules/LiveContestRunning';

interface LiveProps {
    event: CustomEvent;
}

const Live: React.FC<LiveProps> = ({ event }) => {
    const [isContestRunning, setIsContestRunning] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const itemsPerPage = 4;

    // Si el concurso está corriendo, mostrar la página de concurso en vivo
    if (isContestRunning) {
        return (
            <LiveContestRunning 
                event={event} 
                onBack={() => setIsContestRunning(false)}
            />
        );
    }

    // Datos del evento
    const scheduleItems = event.settings?.schedule?.items || [];
    const totalParticipants = Object.values(event.participants || {}).reduce((total, levelParticipants) => {
        return total + Object.values(levelParticipants).reduce((levelTotal, categoryData) => {
            return levelTotal + categoryData.count;
        }, 0);
    }, 0);

    const uniqueLevels = [...new Set(scheduleItems.map(item => item.levelId))];
    const totalEstimatedTime = scheduleItems.reduce((total, item) => total + (item.estimatedTime || 0), 0);

    // Formatear tiempo
    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    // Control de navegación
    const nextItem = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevItem = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Paginación
    const totalPages = Math.ceil(scheduleItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = scheduleItems.slice(startIndex, endIndex);

    const goToPage = (page: number) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
        }
    };

    const renderPaginationButtons = () => {
        const buttons = [];
        
        // Botón página 1
        buttons.push(
            <button
                key={1}
                onClick={() => goToPage(1)}
                className={`w-6 h-6 rounded-full text-xs font-bold ${
                    currentPage === 1 
                        ? 'bg-red-500 text-white' 
                        : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                }`}
            >
                1
            </button>
        );

        // Si hay más de 4 páginas y estamos después de la página 3, mostrar "..."
        if (totalPages > 4 && currentPage > 3) {
            buttons.push(
                <span key="dots1" className="text-gray-500">•••</span>
            );
        }

        // Páginas del medio (solo si no es la primera o última)
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i > 1 && i < totalPages) {
                buttons.push(
                    <button
                        key={i}
                        onClick={() => goToPage(i)}
                        className={`w-6 h-6 rounded-full text-xs font-bold ${
                            currentPage === i 
                                ? 'bg-red-500 text-white' 
                                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                        }`}
                    >
                        {i}
                    </button>
                );
            }
        }

        // Si hay más de 4 páginas y estamos antes de las últimas 3, mostrar "..."
        if (totalPages > 4 && currentPage < totalPages - 2) {
            buttons.push(
                <span key="dots2" className="text-gray-500">•••</span>
            );
        }

        // Botón última página (solo si hay más de 1 página)
        if (totalPages > 1) {
            buttons.push(
                <button
                    key={totalPages}
                    onClick={() => goToPage(totalPages)}
                    className={`w-6 h-6 rounded-full text-xs font-bold ${
                        currentPage === totalPages 
                            ? 'bg-red-500 text-white' 
                            : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
                    }`}
                >
                    {totalPages}
                </button>
            );
        }

        return buttons;
    };

    // Función para mostrar el modal de confirmación
    const showStartContestModal = () => {
        setShowModal(true);
    };

    // Función para manejar el inicio del concurso
    const handleStartContest = () => {
        setShowModal(false);
        setIsContestRunning(true);
        
        // Mostrar toast de éxito
        toast.success('¡Concurso iniciado exitosamente!', {
            duration: 3000,
            position: 'top-center',
        });
        
        // Aquí podrías hacer una llamada a la API para actualizar el estado del concurso
        // updateContestStatus(event.id, 'active');
    };

    const handleCancelStart = () => {
        setShowModal(false);
    };

    // Datos para el gráfico circular (simulado con CSS)
    const modalityData = uniqueLevels.map(levelId => {
        const levelParticipants = Object.values(event.participants?.[levelId] || {}).reduce((sum, cat) => sum + cat.count, 0);
        const percentage = totalParticipants > 0 ? (levelParticipants / totalParticipants) * 100 : 0;
        return {
            name: levelId,
            count: levelParticipants,
            percentage: Math.round(percentage) || 0
        };
    });

    return (
        <div className="space-y-6">
            {/* Modal de confirmación CORREGIDO */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Overlay con blur mejorado */}
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={handleCancelStart}
                    ></div>
                    
                    {/* Modal centrado correctamente */}
                    <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full transform transition-all duration-300 animate-in zoom-in-95">
                        <div className="p-8">
                            <div className="text-center">
                                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-yellow-100 mb-4">
                                    <svg className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                    Iniciar Concurso
                                </h3>
                                <p className="text-gray-600 mb-6">
                                    ¿Estás seguro que deseas iniciar el concurso? Esta acción no se puede deshacer.
                                </p>
                                <div className="flex justify-center space-x-4">
                                    <button
                                        onClick={handleStartContest}
                                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 min-w-[100px]"
                                    >
                                        Aceptar
                                    </button>
                                    <button
                                        onClick={handleCancelStart}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-w-[100px]"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Header del evento en vivo */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <div className="flex items-center mb-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2 animate-pulse"></div>
                            <span className="text-red-600 font-semibold">En Vivo</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-800">{event.name || 'Concurso en vivo'}</h1>
                    </div>
                    <button 
                        onClick={showStartContestModal}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Iniciar Concurso
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Lugar:</span>
                        <div className="font-medium">Coliseo Miguel Grau</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Fecha Programada:</span>
                        <div className="font-medium">15/06/2025</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Ubicación:</span>
                        <div className="font-medium">San Juan de Lurigancho, Lima, Perú</div>
                    </div>
                    <div>
                        <span className="text-gray-600">Hora Programada:</span>
                        <div className="font-medium">9 a.m.</div>
                    </div>
                </div>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total de Participantes</span>
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{totalParticipants}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Total de Modalidades</span>
                        <Calendar className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{uniqueLevels.length}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Duración Estimada</span>
                        <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{formatTime(totalEstimatedTime)}</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Participantes por modalidad */}
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Participantes por modalidad</h3>
                    
                    {/* Gráfico circular simulado */}
                    <div className="flex items-center justify-center mb-6">
                        <div className="relative w-48 h-48">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                {modalityData.length > 0 && totalParticipants > 0 ? modalityData.map((item, index) => {
                                    const colors = ['#ef4444', '#22c55e', '#3b82f6']; // rojo, verde, azul
                                    const circumference = 2 * Math.PI * 40;
                                    const strokeDasharray = (item.percentage / 100) * circumference;
                                    const previousPercentages = modalityData.slice(0, index).reduce((sum, prev) => sum + (prev.percentage || 0), 0);
                                    const strokeDashoffset = -((previousPercentages / 100) * circumference) || 0;
                                    
                                    return (
                                        <circle
                                            key={item.name}
                                            cx="50"
                                            cy="50"
                                            r="40"
                                            fill="none"
                                            stroke={colors[index] || '#6b7280'}
                                            strokeWidth="8"
                                            strokeDasharray={`${strokeDasharray || 0} ${circumference}`}
                                            strokeDashoffset={strokeDashoffset}
                                            className="transition-all duration-500"
                                        />
                                    );
                                }) : (
                                    <circle
                                        cx="50"
                                        cy="50"
                                        r="40"
                                        fill="none"
                                        stroke="#e5e7eb"
                                        strokeWidth="8"
                                    />
                                )}
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-2xl font-bold text-gray-800">{totalParticipants}</div>
                                    <div className="text-sm text-gray-600">Total</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Leyenda */}
                    <div className="space-y-2">
                        {modalityData.length > 0 ? modalityData.map((item, index) => {
                            const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500'];
                            return (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <div className={`w-3 h-3 rounded-full mr-2 ${colors[index] || 'bg-gray-400'}`}></div>
                                        <span className="text-sm text-gray-700 capitalize">{item.name}</span>
                                    </div>
                                    <div className="text-sm font-medium text-gray-800">
                                        {item.count} ({item.percentage}%)
                                    </div>
                                </div>
                            );
                        }) : (
                            <div className="text-center text-gray-500 py-4">
                                <p>No hay participantes registrados</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Secuencia del Concurso */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-6 border-b border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-800">Secuencia del Concurso</h3>
                    </div>
                    <div className="overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orden</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Modalidad</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Categoría</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participantes</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración Estimada</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {currentItems.map((item, index) => {
                                    const categoryParticipants = event.participants?.[item.levelId]?.[item.category]?.count || 0;
                                    const globalIndex = startIndex + index + 1;
                                    return (
                                        <tr key={item.id} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 font-medium text-gray-900">{globalIndex}</td>
                                            <td className="px-4 py-3 text-gray-900 capitalize">{item.levelId}</td>
                                            <td className="px-4 py-3 text-gray-900">{item.category}</td>
                                            <td className="px-4 py-3 text-gray-600">{categoryParticipants}</td>
                                            <td className="px-4 py-3 text-gray-600">{item.estimatedTime || 0} min</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        
                        {/* Paginación */}
                        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-center space-x-2">
                            {totalPages > 0 ? renderPaginationButtons() : (
                                <span className="text-gray-500 text-sm">No hay elementos para mostrar</span>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Live;