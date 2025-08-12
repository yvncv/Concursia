import React, { useState, useEffect } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { LiveCompetition } from '@/app/types/liveCompetitionType';
import { 
  Trophy, 
  Users, 
  Clock, 
  Calendar, 
  Award, 
  BarChart3, 
  Timer,
  CheckCircle,
  Target,
  Star,
  Medal,
  TrendingUp,
  Play,
  AlertCircle
} from 'lucide-react';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from '@/app/hooks/useUsers';
import { useEventProgress } from '@/app/hooks/useEventProgress';

interface OverviewProps {
  event: CustomEvent;
}

interface CompetitionResult {
  id: string;
  level: string;
  category: string;
  gender: string;
  totalParticipants: number;
  totalTandas: number;
  completedTandas: number;
  status: string;
  realStartTime?: Date;
  realEndTime?: Date;
  duration?: number; // en minutos
  winners?: { blockIndex: number; participantId: string; participantName: string; score: number }[];
}

interface JudgeStats {
  judgeId: string;
  judgeName: string;
  totalScores: number;
  averageScore: number;
  competitionsJudged: number;
}

const Overview: React.FC<OverviewProps> = ({ event }) => {
  const [competitionResults, setCompetitionResults] = useState<CompetitionResult[]>([]);
  const [judgeStats, setJudgeStats] = useState<JudgeStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLiveCompetitions, setHasLiveCompetitions] = useState(false);
  const { users } = useUsers();
  const { 
    totalCompetitions, 
    completedCompetitions, 
    isEventCompleted, 
    progressPercentage 
  } = useEventProgress(event.id);

  useEffect(() => {
    checkLiveCompetitionsAndLoadData();
  }, [event.id]);

  const checkLiveCompetitionsAndLoadData = async () => {
    try {
      setLoading(true);
      
      // Verificar si hay LiveCompetitions
      const competitionsRef = collection(db, 'eventos', event.id, 'liveCompetition');
      const competitionsSnapshot = await getDocs(competitionsRef);
      
      if (competitionsSnapshot.empty) {
        setHasLiveCompetitions(false);
        setLoading(false);
        return;
      }
      
      setHasLiveCompetitions(true);
      await loadCompetitionData();
      
    } catch (error) {
      console.error('Error verificando competencias:', error);
      setHasLiveCompetitions(false);
      setLoading(false);
    }
  };

  const getUserById = async (userId: string): Promise<{ firstName: string; lastName: string } | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          firstName: userData.firstName || 'Nombre',
          lastName: userData.lastName || 'Desconocido'
        };
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo usuario:', error);
      return null;
    }
  };

  const loadCompetitionData = async () => {
    try {
      // Cargar competencias
      const competitionsRef = collection(db, 'eventos', event.id, 'liveCompetition');
      const competitionsSnapshot = await getDocs(competitionsRef);
      
      const results: CompetitionResult[] = [];
      const judgeScoreMap: { [judgeId: string]: { scores: number[]; competitions: Set<string>; name: string } } = {};

      for (const compDoc of competitionsSnapshot.docs) {
        const comp = { id: compDoc.id, ...compDoc.data() } as LiveCompetition;
        
        // Cargar tandas de esta competencia
        const tandasRef = collection(db, 'eventos', event.id, 'liveCompetition', comp.id, 'tandas');
        const tandasSnapshot = await getDocs(tandasRef);
        
        const winners: any[] = [];
        
        // Procesar tandas para obtener ganadores y estadísticas de jurados
        for (const tandaDoc of tandasSnapshot.docs) {
          const tanda = tandaDoc.data();
          
          if (tanda.blocks && Array.isArray(tanda.blocks)) {
            for (const [blockIndex, block] of tanda.blocks.entries()) {
              // Procesar participantes para encontrar ganadores
              if (block.participants && Array.isArray(block.participants)) {
                let highestScore = -1;
                let winner = null;
                
                for (const participant of block.participants) {
                  if (participant.scores && Array.isArray(participant.scores)) {
                    const totalScore = participant.scores.reduce((sum: number, score: any) => {
                      // Agregar a estadísticas de jurados
                      if (score.judgeId && typeof score.score === 'number') {
                        if (!judgeScoreMap[score.judgeId]) {
                          judgeScoreMap[score.judgeId] = {
                            scores: [],
                            competitions: new Set(),
                            name: 'Cargando...'
                          };
                        }
                        judgeScoreMap[score.judgeId].scores.push(score.score);
                        judgeScoreMap[score.judgeId].competitions.add(comp.id);
                      }
                      return sum + (typeof score.score === 'number' ? score.score : 0);
                    }, 0);
                    
                    if (totalScore > highestScore) {
                      highestScore = totalScore;
                      winner = {
                        blockIndex,
                        participantId: participant.participantId,
                        participantName: 'Participante', // Aquí podrías obtener el nombre real
                        score: totalScore
                      };
                    }
                  }
                }
                
                if (winner) {
                  winners.push(winner);
                }
              }
            }
          }
        }

        // Calcular duración - CORREGIDO
        let duration: number | undefined;
        if (comp.realStartTime && comp.realEndTime) {
          const startTime = comp.realStartTime.toDate();
          const endTime = comp.realEndTime.toDate();
          duration = Math.floor((endTime.getTime() - startTime.getTime()) / (1000 * 60));
        }

        results.push({
          id: comp.id,
          level: comp.level,
          category: comp.category,
          gender: comp.gender,
          totalParticipants: comp.totalParticipants,
          totalTandas: comp.totalTandas,
          completedTandas: comp.completedTandas,
          status: comp.status,
          realStartTime: comp.realStartTime?.toDate(),
          realEndTime: comp.realEndTime?.toDate(),
          duration,
          winners
        });
      }

      // Cargar nombres de jurados
      for (const judgeId of Object.keys(judgeScoreMap)) {
        const userData = await getUserById(judgeId);
        if (userData) {
          judgeScoreMap[judgeId].name = `${userData.firstName} ${userData.lastName}`;
        } else {
          judgeScoreMap[judgeId].name = 'Jurado desconocido';
        }
      }

      // Procesar estadísticas de jurados
      const judgeStatsArray: JudgeStats[] = Object.entries(judgeScoreMap).map(([judgeId, data]) => ({
        judgeId,
        judgeName: data.name,
        totalScores: data.scores.length,
        averageScore: data.scores.length > 0 ? data.scores.reduce((a, b) => a + b, 0) / data.scores.length : 0,
        competitionsJudged: data.competitions.size
      }));

      setCompetitionResults(results);
      setJudgeStats(judgeStatsArray.sort((a, b) => b.totalScores - a.totalScores));
      
    } catch (error) {
      console.error('Error cargando datos de competencias:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  };

  const formatDateTime = (date: Date): string => {
    return date.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Calcular estadísticas generales
  const totalParticipants = competitionResults.reduce((sum, comp) => sum + comp.totalParticipants, 0);
  const totalDuration = competitionResults.reduce((sum, comp) => sum + (comp.duration || 0), 0);
  const averageDurationPerCompetition = competitionResults.length > 0 ? Math.round(totalDuration / competitionResults.length) : 0;
  const completedCompetitionsCount = competitionResults.filter(comp => comp.status === 'completed').length;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Si no hay LiveCompetitions, mostrar mensaje
  if (!hasLiveCompetitions) {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard del Evento</h1>
          <p className="text-gray-600">Resumen completo de resultados y estadísticas</p>
        </div>

        {/* Mensaje de evento no iniciado */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Play className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Evento aún no iniciado
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Para ver las estadísticas y resultados del evento, primero debes iniciar el concurso. 
            Una vez iniciado, aquí encontrarás toda la información detallada.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-lg mx-auto">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
              <div className="text-left">
                <h3 className="font-medium text-blue-800 mb-1">¿Cómo iniciar el concurso?</h3>
                <p className="text-sm text-blue-700">
                  Ve a la sección de gestión del evento y presiona "Iniciar Concurso" para comenzar 
                  a generar las competencias en vivo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Información básica del evento */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Información del Evento</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Users className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {Object.values(event.participants || {}).reduce((total, levelParticipants) => {
                  return total + Object.values(levelParticipants).reduce((levelTotal, categoryData) => {
                    return levelTotal + categoryData.count;
                  }, 0);
                }, 0)}
              </div>
              <div className="text-sm text-gray-600">Participantes Registrados</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Trophy className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {Object.keys(event.dance?.levels || {}).length}
              </div>
              <div className="text-sm text-gray-600">Modalidades Configuradas</div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Calendar className="w-8 h-8 text-gray-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-gray-800">
                {event.status}
              </div>
              <div className="text-sm text-gray-600">Estado Actual</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Dashboard del Evento</h1>
          <p className="text-gray-600">Resumen completo de resultados y estadísticas</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-medium ${
          isEventCompleted 
            ? 'bg-green-100 text-green-800' 
            : 'bg-blue-100 text-blue-800'
        }`}>
          {isEventCompleted ? '✅ Evento Completado' : '🔄 En Progreso'}
        </div>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Total Participantes</span>
            <Users className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{totalParticipants}</div>
          <div className="text-xs text-gray-500 mt-1">
            En {competitionResults.length} competencias
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Competencias</span>
            <Trophy className="h-5 w-5 text-yellow-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">
            {completedCompetitionsCount}/{totalCompetitions}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round(progressPercentage)}% completado
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Duración Total</span>
            <Clock className="h-5 w-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{formatTime(totalDuration)}</div>
          <div className="text-xs text-gray-500 mt-1">
            Promedio: {formatTime(averageDurationPerCompetition)}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Jurados Activos</span>
            <Award className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-gray-800">{judgeStats.length}</div>
          <div className="text-xs text-gray-500 mt-1">
            {judgeStats.reduce((sum, j) => sum + j.totalScores, 0)} calificaciones
          </div>
        </div>
      </div>

      {/* Progreso del evento */}
      {!isEventCompleted && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Progreso del Evento</h2>
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className="bg-blue-600 h-3 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>{completedCompetitionsCount} competencias completadas</span>
            <span>{totalCompetitions - completedCompetitionsCount} pendientes</span>
          </div>
        </div>
      )}

      {/* Resultados por competencia */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Medal className="w-5 h-5 mr-2 text-yellow-600" />
            Resultados por Competencia
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Competencia</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Participantes</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tandas</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Duración</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Horario</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ganadores</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {competitionResults.map((comp) => (
                <tr key={comp.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <div className="font-medium text-gray-900">
                        {comp.level} {comp.category}
                      </div>
                      <div className="text-sm text-gray-500">{comp.gender}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      comp.status === 'completed' 
                        ? 'bg-green-100 text-green-800' 
                        : comp.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {comp.status === 'completed' ? 'Completada' : 
                       comp.status === 'active' ? 'Activa' : 'Pendiente'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comp.totalParticipants}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comp.completedTandas}/{comp.totalTandas}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comp.duration ? formatTime(comp.duration) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {comp.realStartTime && comp.realEndTime ? (
                      <div>
                        <div>{formatDateTime(comp.realStartTime)}</div>
                        <div className="text-xs">→ {formatDateTime(comp.realEndTime)}</div>
                      </div>
                    ) : comp.realStartTime ? (
                      <div>Iniciado: {formatDateTime(comp.realStartTime)}</div>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {comp.winners && comp.winners.length > 0 ? (
                      <div className="space-y-1">
                        {comp.winners.slice(0, 2).map((winner, idx) => (
                          <div key={idx} className="flex items-center text-xs">
                            <Trophy className="w-3 h-3 text-yellow-500 mr-1" />
                            <span>Bloque {String.fromCharCode(65 + winner.blockIndex)}: {winner.score}pts</span>
                          </div>
                        ))}
                        {comp.winners.length > 2 && (
                          <div className="text-xs text-gray-500">+{comp.winners.length - 2} más</div>
                        )}
                      </div>
                    ) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Estadísticas de jurados */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center">
            <Star className="w-5 h-5 mr-2 text-purple-600" />
            Estadísticas de Jurados
          </h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {judgeStats.slice(0, 6).map((judge) => (
              <div key={judge.judgeId} className="bg-gray-50 p-4 rounded-lg">
                <div className="font-medium text-gray-800 mb-2">{judge.judgeName}</div>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Calificaciones:</span>
                    <span className="font-medium">{judge.totalScores}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Promedio:</span>
                    <span className="font-medium">{judge.averageScore.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Competencias:</span>
                    <span className="font-medium">{judge.competitionsJudged}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {judgeStats.length > 6 && (
            <div className="mt-4 text-center text-sm text-gray-500">
              Mostrando 6 de {judgeStats.length} jurados
            </div>
          )}
        </div>
      </div>

      {/* Timeline del evento */}
      {event.realStartTime && (
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <Calendar className="w-5 h-5 mr-2 text-blue-600" />
            Timeline del Evento
          </h2>
          <div className="space-y-3">
            {event.realStartTime && (
              <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-blue-600 rounded-full mr-3"></div>
                  <span className="font-medium">Evento iniciado</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDateTime(event.realStartTime.toDate())}
                </span>
              </div>
            )}
            
            {competitionResults
              .filter(comp => comp.realStartTime)
              .slice(0, 5)
              .map((comp) => (
                <div key={comp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full mr-3 ${
                      comp.status === 'completed' ? 'bg-green-600' : 'bg-yellow-600'
                    }`}></div>
                    <span>{comp.level} {comp.category} {comp.gender}</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {comp.realStartTime && formatDateTime(comp.realStartTime)}
                  </span>
                </div>
              ))}

            {event.realEndTime && (
              <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-green-600 rounded-full mr-3"></div>
                  <span className="font-medium">Evento finalizado</span>
                </div>
                <span className="text-sm text-gray-600">
                  {formatDateTime(event.realEndTime.toDate())}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Overview;