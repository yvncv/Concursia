import React from 'react';
import { CustomEvent, ScheduleItem } from '@/app/types/eventType';
import { Users, Award, Clock, Calendar, Timer, MapPin, Play } from 'lucide-react';

interface OverviewProps {
    event: CustomEvent;
}

const Overview: React.FC<OverviewProps> = ({ event }) => {
    // Calcular estadísticas generales
    const scheduleItems = event.settings?.schedule?.items || [];
    const totalParticipants = Object.values(event.participants || {}).reduce((total, levelParticipants) => {
        return total + Object.values(levelParticipants).reduce((levelTotal, categoryData) => {
            return levelTotal + categoryData.count;
        }, 0);
    }, 0);

    // Calcular modalidades únicas y categorías totales
    const uniqueLevels = [...new Set(scheduleItems.map(item => item.levelId))];
    const totalCategories = scheduleItems.length;

    // Calcular duración total estimada
    const totalEstimatedTime = scheduleItems.reduce((total, item) => total + (item.estimatedTime || 0), 0);

    // Formatear tiempo
    const formatTime = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours}h ${mins}min`;
    };

    // Calcular hora de finalización estimada
    const calculateEndTime = (startTime: string, durationMinutes: number): string => {
        const [hours, minutes] = startTime.split(':').map(Number);
        const startDate = new Date();
        startDate.setHours(hours, minutes, 0, 0);
        startDate.setMinutes(startDate.getMinutes() + durationMinutes);

        return startDate.toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    // Agrupar items por modalidad para el resumen
    const modalityStats = uniqueLevels.map(levelId => {
        const levelItems = scheduleItems.filter(item => item.levelId === levelId);
        const levelParticipants = Object.values(event.participants?.[levelId] || {}).reduce((sum, cat) => sum + cat.count, 0);
        const levelDuration = levelItems.reduce((sum, item) => sum + (item.estimatedTime || 0), 0);

        return {
            name: levelId.charAt(0).toUpperCase() + levelId.slice(1),
            participants: levelParticipants,
            duration: levelDuration,
            days: 1 // Por ahora asumimos 1 día
        };
    });

    const startTime = "14:00"; // 2:00 PM por defecto
    const estimatedEndTime = calculateEndTime(startTime, totalEstimatedTime);

    return (
        <div className="space-y-6">
            {/* Título */}
            <div>
                <h1 className="text-2xl font-bold text-gray-800 mb-2">Resumen general del concurso</h1>
            </div>

            {/* Estadísticas principales */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Tasa de participantes</span>
                        <Users className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{totalParticipants}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">modalidades</span>
                        <Award className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{uniqueLevels.length}</div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Duración estimada</span>
                        <Clock className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-3xl font-bold text-gray-800">{formatTime(totalEstimatedTime)}</div>
                </div>
            </div>

            {/* Horario */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Horario</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-lg mr-4">
                            <Clock className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Hora de inicio</div>
                            <div className="text-xl font-bold text-gray-800">02:00 pm</div>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="bg-orange-100 p-3 rounded-lg mr-4">
                            <Timer className="h-6 w-6 text-orange-600" />
                        </div>
                        <div>
                            <div className="text-sm text-gray-600">Hora de finalización (est.)</div>
                            <div className="text-xl font-bold text-gray-800">{estimatedEndTime}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Resumen de Modalidades */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen de Modalidades</h2>
                <div className="space-y-4">
                    {modalityStats.map((modality) => (
                        <div key={modality.name} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex items-center">
                                <button className="mr-3 p-2 bg-green-100 hover:bg-green-200 rounded-lg transition-colors duration-150">
                                    <Play className="h-4 w-4 text-green-600" />
                                </button>
                                <div className="font-medium text-gray-800">{modality.name}</div>
                            </div>
                            <div className="flex items-center space-x-6 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <Users className="h-4 w-4 mr-1 text-blue-600" />
                                    <span>{modality.participants}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock className="h-4 w-4 mr-1 text-green-600" />
                                    <span>{formatTime(modality.duration)}</span>
                                </div>
                                <div className="flex items-center">
                                    <Calendar className="h-4 w-4 mr-1 text-purple-600" />
                                    <span>{modality.days} día</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Secuencia del Concurso */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-800">Secuencia del Concurso</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Orden</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Modalidad</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Participantes</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Punto</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duración estimada</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {scheduleItems.slice(0, 10).map((item, index) => {
                                const categoryParticipants = event.participants?.[item.levelId]?.[item.category]?.count || 0;
                                return (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {String(index + 1).padStart(2, '0')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.levelId.charAt(0).toUpperCase() + item.levelId.slice(1)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            {item.category}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {categoryParticipants}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {index + 1}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                            {item.estimatedTime || 0} min
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                {scheduleItems.length > 10 && (
                    <div className="px-6 py-3 bg-gray-50 border-t border-gray-200 text-sm text-gray-600">
                        Mostrando 10 de {scheduleItems.length} elementos del cronograma
                    </div>
                )}
            </div>
        </div>
    );
};

export default Overview;