import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Eye, Pause, SkipForward, Clock, Users, Calendar, FileText, BarChart3, Settings, Printer, MoreHorizontal } from 'lucide-react';
import { CustomEvent } from '@/app/types/eventType';
import useEventParticipants from '@/app/hooks/useEventParticipants';
import { TandasConfirmationModal } from './modals/TandasConfirmationModal';
import { TandaExecutionView } from './TandaExecutionView';
import { generateAndPrepareTandas, confirmAndSaveTandas, checkIfTandasExist } from '@/app/services/generateTandasService';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { db } from '@/app/firebase/config';
import { collection, getDocs } from 'firebase/firestore';

interface LiveContestRunningProps {
    event: CustomEvent;
    onBack: () => void;
}

// Estados de la aplicación
type ViewState = 'schedule' | 'execution';

export const LiveContestRunning: React.FC<LiveContestRunningProps> = ({ event, onBack }) => {
    const [currentTime, setCurrentTime] = useState(0);
    const [isRunning, setIsRunning] = useState(true);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);

    // Estados para el modal de tandas
    const [showTandasModal, setShowTandasModal] = useState(false);
    const [generatedTandas, setGeneratedTandas] = useState<Tanda[]>([]);
    const [selectedItem, setSelectedItem] = useState<any>(null);
    const [isGeneratingTandas, setIsGeneratingTandas] = useState(false);
    const [isConfirmingTandas, setIsConfirmingTandas] = useState(false);
    const [existingTandasIds, setExistingTandasIds] = useState<string[]>([]);

    // Estados para la vista de ejecución
    const [viewState, setViewState] = useState<ViewState>('schedule');
    const [currentTandaIndex, setCurrentTandaIndex] = useState(0);
    const [executionData, setExecutionData] = useState<{
        level: string;
        category: string;
        gender: string;
        tandas: Tanda[];
        participants: Participant[];
    } | null>(null);

    const {
        totalParticipants,
        participantStats,
        getParticipantCount,
        getParticipantCountByGender,
        getParticipantsByGender,
        getParticipantsByCategory,
        getGendersInCategory,
        loadingParticipants,
        error
    } = useEventParticipants(event.id);

    // Obtener datos del evento
    const scheduleItems = event.settings?.schedule?.items || [];

    useEffect(() => {
        const checkAll = async () => {
            const ids: string[] = [];

            for (const item of scheduleItems) {
                const id = `${item.levelId}_${item.category}_${item.gender || 'Mixto'}`;
                const exist = await checkIfTandasExist(event.id, id, item.phase || 'Final');
                if (exist) ids.push(item.id);
            }

            setExistingTandasIds(ids);
        };

        checkAll();
    }, [scheduleItems]);

    // Temporizador
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isRunning) {
            interval = setInterval(() => {
                setCurrentTime(prevTime => prevTime + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isRunning]);

    const formatTime = (seconds: number): string => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handlePlayPause = () => {
        setIsRunning(!isRunning);
    };

    const handleNext = () => {
        if (currentItemIndex < scheduleItems.length - 1) {
            setCurrentItemIndex(currentItemIndex + 1);
        }
    };

    const handlePrevious = () => {
        if (currentItemIndex > 0) {
            setCurrentItemIndex(currentItemIndex - 1);
        }
    };

    // Función para obtener participantes del item actual
    const getCurrentParticipants = (item: any) => {
        if (item.gender) {
            return getParticipantCountByGender(item.levelId, item.category, item.gender);
        } else {
            return getParticipantCount(item.levelId, item.category);
        }
    };

    // Función para manejar el click en el botón Play
    const handlePlayClick = async (item: any, index: number) => {
        try {
            setIsGeneratingTandas(true);
            setSelectedItem(item);

            const participants = item.gender
                ? getParticipantsByGender(item.levelId, item.category, item.gender)
                : getParticipantsByCategory(item.levelId, item.category);

            if (participants.length === 0) {
                alert('No hay participantes registrados para esta categoría');
                return;
            }

            const liveCompetitionId = `${item.levelId}_${item.category}_${item.gender || 'Mixto'}`;
            const phase = item.phase || 'Final';

            const exist = await checkIfTandasExist(event.id, liveCompetitionId, phase);

            let tandas: Tanda[] = [];

            if (exist) {
                const snapshot = await getDocs(collection(
                    db,
                    'eventos',
                    event.id,
                    'liveCompetition',
                    liveCompetitionId,
                    'tandas'
                ));
                tandas = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Tanda));

                // 🔁 Ir directamente a la vista de ejecución
                setExecutionData({
                    level: item.levelId,
                    category: item.category,
                    gender: item.gender || 'Mixto',
                    tandas,
                    participants
                });

                setCurrentTandaIndex(0);
                setViewState('execution');
                return;
            }

            // Si no existen, generar y mostrar en modal
            tandas = await generateAndPrepareTandas(event.id, liveCompetitionId, phase, participants);
            setGeneratedTandas(tandas);
            setShowTandasModal(true);

        } catch (error) {
            console.error('Error:', error);
            alert(`Error al procesar tandas: ${error.message || error}`);
        } finally {
            setIsGeneratingTandas(false);
        }
    };

    // Función para confirmar las tandas
    const handleConfirmTandas = async () => {
        if (!selectedItem || generatedTandas.length === 0) return;

        try {
            setIsConfirmingTandas(true);

            const liveCompetitionId = `${selectedItem.levelId}_${selectedItem.category}_${selectedItem.gender || 'Mixto'}`;
            const phase = selectedItem.phase || 'Final';

            // Guardar tandas en Firestore
            await confirmAndSaveTandas(
                event.id,
                liveCompetitionId,
                phase,
                generatedTandas
            );

            // Obtener participantes para la ejecución
            const participants = selectedItem.gender
                ? getParticipantsByGender(selectedItem.levelId, selectedItem.category, selectedItem.gender)
                : getParticipantsByCategory(selectedItem.levelId, selectedItem.category);

            // Preparar datos para la vista de ejecución
            setExecutionData({
                level: selectedItem.levelId,
                category: selectedItem.category,
                gender: selectedItem.gender || 'Mixto',
                tandas: generatedTandas,
                participants
            });

            // Cerrar modal y cambiar a vista de ejecución
            setShowTandasModal(false);
            setGeneratedTandas([]);
            setSelectedItem(null);
            setCurrentTandaIndex(0);
            setViewState('execution');

        } catch (error) {
            console.error('Error confirmando tandas:', error);
            alert(`Error al confirmar tandas: ${error.message || error}`);
        } finally {
            setIsConfirmingTandas(false);
        }
    };

    // Función para volver al cronograma desde la ejecución
    const handleBackToSchedule = () => {
        setViewState('schedule');
        setExecutionData(null);
        setCurrentTandaIndex(0);
    };

    // Funciones para navegar entre tandas
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

    // Si estamos en vista de ejecución, mostrar el componente correspondiente
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

    // Función para cerrar el modal
    const handleCloseModal = () => {
        setShowTandasModal(false);
        setGeneratedTandas([]);
        setSelectedItem(null);
    };

    // Loading state
    if (loadingParticipants) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">Concurso en vivo</h2>
                    </div>
                </div>

                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-gray-600">Cargando datos del concurso...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-gray-100 rounded transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-gray-600" />
                        </button>
                        <h2 className="text-2xl font-bold text-gray-800">Concurso en vivo</h2>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                    <div className="flex items-center">
                        <div className="text-red-500 mr-3">⚠️</div>
                        <div>
                            <h3 className="text-red-800 font-medium">Error al cargar datos del concurso</h3>
                            <p className="text-red-600 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header con título y temporizador */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Concurso en vivo</h2>
                        <p className="text-sm text-gray-600">{event.name}</p>
                    </div>
                </div>

                <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Tiempo:</div>
                    <div className="text-xl font-mono font-bold text-gray-800">
                        {formatTime(currentTime)}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                        {totalParticipants} participantes totales
                    </div>
                </div>
            </div>

            {/* Información del evento actual */}
            {scheduleItems.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-lg font-semibold text-blue-800">
                                Ahora: {scheduleItems[currentItemIndex]?.category}
                            </h3>
                            <p className="text-blue-600 capitalize">
                                {scheduleItems[currentItemIndex]?.levelId}
                            </p>
                            <p className="text-sm text-blue-500">
                                Fase: {scheduleItems[currentItemIndex]?.phase || 'Final'}
                                {scheduleItems[currentItemIndex]?.gender && ` • ${scheduleItems[currentItemIndex]?.gender}`}
                            </p>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold text-blue-800">
                                {getCurrentParticipants(scheduleItems[currentItemIndex])}
                            </div>
                            <div className="text-sm text-blue-600">Participantes</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Cronograma */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Cronograma</h3>
                </div>

                <div className="p-6">
                    <div className="space-y-3">
                        {scheduleItems.length > 0 ? scheduleItems.map((item, index) => {
                            const participantsCount = getCurrentParticipants(item);

                            return (
                                <div
                                    key={item.id}
                                    className={`flex items-center justify-between p-4 rounded-lg border transition-all ${index === currentItemIndex
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : index < currentItemIndex
                                            ? 'bg-gray-50 border-gray-200 opacity-60'
                                            : 'bg-white border-gray-200 hover:bg-gray-50'
                                        }`}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`w-3 h-3 rounded-full ${index === currentItemIndex
                                            ? 'bg-green-500 animate-pulse'
                                            : index < currentItemIndex
                                                ? 'bg-gray-400'
                                                : 'bg-gray-300'
                                            }`}></div>
                                        <div>
                                            <div className={`font-medium ${index === currentItemIndex ? 'text-green-800' : 'text-gray-700'
                                                }`}>
                                                {item.category}
                                            </div>
                                            <div className="text-sm text-gray-500 capitalize">
                                                {item.levelId} • {participantsCount} participantes • {item.estimatedTime || 0} min
                                                {item.phase && ` • ${item.phase}`}
                                                {item.gender && ` • ${item.gender}`}
                                            </div>
                                            {participantsCount === 0 && (
                                                <div className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-1 inline-block">
                                                    ⚠️ Sin participantes registrados
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => handlePlayClick(item, index)}
                                        disabled={participantsCount === 0 || isGeneratingTandas}
                                        className={`p-2 rounded-full transition-colors ${participantsCount > 0 && !isGeneratingTandas
                                                ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                    >
                                        {isGeneratingTandas && selectedItem?.id === item.id ? (
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                                        ) : existingTandasIds.includes(item.id) ? (
                                            <Eye className="h-4 w-4" />
                                        ) : (
                                            <Play className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            );
                        }) : (
                            <div className="text-center py-8 text-gray-500">
                                <p>No hay elementos en el cronograma</p>
                            </div>
                        )}
                    </div>

                    {/* Controles */}
                    {scheduleItems.length > 0 && (
                        <div className="flex justify-center space-x-4 mt-8 pt-6 border-t border-gray-200">
                            <button
                                onClick={handlePrevious}
                                disabled={currentItemIndex === 0}
                                className="flex items-center space-x-2 px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <ArrowLeft className="h-5 w-5" />
                                <span>Anterior</span>
                            </button>

                            <button
                                onClick={handlePlayPause}
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${isRunning
                                    ? 'bg-red-600 text-white hover:bg-red-700'
                                    : 'bg-green-600 text-white hover:bg-green-700'
                                    }`}
                            >
                                {isRunning ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                                <span>{isRunning ? 'Pausar' : 'Continuar'}</span>
                            </button>

                            <button
                                onClick={handleNext}
                                disabled={currentItemIndex === scheduleItems.length - 1}
                                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
                            >
                                <span>Siguiente</span>
                                <SkipForward className="h-5 w-5" />
                            </button>
                        </div>
                    )}

                    {/* Estadísticas del progreso */}
                    {scheduleItems.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                            <div className="flex justify-between text-sm text-gray-600">
                                <span>Progreso: {currentItemIndex + 1} de {scheduleItems.length}</span>
                                <span>
                                    Tiempo estimado restante: {
                                        scheduleItems.slice(currentItemIndex).reduce((total, item) => total + (item.estimatedTime || 0), 0)
                                    } minutos
                                </span>
                            </div>

                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentItemIndex + 1) / scheduleItems.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}

                    {/* Resumen de participantes por modalidad */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">Resumen de participantes por modalidad</h4>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {Object.entries(participantStats).map(([level, categories]) => {
                                const levelTotal = Object.values(categories).reduce((sum, categoryData) => {
                                    return sum + Object.values(categoryData).reduce((genderSum, genderData) => genderSum + genderData.count, 0);
                                }, 0);

                                const categoryCount = Object.keys(categories).length;

                                return (
                                    <div key={level} className="bg-gray-50 rounded-lg p-3">
                                        <div className="font-medium text-gray-700 capitalize text-sm">{level}</div>
                                        <div className="text-lg font-bold text-gray-800">{levelTotal}</div>
                                        <div className="text-xs text-gray-500">
                                            {categoryCount} categoría{categoryCount !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Desglose por categoría y género */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h4 className="font-medium text-gray-800 mb-3">Desglose por categoría y género</h4>
                        <div className="space-y-4">
                            {Object.entries(participantStats).map(([level, categories]) => (
                                <div key={level} className="bg-gray-50 rounded-lg p-4">
                                    <h5 className="font-medium text-gray-700 capitalize mb-3">{level}</h5>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {Object.entries(categories).map(([category, genders]) => (
                                            <div key={category} className="bg-white rounded p-3">
                                                <div className="font-medium text-sm text-gray-600 mb-2">{category}</div>
                                                <div className="space-y-1">
                                                    {Object.entries(genders).map(([gender, data]) => (
                                                        <div key={gender} className="flex justify-between text-sm">
                                                            <span className="text-gray-500">{gender}:</span>
                                                            <span className="font-medium">{data.count}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal de confirmación de tandas */}
            <TandasConfirmationModal
                isOpen={showTandasModal}
                onClose={handleCloseModal}
                onConfirm={handleConfirmTandas}
                tandas={generatedTandas}
                allParticipants={selectedItem ? (
                    selectedItem.gender
                        ? getParticipantsByGender(selectedItem.levelId, selectedItem.category, selectedItem.gender)
                        : getParticipantsByCategory(selectedItem.levelId, selectedItem.category)
                ) : []}
                level={selectedItem?.levelId || ''}
                category={selectedItem?.category || ''}
                gender={selectedItem?.gender || ''}
                isLoading={isConfirmingTandas}
            />
        </div>
    );
};