import React, { useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Users, Clock, Calendar, MapPin, User, Trophy } from 'lucide-react';
import toast from 'react-hot-toast';
import { LiveContestRunning } from './LiveContestRunning';
import useEventParticipants from '@/app/hooks/useEventParticipants';
import { startContestWithEventData } from '@/app/services/startContestService';
import useLiveCompetitions from '@/app/hooks/useLiveCompetition';

interface LiveProps {
    event: CustomEvent;
    onContestStart: (started: boolean) => void;
}

const LiveSchedule: React.FC<LiveProps> = ({ event, onContestStart }) => {
    const [isContestRunning, setIsContestRunning] = useState(false);
    const [isStartingContest, setIsStartingContest] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [showModal, setShowModal] = useState(false);
    const { liveCompetitions } = useLiveCompetitions(event.id)
    const itemsPerPage = 10;

    const {
        totalParticipants,
        modalityData,
        loadingParticipants,
        error,
        getParticipantCount,
        getUniqueLevels
    } = useEventParticipants(event.id);

    if (isContestRunning) {
        return (
            <LiveContestRunning 
                event={event} 
                onBack={() => setIsContestRunning(false)}
                onBackToSchedule={() => setIsContestRunning(false)}
            />
        );
    }

    const scheduleItems = event.settings?.schedule?.items || [];
    const uniqueLevels = getUniqueLevels();
    const totalEstimatedTime = scheduleItems.reduce((total, item) => total + (item.estimatedTime || 0), 0);

    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}min`;
        }
        return `${mins}min`;
    };

    const totalPages = Math.ceil(scheduleItems.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = scheduleItems.slice(startIndex, endIndex);

    const showStartContestModal = () => {
        if (totalParticipants === 0) {
            toast.error('No se puede iniciar el concurso sin participantes', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        if (event.status === 'live') {
            toast.error('El concurso ya está en curso', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        if (event.status !== 'pendiente') {
            toast.error('El evento no está en estado pendiente', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        const alreadyStarted = liveCompetitions.length > 0;
        if (alreadyStarted) {
            toast.error('Este evento ya tiene competencias en vivo generadas', {
                duration: 3000,
                position: 'top-center',
            });
            return;
        }

        setShowModal(true);
    };

    const handleStartContest = async () => {
        try {
            setIsStartingContest(true);
            onContestStart(true);
            setShowModal(false);
            
            toast.loading('Iniciando concurso...', {
                id: 'starting-contest',
                duration: Infinity,
            });

            await startContestWithEventData(event.id);
            
            toast.dismiss('starting-contest');
            toast.success('¡Concurso iniciado exitosamente!', {
                duration: 3000,
                position: 'top-center',
            });
            
            setIsContestRunning(true);
            
        } catch (error) {
            console.error('Error al iniciar concurso:', error);
            
            toast.dismiss('starting-contest');
            toast.error('Error al iniciar el concurso. Inténtalo de nuevo.', {
                duration: 5000,
                position: 'top-center',
            });
        } finally {
            setIsStartingContest(false);
        }
    };

    const handleCancelStart = () => {
        setShowModal(false);
    };

    if (loadingParticipants) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando participantes del evento...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center">
                    <div className="text-red-500 mr-3">⚠️</div>
                    <div>
                        <h3 className="text-red-800 font-medium">Error al cargar participantes</h3>
                        <p className="text-red-600 text-sm mt-1">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div 
                        className="absolute inset-0 bg-black/60 backdrop-blur-md"
                        onClick={handleCancelStart}
                    ></div>
                    
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
                                        disabled={isStartingContest}
                                        className={`px-6 py-3 rounded-lg transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 min-w-[100px] ${
                                            isStartingContest
                                                ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                                                : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
                                        }`}
                                    >
                                        {isStartingContest ? (
                                            <div className="flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                                Iniciando...
                                            </div>
                                        ) : (
                                            'Aceptar'
                                        )}
                                    </button>
                                    <button
                                        onClick={handleCancelStart}
                                        disabled={isStartingContest}
                                        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 min-w-[100px] disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="space-y-6">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                        {event.name || 'Concurso Nacional Pleto Flores'}
                    </h1>
                    <button 
                        onClick={() => {
                            if (event.status === 'live' || liveCompetitions.length > 0) {
                                onContestStart(true);
                                setIsContestRunning(true);
                            } else {
                                showStartContestModal();
                            }
                        }}
                        disabled={
                            isStartingContest || 
                            (totalParticipants === 0 && event.status !== 'live')
                        }
                        className={`px-6 py-3 rounded-full font-semibold transition-all transform hover:scale-105 ${
                            isStartingContest || 
                            (totalParticipants === 0 && event.status !== 'live')
                            ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                            : event.status === 'live' || liveCompetitions.length > 0
                            ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                            : 'bg-green-500 text-white hover:bg-green-600 shadow-lg hover:shadow-xl'
                        }`}
                        title={
                            event.status === 'live' || liveCompetitions.length > 0
                            ? 'Ver concurso en vivo'
                            : totalParticipants === 0 
                            ? 'No hay participantes registrados'
                            : 'Iniciar concurso'
                        }
                    >
                        {isStartingContest ? (
                            <div className="flex items-center">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                Iniciando...
                            </div>
                        ) : event.status === 'live' || liveCompetitions.length > 0 ? (
                            'Ver Concurso'
                        ) : (
                            'Iniciar Concurso'
                        )}
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Lugar</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                            {event.location?.placeName}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Calendar className="h-5 w-5 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Fecha Programada</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                            {event.startDate?.toDate?.().toLocaleDateString('es-ES', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                            })}
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <MapPin className="h-5 w-5 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Ubicación</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                            {event.location ? 
                                `${event.location.district}, ${event.location.province}, ${event.location.department}` : 
                                ''
                            }
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <div className="flex items-center space-x-3 mb-2">
                            <div className="p-2 bg-red-50 rounded-lg">
                                <Clock className="h-5 w-5 text-red-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Hora Programada</span>
                        </div>
                        <p className="font-semibold text-gray-900">
                            {event.startDate?.toDate?.().toLocaleTimeString('es-ES', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                            })}
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 border-l-4 border-l-blue-500">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Users className="h-6 w-6 text-blue-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Total de Participantes</span>
                        </div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">{totalParticipants}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 border-l-4 border-l-purple-500">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <Trophy className="h-6 w-6 text-purple-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Total de Modalidades</span>
                        </div>
                        <div className="text-4xl font-bold text-purple-600 mb-2">{uniqueLevels.length}</div>
                    </div>

                    <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 border-l-4 border-l-green-500">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <Clock className="h-6 w-6 text-green-500" />
                            </div>
                            <span className="text-sm font-medium text-gray-500">Duración Estimada</span>
                        </div>
                        <div className="text-4xl font-bold text-green-600 mb-2">{formatTime(totalEstimatedTime)}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                        <h3 className="text-xl font-semibold text-gray-900 mb-6">Participantes por modalidad</h3>
                        
                        <div className="flex items-center justify-center mb-8">
                            <div className="relative w-52 h-52">
                                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                                    {modalityData.length > 0 && totalParticipants > 0 ? modalityData.map((item, index) => {
                                        const colors = ['#ef4444', '#22c55e', '#3b82f6', '#f59e0b', '#8b5cf6'];
                                        const circumference = 2 * Math.PI * 35;
                                        const strokeDasharray = (item.percentage / 100) * circumference;
                                        const previousPercentages = modalityData.slice(0, index).reduce((sum, prev) => sum + (prev.percentage || 0), 0);
                                        const strokeDashoffset = -((previousPercentages / 100) * circumference) || 0;
                                        
                                        return (
                                            <circle
                                                key={item.name}
                                                cx="50"
                                                cy="50"
                                                r="35"
                                                fill="none"
                                                stroke={colors[index % colors.length] || '#6b7280'}
                                                strokeWidth="12"
                                                strokeDasharray={`${strokeDasharray || 0} ${circumference}`}
                                                strokeDashoffset={strokeDashoffset}
                                                className="transition-all duration-500 hover:opacity-80"
                                            />
                                        );
                                    }) : (
                                        <circle
                                            cx="50"
                                            cy="50"
                                            r="35"
                                            fill="none"
                                            stroke="#e5e7eb"
                                            strokeWidth="12"
                                        />
                                    )}
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <div className="text-center">
                                        <div className="text-3xl font-bold text-gray-900">{totalParticipants}</div>
                                        <div className="text-sm text-gray-500 font-medium">Total</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            {modalityData.length > 0 ? modalityData.map((item, index) => {
                                const colors = ['bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500'];
                                return (
                                    <div key={item.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center">
                                            <div className={`w-4 h-4 rounded-full mr-3 ${colors[index % colors.length] || 'bg-gray-400'}`}></div>
                                            <span className="font-medium text-gray-700 capitalize">{item.name}</span>
                                        </div>
                                        <div className="text-right">
                                            <div className="font-bold text-gray-900">{item.count}</div>
                                            <div className="text-sm text-gray-500">({item.percentage}%)</div>
                                        </div>
                                    </div>
                                );
                            }) : (
                                <div className="text-center text-gray-500 py-8">
                                    <User className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                    <p>No hay participantes registrados</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-xl font-semibold text-gray-900">Secuencia del Concurso</h3>
                        </div>
                        
                        <div className="p-4">
                            <div className="grid grid-cols-5 gap-2 px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-200">
                                <div>ORDEN</div>
                                <div>MODALIDAD</div>
                                <div>CATEGORÍA</div>
                                <div>GÉNERO</div>
                                <div>DURACIÓN</div>
                            </div>
                            
                            <div className="space-y-2 mt-4">
                                {currentItems.length > 0 ? currentItems.map((item, index) => {
                                    const globalIndex = startIndex + index + 1;
                                    
                                    const renderGender = (gender: string) => {
                                        if (gender?.toLowerCase() === 'masculino' || gender?.toLowerCase() === 'm' || gender?.toLowerCase() === 'varones') {
                                            return (
                                                <div className="flex items-center">
                                                    <span className="text-blue-500 mr-1 text-lg">♂</span>
                                                    <span className="text-blue-700 font-medium text-sm">Varones</span>
                                                </div>
                                            );
                                        } else if (gender?.toLowerCase() === 'femenino' || gender?.toLowerCase() === 'f' || gender?.toLowerCase() === 'mujeres') {
                                            return (
                                                <div className="flex items-center">
                                                    <span className="text-pink-500 mr-1 text-lg">♀</span>
                                                    <span className="text-pink-700 font-medium text-sm">Mujeres</span>
                                                </div>
                                            );
                                        } else {
                                            return (
                                                <div className="flex items-center">
                                                    <span className="text-gray-400 mr-1 text-lg">⚲</span>
                                                    <span className="text-gray-600 capitalize text-sm">{gender || 'Mixto'}</span>
                                                </div>
                                            );
                                        }
                                    };
                                    
                                    return (
                                        <div 
                                            key={item.id} 
                                            className="grid grid-cols-5 gap-2 px-4 py-3 bg-orange-50 hover:bg-orange-100 rounded-xl border border-orange-200 transition-colors items-center text-sm"
                                        >
                                            <div className="font-bold text-gray-900">{globalIndex}</div>
                                            <div className="font-medium text-gray-900 capitalize truncate">{item.levelId}</div>
                                            <div className="text-gray-700 truncate">{item.category}</div>
                                            <div>{renderGender(item.gender)}</div>
                                            <div className="text-blue-600 font-medium">{item.estimatedTime || 0} min</div>
                                        </div>
                                    );
                                }) : (
                                    <div className="text-center py-12">
                                        <div className="text-gray-500">
                                            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                                            <p>No hay elementos programados</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LiveSchedule;