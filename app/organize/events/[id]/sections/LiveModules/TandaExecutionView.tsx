import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Clock, Play, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { CustomEvent } from '@/app/types/eventType';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { JudgeSelectionModal } from './modals/JudgesSelectionModal';
import { BlockInTanda } from '@/app/types/blockInTandaType';
import useUsers from '@/app/hooks/useUsers';
import { User } from '@/app/types/userType';
import useLiveCompetitions from '@/app/hooks/useLiveCompetition';
import { onSnapshot, doc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { ResultTable } from './components/ResultTable';
import { TandaBlocks } from './TandaBlocks';
import { useTandaPlayer } from '@/app/hooks/tanda/useTandaPlayer';
import { finalizeTandaAndCheckTransitions } from '@/app/services/competitionFlowService';

interface TandaExecutionViewProps {
  event: CustomEvent;
  level: string;
  category: string;
  gender: string;
  currentTanda: Tanda | null;
  allParticipants: Participant[];
  onBack: () => void;
  onNextTanda?: () => void;
  onPreviousTanda?: () => void;
}

export const TandaExecutionView: React.FC<TandaExecutionViewProps> = ({
  event,
  level,
  category,
  gender,
  currentTanda,
  allParticipants,
  onBack,
  onNextTanda,
  onPreviousTanda
}) => {
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [tempBlocks, setTempBlocks] = useState<BlockInTanda[]>([]);
  const [currentTandaState, setCurrentTandaState] = useState<Tanda | null>(currentTanda);
  const [isFinalizingCompetition, setIsFinalizingCompetition] = useState(false);
  
  const { users } = useUsers();
  const { liveCompetitions } = useLiveCompetitions(event.id);
  const router = useRouter();

  // Obtener la competencia actual
  const currentLiveCompetition = liveCompetitions.find(
    (c) => c.category === category && c.level === level && c.gender === gender
  );

  // Verificar si todas las tandas están completadas
  const allTandasCompleted = currentLiveCompetition ? 
    currentLiveCompetition.completedTandas >= currentLiveCompetition.totalTandas : false;

  // Verificar si la última tanda está finalizada (para mostrar resultados)
  const isLastTandaFinished = currentTandaState?.status === 'finished' && allTandasCompleted;

  // Hook del reproductor (solo si hay tanda)
  const tandaPlayerData = currentTandaState ? useTandaPlayer({
    eventId: event.id,
    liveCompetitionId: `${level}_${category}_${gender}`,
    tandaIndex: currentTandaState.index,
    currentTandaState: currentTandaState
  }) : null;

  const usersMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach(user => {
      map[user.id] = user;
    });
    return map;
  }, [users]);

  // Obtener jurados requeridos
  const requiredJudgesCount = useMemo(() => {
    const levelConfig = event.dance.levels[level]?.config;
    return levelConfig?.judgesCount || 3;
  }, [event.dance.levels, level]);

  // Suscripción en tiempo real a la tanda
  useEffect(() => {
    if (!currentTanda || !currentLiveCompetition) return;

    const tandaRef = doc(
      db,
      "eventos",
      event.id,
      "liveCompetition",
      currentLiveCompetition.id,
      "tandas",
      `tanda_${currentTanda.index}`
    );

    const unsubscribe = onSnapshot(tandaRef, (docSnap) => {
      if (docSnap.exists()) {
        const updatedTanda = docSnap.data() as Tanda;
        setCurrentTandaState(updatedTanda);
      }
    });

    return () => unsubscribe();
  }, [event.id, currentLiveCompetition, currentTanda]);

  // Función para finalizar competencia
  const handleFinalizeLiveCompetition = async () => {
    if (!currentLiveCompetition) return;
    
    setIsFinalizingCompetition(true);
    try {
      const lastTandaIndex = currentLiveCompetition.totalTandas - 1;
      await finalizeTandaAndCheckTransitions(event.id, currentLiveCompetition.id, lastTandaIndex);
      console.log('✅ Competencia finalizada manualmente');
      
      // Redirigir a Overview después de finalizar
      router.push(`/organize/events/${event.id}`);
      
    } catch (error) {
      console.error('❌ Error al finalizar competencia:', error);
    } finally {
      setIsFinalizingCompetition(false);
    }
  };

  // Verificaciones para tandas
  const hasExactJudges = (blockIndex: number): boolean => {
    if (!currentTandaState) return false;
    const block = currentTandaState.blocks[blockIndex];
    return block && block.judgeIds && block.judgeIds.length === requiredJudgesCount;
  };

  const allBlocksReady = (): boolean => {
    if (!currentTandaState) return false;
    return currentTandaState.blocks.every((_, index) => hasExactJudges(index));
  };

  const totalParticipants = currentTandaState ? currentTandaState.blocks.reduce(
    (total, block) => total + block.participants.length,
    0
  ) : 0;

  const handleAssignJudges = (blocks: BlockInTanda[]) => {
    setTempBlocks(blocks);
    setShowJudgeModal(true);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 rounded transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Evento en vivo</h1>
                <p className="text-sm text-gray-600">{event.name}</p>
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm text-gray-600 mb-1">Tiempo:</div>
              <div className="text-xl font-mono font-bold text-gray-800">
                {tandaPlayerData?.formatTime || '00:00'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la competencia */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg p-6 text-white mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <div className="text-sm opacity-90 mb-1">Modalidad:</div>
              <div className="font-bold text-lg">{level}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Categoría:</div>
              <div className="font-bold text-lg">{category}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">Sexo:</div>
              <div className="font-bold text-lg">{gender}</div>
            </div>
            <div>
              <div className="text-sm opacity-90 mb-1">
                {allTandasCompleted ? 'Competencia:' : 'Tanda N°:'}
              </div>
              <div className="font-bold text-lg">
                {allTandasCompleted ? 'Finalizada' : (currentTandaState?.index ?? 0) + 1}
              </div>
            </div>
          </div>
          
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm opacity-90 mr-2">Participantes:</span>
                <span className="font-bold text-lg">
                  {allTandasCompleted ? 
                    currentLiveCompetition?.totalParticipants || 0 : 
                    totalParticipants
                  }
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">
                  {allTandasCompleted ? 
                    `Tandas: ${currentLiveCompetition?.completedTandas}/${currentLiveCompetition?.totalTandas}` :
                    `Fase: ${currentTandaState?.phase || 'N/A'}`
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        {isLastTandaFinished ? (
          /* MOSTRAR RESULTADOS DE LA ÚLTIMA TANDA PRIMERO */
          <>
            <ResultTable block={currentTandaState.blocks[0]} allParticipants={allParticipants} />
            
            {/* Botón para continuar a finalizar competencia */}
            <div className="mt-6 bg-white rounded-xl shadow-lg p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">
                ¡Última tanda completada!
              </h3>
              <button
                onClick={handleFinalizeLiveCompetition}
                disabled={isFinalizingCompetition}
                className={`px-8 py-3 rounded-lg font-medium transition-all ${
                  isFinalizingCompetition
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
                }`}
              >
                {isFinalizingCompetition ? 'Finalizando...' : '🏁 Finalizar Competencia'}
              </button>
            </div>
          </>
        ) : allTandasCompleted ? (
          /* COMPETENCIA COMPLETADA */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              ¡Todas las tandas completadas!
            </h2>
            <p className="text-gray-600 mb-6">
              Esta competencia ha terminado. Puedes finalizar para pasar a la siguiente.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-800 mb-2">Resumen:</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-blue-600">Participantes:</span>
                  <div className="font-semibold">{currentLiveCompetition?.totalParticipants}</div>
                </div>
                <div>
                  <span className="text-blue-600">Tandas:</span>
                  <div className="font-semibold">{currentLiveCompetition?.completedTandas}/{currentLiveCompetition?.totalTandas}</div>
                </div>
                <div>
                  <span className="text-blue-600">Estado:</span>
                  <div className="font-semibold">{currentLiveCompetition?.status}</div>
                </div>
                <div>
                  <span className="text-blue-600">Fase:</span>
                  <div className="font-semibold">{currentLiveCompetition?.currentPhase}</div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFinalizeLiveCompetition}
              disabled={isFinalizingCompetition}
              className={`px-8 py-3 rounded-lg font-medium transition-all ${
                isFinalizingCompetition
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 transform hover:scale-105'
              }`}
            >
              {isFinalizingCompetition ? 'Finalizando...' : '🏁 Finalizar Competencia'}
            </button>
          </div>
        ) : currentTandaState && tandaPlayerData ? (
          /* HAY TANDA ACTIVA */
          <>
            {tandaPlayerData.isFinished ? (
              <ResultTable block={currentTandaState.blocks[0]} allParticipants={allParticipants} />
            ) : (
              <div className="space-y-8">
                <TandaBlocks
                  currentTanda={currentTandaState}
                  allParticipants={allParticipants}
                  requiredJudgesCount={requiredJudgesCount}
                  usersMap={usersMap}
                  onAssignJudges={handleAssignJudges}
                />
              </div>
            )}

            {/* Controles */}
            <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {onPreviousTanda && (
                    <button
                      onClick={onPreviousTanda}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Tanda Anterior
                    </button>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {!tandaPlayerData.isFinished && (
                    <>
                      {!tandaPlayerData.isWaitingScores && (
                        <button
                          onClick={tandaPlayerData.controls.handleStartPause}
                          disabled={!allBlocksReady()}
                          className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${!allBlocksReady()
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : tandaPlayerData.isRunning
                              ? 'bg-red-600 text-white hover:bg-red-700'
                              : 'bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                          <Play className="w-5 h-5" />
                          <span>
                            {tandaPlayerData.status === 'stopped' ? 'Iniciar Tanda' : 
                             tandaPlayerData.status === 'playing' ? 'Pausar Tanda' : 
                             'Reanudar Tanda'}
                          </span>
                        </button>
                      )}
                      
                      {tandaPlayerData.status === 'playing' && (
                        <button
                          onClick={tandaPlayerData.controls.handleOpenVoting}
                          className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                        >
                          <span>🗳️</span>
                          <span>Abrir Votación</span>
                        </button>
                      )}
                      
                      {tandaPlayerData.isWaitingScores && (
                        <>
                          <div className="flex items-center space-x-3 px-6 py-3 rounded-lg bg-blue-50 border border-blue-200">
                            <div className="flex items-center space-x-2">
                              <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                              <span className="text-blue-800 font-medium">
                                Esperando votos: {tandaPlayerData.votingProgress.votedJudges}/{tandaPlayerData.votingProgress.totalJudges}
                              </span>
                            </div>
                            <div className="w-24 h-2 bg-blue-200 rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-blue-600 transition-all duration-300"
                                style={{ 
                                  width: `${(tandaPlayerData.votingProgress.votedJudges / tandaPlayerData.votingProgress.totalJudges) * 100}%` 
                                }}
                              ></div>
                            </div>
                          </div>
                          
                          <button
                            onClick={tandaPlayerData.controls.handleFinish}
                            className="flex items-center space-x-2 px-6 py-3 rounded-lg font-medium bg-orange-600 text-white hover:bg-orange-700 transition-colors"
                          >
                            <span>🏁</span>
                            <span>Finalizar Ahora</span>
                          </button>
                        </>
                      )}
                    </>
                  )}
                  
                  {tandaPlayerData.isFinished && (
                    <div className="flex items-center space-x-2 px-6 py-3 rounded-lg bg-gray-100 text-gray-700">
                      <span>✅</span>
                      <span>Tanda Finalizada</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {onNextTanda && (
                    <button
                      onClick={onNextTanda}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Siguiente Tanda
                    </button>
                  )}
                </div>
              </div>

              {/* Indicadores de estado */}
              {!allBlocksReady() && !tandaPlayerData.isFinished && tandaPlayerData.status === 'stopped' && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-yellow-600 mr-3">⚠️</div>
                    <div className="text-yellow-800 text-sm">
                      Cada bloque necesita exactamente {requiredJudgesCount} jurado(s) para iniciar la tanda
                    </div>
                  </div>
                </div>
              )}

              {allBlocksReady() && tandaPlayerData.status === 'stopped' && !tandaPlayerData.isFinished && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">✅</div>
                    <div className="text-green-800 text-sm">
                      Todos los bloques tienen {requiredJudgesCount} jurados asignados. ¡Listo para comenzar!
                    </div>
                  </div>
                </div>
              )}

              {tandaPlayerData.status === 'playing' && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-blue-600 mr-3">▶️</div>
                    <div className="text-blue-800 text-sm">
                      Tanda en curso - Los participantes están bailando
                    </div>
                  </div>
                </div>
              )}

              {tandaPlayerData.status === 'paused' && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-orange-600 mr-3">⏸️</div>
                    <div className="text-orange-800 text-sm">
                      Tanda pausada - Presiona "Reanudar" para continuar
                    </div>
                  </div>
                </div>
              )}

              {tandaPlayerData.isWaitingScores && (
                <div className="mt-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="text-purple-600 mr-3">🗳️</div>
                      <div className="text-purple-800 text-sm">
                        Votación abierta - Los jurados pueden calificar ({tandaPlayerData.votingProgress.votedJudges}/{tandaPlayerData.votingProgress.totalJudges} han votado)
                      </div>
                    </div>
                    {tandaPlayerData.allJudgesVoted && (
                      <div className="text-green-600 text-sm font-medium animate-pulse">
                        ¡Todos han votado! Finalizando automáticamente...
                      </div>
                    )}
                  </div>
                </div>
              )}

              {tandaPlayerData.isFinished && (
                <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <div className="text-green-600 mr-3">🏁</div>
                    <div className="text-green-800 text-sm">
                      Tanda finalizada - Resultados disponibles arriba
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        ) : (
          /* NO HAY TANDAS */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-gray-400 mb-4">
              <Clock className="w-16 h-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">
              No hay tandas disponibles
            </h2>
            <p className="text-gray-600">
              Esta competencia no tiene tandas generadas o ya han sido completadas.
            </p>
          </div>
        )}
      </div>

      {/* Modal de jurados */}
      {showJudgeModal && currentTandaState && (
        <JudgeSelectionModal
          open={showJudgeModal}
          onClose={() => setShowJudgeModal(false)}
          eventId={event.id}
          tandaId={currentTandaState.id}
          liveCompetitionId={`${level}_${category}_${gender}`}
          eventStaff={event.staff || []}
          tandaBlocks={tempBlocks}
          onConfirm={(updatedBlocks) => {
            setCurrentTandaState(prev => prev ? ({
              ...prev,
              blocks: updatedBlocks
            }) : null);
          }}
          judgesCount={requiredJudgesCount}
        />
      )}
    </div>
  );
};