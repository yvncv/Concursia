import React, { useState, useEffect } from 'react';
import { ArrowLeft, Play, Pause, SkipForward, Clock, Users, Calendar, FileText, BarChart3, Settings, Printer, MoreHorizontal } from 'lucide-react';
import { CustomEvent } from '@/app/types/eventType';

interface LiveContestRunningProps {
    event: CustomEvent;
    onBack: () => void;
}

export const LiveContestRunning: React.FC<LiveContestRunningProps> = ({ event, onBack }) => {
    const [currentTime, setCurrentTime] = useState(0); // Segundos transcurridos
    const [isRunning, setIsRunning] = useState(true);
    const [currentItemIndex, setCurrentItemIndex] = useState(0);

    // Obtener datos del evento
    const scheduleItems = event.settings?.schedule?.items || [];
    const totalParticipants = Object.values(event.participants || {}).reduce((total, levelParticipants) => {
        return total + Object.values(levelParticipants).reduce((levelTotal, categoryData) => {
            return levelTotal + categoryData.count;
        }, 0);
    }, 0);

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

    // Formatear tiempo
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

    // Obtener participantes para el item actual
    const getCurrentParticipants = (item: any) => {
        return event.participants?.[item.levelId]?.[item.category]?.count || 0;
    };

    return (
        <div className="space-y-6">
            {/* Header con título y temporizador */}
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
                
                <div className="text-right">
                    <div className="text-sm text-gray-600 mb-1">Tiempo:</div>
                    <div className="text-xl font-mono font-bold text-gray-800">
                        {formatTime(currentTime)}
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
                        {scheduleItems.length > 0 ? scheduleItems.map((item, index) => (
                            <div
                                key={item.id}
                                className={`flex items-center justify-between p-4 rounded-lg border transition-all ${
                                    index === currentItemIndex
                                        ? 'bg-green-50 border-green-200 shadow-sm'
                                        : index < currentItemIndex
                                        ? 'bg-gray-50 border-gray-200 opacity-60'
                                        : 'bg-white border-gray-200 hover:bg-gray-50'
                                }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <div className={`w-3 h-3 rounded-full ${
                                        index === currentItemIndex
                                            ? 'bg-green-500 animate-pulse'
                                            : index < currentItemIndex
                                            ? 'bg-gray-400'
                                            : 'bg-gray-300'
                                    }`}></div>
                                    <div>
                                        <div className={`font-medium ${
                                            index === currentItemIndex ? 'text-green-800' : 'text-gray-700'
                                        }`}>
                                            {item.category}
                                        </div>
                                        <div className="text-sm text-gray-500 capitalize">
                                            {item.levelId} • {getCurrentParticipants(item)} participantes • {item.estimatedTime || 0} min
                                        </div>
                                    </div>
                                </div>
                                
                                <button 
                                    className={`p-2 rounded-full transition-colors ${
                                        index === currentItemIndex
                                            ? 'bg-green-100 text-green-600 hover:bg-green-200'
                                            : 'bg-gray-100 text-gray-400'
                                    }`}
                                    disabled={index !== currentItemIndex}
                                >
                                    <Play className="h-4 w-4" />
                                </button>
                            </div>
                        )) : (
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
                                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                                    isRunning
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
                            
                            {/* Barra de progreso */}
                            <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                                <div 
                                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${((currentItemIndex + 1) / scheduleItems.length) * 100}%` }}
                                ></div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
