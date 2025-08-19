import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Play, Eye, Calendar, Users, Clock, Trophy, Settings, CheckCircle2, Loader2 } from 'lucide-react';
import { CustomEvent } from '@/app/types/eventType';
import useEventParticipants from '@/app/hooks/useEventParticipants';
import useUsers from '@/app/hooks/useUsers';
import { useCompetitionManager } from '@/app/hooks/events/useCompetitionManager';
import { TandasConfirmationModal } from './modals/TandasConfirmationModal';
import { CompetitionConfigModal } from './modals/CompetitionConfigModal';
import { TandaExecutionView } from './TandaExecutionView';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { Timestamp } from 'firebase/firestore';

interface LiveContestRunningProps {
    event: CustomEvent;
    onBack: () => void;
    onBackToSchedule?: () => void;
}

type ViewState = 'schedule' | 'execution';

export const LiveContestRunning: React.FC<LiveContestRunningProps> = ({ event, onBack, onBackToSchedule }) => {
    const [viewState, setViewState] = useState<ViewState>('schedule');
    const [currentTime, setCurrentTime] = useState(0);
    const [currentTandaIndex, setCurrentTandaIndex] = useState(0);
    const [executionData, setExecutionData] = useState<{
        level: string;
        category: string;
        gender: string;
        tandas: Tanda[];
        participants: Participant[];
    } | null>(null);

    // Calcular tiempo de inicio del evento
    const [eventStartTime] = useState(() => {
        if (event.startDate) {
            try {
                if (event.startDate instanceof Timestamp) {
                    return event.startDate.toDate().getTime();
                }
                if (typeof event.startDate === 'object' && event.startDate !== null && 'toDate' in event.startDate) {
                    return (event.startDate as any).toDate().getTime();
                }
                const dateValue = event.startDate as any;
                return new Date(dateValue).getTime();
            } catch (error) {
                console.warn('Error parsing event.startDate:', error);
                return Date.now();
            }
        }
        return Date.now();
    });

    // Hook de participantes
    const {
        totalParticipants,
        getParticipantCount,
        getParticipantCountByGender,
        getParticipantsByGender,
        getParticipantsByCategory,
        loadingParticipants,
        error
    } = useEventParticipants(event.id);

    // Datos del cronograma
    const scheduleItems = event.settings?.schedule?.items || [];

    // Custom hook con toda la lógica de competencias
    const {
        competitionStatuses,
        showConfigModal,
        showTandasModal,
        selectedItem,
        generatedTandas,
        isConfiguring,
        isGeneratingTandas,
        isConfirmingTandas,
        handleConfigClick,
        handleConfirmConfig,
        handleCloseConfigModal,
        handlePlayClick,
        handleConfirmTandas,
        handleCloseModal,
        handleCompetitionFinished,
        getActionButton,
        getBadgeInfo
    } = useCompetitionManager({
        event,
        scheduleItems,
        getParticipantsByGender,
        getParticipantsByCategory
    });

    // IDs de usuarios para cargar datos
    const participantUserIds = useMemo(() => {
        if (!selectedItem) return [];

        const participants = selectedItem.gender
            ? getParticipantsByGender(selectedItem.levelId, selectedItem.category, selectedItem.gender)
            : getParticipantsByCategory(selectedItem.levelId, selectedItem.category);

        const userIds = new Set<string>();
        participants.forEach(participant => {
            if (participant.usersId && Array.isArray(participant.usersId)) {
                participant.usersId.forEach(id => userIds.add(id));
            }
        });
        return Array.from(userIds);
    }, [selectedItem, getParticipantsByGender, getParticipantsByCategory]);

    const { users: allUsers, loadingUsers } = useUsers(participantUserIds);

    // Cálculos para estadísticas
    const totalItems = scheduleItems.length;
    const completedCount = Object.values(competitionStatuses).filter(status => status.currentStatus === 'completed').length;
    const totalEstimatedTime = scheduleItems.reduce((total, item) => total + (item.estimatedTime || 0), 0);
    const completedTime = scheduleItems
        .filter(item => competitionStatuses[item.id]?.currentStatus === 'completed')
        .reduce((total, item) => total + (item.estimatedTime || 0), 0);

    // Temporizador del evento
    useEffect(() => {
        const updateTime = () => {
            const now = Date.now();
            const elapsed = Math.floor((now - eventStartTime) / 1000);
            setCurrentTime(elapsed);
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, [eventStartTime]);

    // Funciones de formato
    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        if (hours > 0) {
            return `${hours}h ${mins}m`;
        }
        return `${mins}m`;
    };

    const getCurrentParticipants = (item: any) => {
        if (item.gender) {
            return getParticipantCountByGender(item.levelId, item.category, item.gender);
        } else {
            return getParticipantCount(item.levelId, item.category);
        }
    };

    // Función para renderizar el icono correcto
    const renderActionIcon = (iconType: string) => {
        switch (iconType) {
            case 'settings':
                return <Settings className="h-4 w-4" />;
            case 'play':
                return <Play className="h-4 w-4" />;
            case 'eye':
                return <Eye className="h-4 w-4" />;
            case 'loader':
                return <Loader2 className="h-4 w-4 animate-spin" />;
            default:
                return <Settings className="h-4 w-4" />;
        }
    };

    // Handlers para ejecución de tandas
    const handlePlayClickWithExecution = async (item: any, index: number) => {
        const result = await handlePlayClick(item, index);
        if (result) {
            setExecutionData({
                level: item.levelId,
                category: item.category,
                gender: item.gender || 'Mixto',
                tandas: result.tandas,
                participants: result.participants,
            });
            setCurrentTandaIndex(0);
            setViewState('execution');
        }
    };

    const handleConfirmTandasWithExecution = async () => {
        const result = await handleConfirmTandas();
        if (result) {
            setExecutionData({
                level: selectedItem.levelId,
                category: selectedItem.category,
                gender: selectedItem.gender || 'Mixto',
                tandas: result.tandas,
                participants: result.participants
            });
            setCurrentTandaIndex(0);
            setViewState('execution');
        }
    };

    const handleBackToSchedule = () => {
        setViewState('schedule');
        setExecutionData(null);
        setCurrentTandaIndex(0);
    };

    const handleNextTanda = () => {
        if (executionData && currentTandaIndex < executionData.tandas.length - 1) {
            setCurrentTandaIndex(currentTandaIndex + 1);
        }
    };

    const handlePreviousTanda = () => {
        if (currentTandaIndex > 0) {
            setCurrentTandaIndex(currentTandaIndex - 1);
        }
    };

    // Componente para tarjetas de estadísticas
    const renderStatsCard = (icon: React.ReactNode, title: string, value: string) => (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200 flex-1 min-w-[140px]">
            <div className="flex items-center space-x-3">
                {icon}
                <div className="min-w-0">
                    <p className="text-sm text-gray-600">{title}</p>
                    <p className="text-xl font-bold text-gray-900 font-mono">{value}</p>
                </div>
            </div>
        </div>
    );

    // Componente para cada item del cronograma
    const renderScheduleItem = (item: any, index: number) => {
        const participantsCount = getCurrentParticipants(item);
        const status = competitionStatuses[item.id];
        const liveCompetitionId = `${item.levelId}_${item.category}_${item.gender || 'Mixto'}`;
        const isCurrentlyLive = event.currentLiveCompetitionId === liveCompetitionId;

        if (!status) {
            return null; // Aún cargando
        }

        const actionButton = getActionButton(item, participantsCount);
        const badgeInfo = getBadgeInfo(status);
        const isCompleted = status.currentStatus === 'completed';

        // Handler para ejecutar la acción correcta
        const handleActionClick = () => {
            switch (actionButton.action) {
                case 'config':
                    handleConfigClick(item);
                    break;
                case 'play':
                case 'view':
                    handlePlayClickWithExecution(item, index);
                    break;
                case 'none':
                default:
                    // No hacer nada
                    break;
            }
        };

        return (
            <div
                key={item.id}
                className={`relative flex items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                    isCompleted
                        ? 'bg-purple-50 border-purple-200'
                        : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                }`}
            >
                <div className="flex items-center space-x-4">
                    <div className="relative">
                        {isCompleted ? (
                            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                                <CheckCircle2 className="h-5 w-5 text-white" />
                            </div>
                        ) : (
                            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                                {index + 1}
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center space-x-3">
                            <h4 className={`font-semibold ${isCompleted ? 'text-purple-800' : 'text-gray-900'}`}>
                                {item.category}
                            </h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${badgeInfo.className}`}>
                                {badgeInfo.text}
                            </span>
                            {isCurrentlyLive && status.currentStatus === 'in-progress' && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs font-medium rounded-full animate-pulse">
                                    🔴 EN VIVO
                                </span>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                            <span className="capitalize">{item.levelId}</span>
                            <span>•</span>
                            <span>{participantsCount} participantes</span>
                            <span>•</span>
                            <span>{formatDuration(item.estimatedTime || 0)}</span>
                            {item.phase && (
                                <>
                                    <span>•</span>
                                    <span>{item.phase}</span>
                                </>
                            )}
                            {item.gender && (
                                <>
                                    <span>•</span>
                                    <span>{item.gender}</span>
                                </>
                            )}
                        </div>
                        {participantsCount === 0 && (
                            <div className="mt-2">
                                <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                                    ⚠️ Sin participantes registrados
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <button
                        onClick={handleActionClick}
                        disabled={actionButton.disabled}
                        className={`p-2 rounded-lg transition-colors ${actionButton.className}`}
                        title={actionButton.title}
                    >
                        {renderActionIcon(actionButton.iconType)}
                    </button>
                </div>
            </div>
        );
    };

    // Vista de ejecución
    if (viewState === 'execution' && executionData) {
        return (
            <TandaExecutionView
                event={event}
                level={executionData.level}
                category={executionData.category}
                gender={executionData.gender}
                currentTanda={executionData.tandas[currentTandaIndex]}
                allParticipants={executionData.participants}
                onBack={handleBackToSchedule}
                onNextTanda={currentTandaIndex < executionData.tandas.length - 1 ? handleNextTanda : undefined}
                onPreviousTanda={currentTandaIndex > 0 ? handlePreviousTanda : undefined}
            />
        );
    }

    // Estado de carga
    if (loadingParticipants) {
        return (
            <div className="space-y-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={() => {
                                if (onBackToSchedule) {
                                    onBackToSchedule();
                                } else {
                                    onBack();
                                }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title={onBackToSchedule ? "Volver a Principal" : "Volver a Live Schedule"}
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Concurso en vivo</h1>
                    </div>

                    <div className="flex items-center justify-center min-h-[400px]">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                            <p className="text-gray-600">Cargando datos del concurso...</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Estado de error
    if (error) {
        return (
            <div className="space-y-6">
                <div className="max-w-6xl mx-auto px-4">
                    <div className="flex items-center space-x-4 mb-8">
                        <button
                            onClick={() => {
                                if (onBackToSchedule) {
                                    onBackToSchedule();
                                } else {
                                    onBack();
                                }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title={onBackToSchedule ? "Volver a Principal" : "Volver a Live Schedule"}
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h1 className="text-3xl font-bold text-gray-900">Concurso en vivo</h1>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                        <div className="flex items-center">
                            <div className="text-red-500 mr-3">⚠️</div>
                            <div>
                                <h3 className="text-red-800 font-medium">Error al cargar datos del concurso</h3>
                                <p className="text-red-600 text-sm mt-1">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Vista principal
    return (
        <div className="space-y-6">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => {
                                if (onBackToSchedule) {
                                    onBackToSchedule();
                                } else {
                                    onBack();
                                }
                            }}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-all duration-200"
                            title={onBackToSchedule ? "Volver a Principal" : "Volver a Live Schedule"}
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Concurso en vivo</h1>
                            <p className="text-gray-600 mt-1">{event.name}</p>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-3 lg:gap-4">
                        {renderStatsCard(
                            <Clock className="h-5 w-5 text-blue-500 flex-shrink-0" />,
                            "Tiempo transcurrido",
                            formatTime(currentTime)
                        )}
                        {renderStatsCard(
                            <Users className="h-5 w-5 text-green-500 flex-shrink-0" />,
                            "Participantes",
                            totalParticipants.toString()
                        )}
                        {renderStatsCard(
                            <Trophy className="h-5 w-5 text-orange-500 flex-shrink-0" />,
                            "Progreso",
                            `${completedCount}/${totalItems}`
                        )}
                    </div>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 mb-6">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-lg font-semibold text-gray-900">Progreso del evento</h3>
                        <span className="text-sm text-gray-600">
                            {formatDuration(completedTime)} / {formatDuration(totalEstimatedTime)}
                        </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
                            style={{ width: `${totalItems > 0 ? (completedCount / totalItems) * 100 : 0}%` }}
                        ></div>
                    </div>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <div className="flex items-center space-x-2">
                            <Calendar className="h-5 w-5 text-gray-600" />
                            <h3 className="text-lg font-semibold text-gray-900">Cronograma de competencias</h3>
                        </div>
                    </div>

                    <div className="p-6">
                        {scheduleItems.length > 0 ? (
                            <div className="space-y-3">
                                {scheduleItems.map((item, index) => renderScheduleItem(item, index))}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No hay elementos en el cronograma</p>
                                <p className="text-gray-400 text-sm">Agrega competencias para comenzar</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Modales */}
                <TandasConfirmationModal
                    isOpen={showTandasModal}
                    onClose={handleCloseModal}
                    onConfirm={handleConfirmTandasWithExecution}
                    tandas={generatedTandas}
                    allParticipants={selectedItem ? (
                        selectedItem.gender
                            ? getParticipantsByGender(selectedItem.levelId, selectedItem.category, selectedItem.gender)
                            : getParticipantsByCategory(selectedItem.levelId, selectedItem.category)
                    ) : []}
                    allUsers={allUsers}
                    level={selectedItem?.levelId || ''}
                    category={selectedItem?.category || ''}
                    gender={selectedItem?.gender || ''}
                    isLoading={isConfirmingTandas || loadingUsers}
                    competitionName={event.name}
                />

                <CompetitionConfigModal
                    isOpen={showConfigModal}
                    onClose={handleCloseConfigModal}
                    onConfirm={handleConfirmConfig}
                    isLoading={isConfiguring}
                    level={selectedItem?.levelId || ''}
                    category={selectedItem?.category || ''}
                    gender={selectedItem?.gender || ''}
                    totalParticipants={selectedItem ? getCurrentParticipants(selectedItem) : 0}
                />
            </div>
        </div>
    );
};