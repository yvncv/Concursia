import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Users, Clock, Play, Settings } from 'lucide-react';
import { CustomEvent } from '@/app/types/eventType';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { useParticipantsWithUsers, getParticipantDisplayName, getParticipantImages } from '@/app/hooks/useParticipantsWithUsers';
import { JudgeSelectionModal } from './modals/JudgesSelectionModal';
import { BlockInTanda } from '@/app/types/blockInTandaType';
import JudgeAvatar from './components/JudgeAvatar';
import useUsers from '@/app/hooks/useUsers';
import { User } from '@/app/types/userType';
import useLiveCompetitions from '@/app/hooks/useLiveCompetition';

interface TandaExecutionViewProps {
  event: CustomEvent;
  level: string;
  category: string;
  gender: string;
  currentTanda: Tanda;
  allParticipants: Participant[];
  onBack: () => void;
  onNextTanda?: () => void;
  onPreviousTanda?: () => void;
}

interface ParticipantCardProps {
  participantId: string;
  allParticipants: Participant[];
  pistaNumber: number;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participantId,
  allParticipants,
  pistaNumber
}) => {
  const participant = allParticipants.find(p => p.id === participantId);
  const participantsWithUsers = useParticipantsWithUsers(participant ? [participant] : []);
  const participantWithUsers = participantsWithUsers[0];

  if (!participant || !participantWithUsers) {
    return (
      <div className="bg-yellow-200 rounded-lg p-4 text-center min-h-[120px] flex items-center justify-center">
        <div className="text-gray-600 text-sm">Cargando...</div>
      </div>
    );
  }

  if (participantWithUsers.isLoading) {
    return (
      <div className="bg-yellow-200 rounded-lg p-4 text-center min-h-[120px] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-2"></div>
          <div className="h-3 bg-gray-300 rounded mb-1"></div>
          <div className="h-3 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const displayName = getParticipantDisplayName(participantWithUsers);
  const images = getParticipantImages(participantWithUsers);
  const isCouple = participantWithUsers.users.length === 2;

  return (
    <div className="bg-yellow-200 rounded-lg p-4 text-center min-h-[120px] flex flex-col items-center justify-center relative">

      {/* Imagen(es) del participante */}
      <div className="mb-2">
        {isCouple ? (
          <div className="flex justify-center space-x-1">
            {images.map((image, index) => (
              <div key={index} className="relative">
                {image ? (
                  <img
                    src={image}
                    alt={`Participante ${index + 1}`}
                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300">
                    <Users className="w-4 h-4 text-gray-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center">
            {images[0] ? (
              <img
                src={images[0]}
                alt="Participante"
                className="w-12 h-12 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300">
                <Users className="w-6 h-6 text-gray-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nombre del participante */}
      <div className="text-xs font-medium text-gray-800 mb-1 leading-tight text-center">
        {displayName}
      </div>

      {/* Código del participante */}
      <div className="text-xs text-gray-600">
        Numero: #{participant.code}
      </div>
    </div>
  );
};

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
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [tempBlocks, setTempBlocks] = useState<BlockInTanda[]>([]);
  const [currentTandaState, setcurrentTandaStateState] = useState<Tanda>(currentTanda);
  const { users } = useUsers();
  const { liveCompetitions } = useLiveCompetitions(event.id);
  const usersMap = useMemo(() => {
    const map: Record<string, User> = {};
    users.forEach(user => {
      map[user.id] = user;
    });
    return map;
  }, [users]);

  useEffect(() => {
    setcurrentTandaStateState(currentTanda);
  }, [currentTanda]);

  // Temporizador para la tanda
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
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartPause = () => {
    setIsRunning(!isRunning);
  };

  // Verificar si un bloque tiene jurados asignados
  const hasJudges = (blockIndex: number): boolean => {
    const block = currentTandaState.blocks[blockIndex];
    return block && block.judgeIds && block.judgeIds.length > 0;
  };

  // Obtener el total de participantes en la tanda
  const totalParticipants = currentTandaState.blocks.reduce(
    (total, block) => total + block.participants.length,
    0
  );

  function getAvailableJudges(event: CustomEvent): { userId: string }[] {
    return (event.staff || []).filter(member =>
      member.permissions.includes('judge') // solo jurados
    );
  }

  const handleAssignJudges = (blocks: BlockInTanda[]) => {
    setTempBlocks(blocks);
    setShowJudgeModal(true);
  };

  const liveCompetition = liveCompetitions.find(c => c.id === currentTandaState.liveCompetitionId);

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
                {formatTime(currentTime)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Información de la competencia actual */}
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
              <div className="text-sm opacity-90 mb-1">Tanda N°:</div>
              <div className="font-bold text-lg">{currentTandaState.index + 1}</div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm opacity-90 mr-2">Participantes:</span>
                <span className="font-bold text-lg">{totalParticipants}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Fase: {currentTandaState.phase}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de pistas - NUEVO DISEÑO COMO LAS IMÁGENES */}
        <div className="space-y-8">
          {currentTandaState.blocks.length === 1 ? (
            /* DISEÑO HORIZONTAL - UN SOLO BLOQUE (como imagen 1) */
            <div className="bg-white rounded-xl shadow-lg p-6 relative">
              {/* Estado de jurados del bloque */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">Jurados asignados</div>
                      <div className="text-sm text-gray-600">
                        {hasJudges(0)
                          ? `${currentTandaState.blocks[0].judgeIds.length} jurados seleccionados`
                          : 'Sin jurados asignados'}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAssignJudges(currentTandaState.blocks)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Seleccionar Jurados</span>
                  </button>

                  {hasJudges(0) && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Listo para competir</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Jurados superiores */}
              {hasJudges(0) && (
                <div className="flex justify-center gap-3 mb-4">
                  {currentTandaState.blocks[0].judgeIds.slice(0, Math.ceil(currentTandaState.blocks[0].judgeIds.length / 2)).map((judgeId, index) => (
                    <JudgeAvatar
                      key={judgeId}
                      userId={judgeId}
                      usersMap={usersMap}
                      judgeIndex={index}
                    />
                  ))}
                </div>
              )}

              {/* Área de pistas */}
              <div className="border-4 border-gray-800 rounded-2xl bg-yellow-100 p-6">
                <div className="grid gap-4 mb-4" style={{
                  gridTemplateColumns: `repeat(${currentTandaState.blocks[0].participants.length}, 1fr)`
                }}>
                  {currentTandaState.blocks[0].participants.map((_, pistaIndex) => (
                    <div key={`header-${pistaIndex}`} className="text-center">
                      <div className="bg-pink-400 text-white py-2 px-4 rounded-lg text-sm font-bold">
                        PISTA {pistaIndex + 1}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="grid gap-4" style={{
                  gridTemplateColumns: `repeat(${currentTandaState.blocks[0].participants.length}, 1fr)`
                }}>
                  {currentTandaState.blocks[0].participants.map((tandaParticipant, pistaIndex) => (
                    <div key={tandaParticipant.participantId}
                      className={`relative ${!hasJudges(0) ? 'opacity-50' : ''}`}>
                      {pistaIndex > 0 && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-black -ml-2 rounded"></div>
                      )}
                      <ParticipantCard
                        participantId={tandaParticipant.participantId}
                        allParticipants={allParticipants}
                        pistaNumber={pistaIndex + 1}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Jurados inferiores */}
              {hasJudges(0) && (
                <div className="flex justify-center gap-3 mt-4">
                  {currentTandaState.blocks[0].judgeIds.slice(Math.ceil(currentTandaState.blocks[0].judgeIds.length / 2)).map((judgeId, index) => (
                    <JudgeAvatar
                      key={judgeId}
                      userId={judgeId}
                      usersMap={usersMap}
                      judgeIndex={index + Math.ceil(currentTandaState.blocks[0].judgeIds.length / 2)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* DISEÑO VERTICAL - MÚLTIPLES BLOQUES (como imagen 2) */
            <div
              className="grid gap-6"
              style={{ gridTemplateColumns: `repeat(${Math.min(currentTandaState.blocks.length, 3)}, 1fr)` }}
            >
              {currentTandaState.blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="bg-white rounded-xl shadow-lg p-4 relative flex flex-col items-center">
                  {/* Título del bloque */}
                  <div className="mb-4 text-center">
                    <div className="font-semibold text-gray-800 text-sm mb-1">
                      BLOQUE {String.fromCharCode(65 + blockIndex)}
                    </div>
                    <div className="text-xs text-gray-600">
                      {hasJudges(blockIndex)
                        ? `${block.judgeIds.length} jurado(s)`
                        : 'Sin jurados'}
                    </div>

                    {!hasJudges(blockIndex) && (
                      <button
                        onClick={() => handleAssignJudges([block])}
                        className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                      >
                        Seleccionar
                      </button>
                    )}
                  </div>

                  {/* Jurados a los lados + pista vertical */}
                  <div className="flex items-center justify-center gap-3">
                    {/* Jurados izquierda */}
                    {hasJudges(blockIndex) && (
                      <div className="flex flex-col gap-2">
                        {block.judgeIds.slice(0, Math.ceil(block.judgeIds.length / 2)).map((judgeId, i) => (
                          <JudgeAvatar
                            key={`left-${judgeId}`}
                            userId={judgeId}
                            usersMap={usersMap}
                            judgeIndex={i}
                          />
                        ))}
                      </div>
                    )}

                    {/* Área de pista con participantes */}
                    <div className="border-4 border-gray-800 rounded-lg overflow-hidden bg-yellow-100 min-w-[140px]">
                      {block.participants.map((tandaParticipant, pistaIndex) => (
                        <div
                          key={tandaParticipant.participantId}
                          className={`h-16 flex items-center justify-center px-2 relative text-sm font-medium text-gray-800 ${pistaIndex > 0 ? 'border-t-2 border-gray-800' : ''
                            } ${!hasJudges(blockIndex) ? 'opacity-50' : ''}`}
                        >
                          <ParticipantCard
                            participantId={tandaParticipant.participantId}
                            allParticipants={allParticipants}
                            pistaNumber={pistaIndex + 1}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Jurados derecha */}
                    {hasJudges(blockIndex) && (
                      <div className="flex flex-col gap-2">
                        {block.judgeIds.slice(Math.ceil(block.judgeIds.length / 2)).map((judgeId, i) => (
                          <JudgeAvatar
                            key={`right-${judgeId}`}
                            userId={judgeId}
                            usersMap={usersMap}
                            judgeIndex={i + Math.ceil(block.judgeIds.length / 2)}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

          )}
        </div>

        {/* Controles de la tanda */}
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
              <button
                onClick={handleStartPause}
                disabled={currentTandaState.blocks.some((_, index) => !hasJudges(index))}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${currentTandaState.blocks.some((_, index) => !hasJudges(index))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isRunning
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
              >
                <Play className="w-5 h-5" />
                <span>{isRunning ? 'Pausar Tanda' : 'Iniciar Tanda'}</span>
              </button>
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

          {/* Indicador de estado */}
          {currentTandaState.blocks.some((_, index) => !hasJudges(index)) && (
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="text-yellow-600 mr-3">⚠️</div>
                <div className="text-yellow-800 text-sm">
                  Asigne jurados a todos los bloques antes de iniciar la tanda
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};