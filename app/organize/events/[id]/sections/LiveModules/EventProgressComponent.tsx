import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { getEventProgress } from '@/app/services/competitionFlowService';
import { LiveCompetition } from '@/app/types/liveCompetitionType';

interface EventProgressProps {
  eventId: string;
}

interface EventProgressData {
  totalCompetitions: number;
  completedCompetitions: number;
  currentCompetition: LiveCompetition | null;
  isEventCompleted: boolean;
}

export const EventProgressComponent: React.FC<EventProgressProps> = ({ eventId }) => {
  const [progressData, setProgressData] = useState<EventProgressData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar progreso del evento
  useEffect(() => {
    const loadProgress = async () => {
      try {
        setLoading(true);
        const progress = await getEventProgress(eventId);
        setProgressData(progress);
        setError(null);
      } catch (err) {
        console.error('Error cargando progreso:', err);
        setError('Error al cargar el progreso del evento');
      } finally {
        setLoading(false);
      }
    };

    loadProgress();
    
    // Actualizar cada 30 segundos
    const interval = setInterval(loadProgress, 30000);
    
    return () => clearInterval(interval);
  }, [eventId]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </div>
    );
  }

  if (error || !progressData) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center text-red-600">
          <span className="mr-2">⚠️</span>
          <span>{error || 'No se pudo cargar el progreso'}</span>
        </div>
      </div>
    );
  }

  const { totalCompetitions, completedCompetitions, currentCompetition, isEventCompleted } = progressData;
  const progressPercentage = totalCompetitions > 0 ? (completedCompetitions / totalCompetitions) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Header del progreso */}
      <div className={`rounded-xl p-6 border ${
        isEventCompleted 
          ? 'bg-green-50 border-green-200' 
          : 'bg-blue-50 border-blue-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            {isEventCompleted ? (
              <Trophy className="w-8 h-8 text-green-600" />
            ) : (
              <Clock className="w-8 h-8 text-blue-600" />
            )}
            <div>
              <h2 className={`text-xl font-bold ${
                isEventCompleted ? 'text-green-800' : 'text-blue-800'
              }`}>
                {isEventCompleted ? '🏆 Evento Completado' : '🎯 Evento en Progreso'}
              </h2>
              <p className={`text-sm ${
                isEventCompleted ? 'text-green-600' : 'text-blue-600'
              }`}>
                {completedCompetitions} de {totalCompetitions} competencias completadas
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className={`text-3xl font-bold ${
              isEventCompleted ? 'text-green-600' : 'text-blue-600'
            }`}>
              {Math.round(progressPercentage)}%
            </div>
            <div className="text-xs text-gray-500">Progreso</div>
          </div>
        </div>

        {/* Barra de progreso */}
        <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
          <div 
            className={`h-full transition-all duration-500 ${
              isEventCompleted 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-blue-500 to-blue-600'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Competencia actual */}
      {currentCompetition && !isEventCompleted && (
        <div className="bg-white rounded-xl shadow-sm border p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center">
              <span className="w-3 h-3 bg-orange-500 rounded-full mr-3 animate-pulse"></span>
              Competencia Activa
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              currentCompetition.status === 'active' 
                ? 'bg-green-100 text-green-700' 
                : 'bg-yellow-100 text-yellow-700'
            }`}>
              {currentCompetition.status === 'active' ? 'En Curso' : 'Pendiente'}
            </span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div>
              <div className="text-sm text-gray-600 mb-1">Modalidad:</div>
              <div className="font-semibold text-gray-800">{currentCompetition.level}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Categoría:</div>
              <div className="font-semibold text-gray-800">{currentCompetition.category}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Género:</div>
              <div className="font-semibold text-gray-800">{currentCompetition.gender}</div>
            </div>
            <div>
              <div className="text-sm text-gray-600 mb-1">Participantes:</div>
              <div className="font-semibold text-gray-800 flex items-center">
                <Users className="w-4 h-4 mr-1" />
                {currentCompetition.totalParticipants}
              </div>
            </div>
          </div>

          {/* Progreso de tandas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                Progreso de Tandas
              </span>
              <span className="text-sm text-gray-600">
                {currentCompetition.completedTandas} / {currentCompetition.totalTandas}
              </span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${(currentCompetition.completedTandas / currentCompetition.totalTandas) * 100}%` 
                }}
              ></div>
            </div>
            
            {currentCompetition.completedTandas < currentCompetition.totalTandas && (
              <div className="mt-2 text-xs text-gray-500">
                Tanda actual: {currentCompetition.currentTandaIndex + 1}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Resumen de competencias */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">
          Resumen de Competencias
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-600">{completedCompetitions}</div>
            <div className="text-sm text-green-700">Completadas</div>
          </div>
          
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Clock className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-600">
              {currentCompetition && !isEventCompleted ? 1 : 0}
            </div>
            <div className="text-sm text-orange-700">En Curso</div>
          </div>
          
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <ArrowRight className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-600">
              {totalCompetitions - completedCompetitions - (currentCompetition && !isEventCompleted ? 1 : 0)}
            </div>
            <div className="text-sm text-gray-700">Pendientes</div>
          </div>
        </div>
      </div>

      {/* Mensaje de finalización */}
      {isEventCompleted && (
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white text-center">
          <Trophy className="w-12 h-12 mx-auto mb-4" />
          <h3 className="text-xl font-bold mb-2">¡Felicitaciones!</h3>
          <p className="text-green-100">
            El evento ha sido completado exitosamente. Todas las competencias han finalizado.
          </p>
        </div>
      )}
    </div>
  );
};