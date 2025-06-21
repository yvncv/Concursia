import React, { useState, useEffect } from 'react';
import { ArrowLeft, Users, Clock, Play, Settings } from 'lucide-react';
import { CustomEvent } from '@/app/types/eventType';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { useParticipantsWithUsers, getParticipantDisplayName, getParticipantImages } from '@/app/hooks/useParticipantsWithUsers';

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
    const block = currentTanda.blocks[blockIndex];
    return block && block.judgeIds && block.judgeIds.length > 0;
  };

  // Obtener el total de participantes en la tanda
  const totalParticipants = currentTanda.blocks.reduce(
    (total, block) => total + block.participants.length, 
    0
  );

  // Componente para mostrar un jurado
  const JudgeAvatar = ({ judgeIndex, judgeName = "Antonio Banderas" }: { judgeIndex: number, judgeName?: string }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-xs font-medium text-gray-700">Jurado</div>
      <div className="w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center overflow-hidden">
        {/* Imagen placeholder del jurado */}
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
          <Users className="w-5 h-5 text-gray-500" />
        </div>
      </div>
      <div className="text-xs font-medium text-gray-700 text-center max-w-[80px] leading-tight">
        {judgeName}
      </div>
    </div>
  );

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
              <div className="font-bold text-lg">{currentTanda.index + 1}</div>
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
                <span className="text-sm">Fase: {currentTanda.phase}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Grid de pistas - NUEVO DISEÑO COMO LAS IMÁGENES */}
        <div className="space-y-8">
          {currentTanda.blocks.length === 1 ? (
            /* DISEÑO HORIZONTAL - UN SOLO BLOQUE (como imagen 1) */
            <div className="bg-white rounded-xl shadow-lg p-6 relative">
              {/* Estado de jurados del bloque */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-800">
                        Jurados asignados
                      </div>
                      <div className="text-sm text-gray-600">
                        {hasJudges(0) 
                          ? `${currentTanda.blocks[0].judgeIds.length} jurados seleccionados`
                          : 'Sin jurados asignados'
                        }
                      </div>
                    </div>
                  </div>
                  
                  {!hasJudges(0) && (
                    <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2">
                      <Settings className="w-4 h-4" />
                      <span>Seleccionar Jurados</span>
                    </button>
                  )}
                  
                  {hasJudges(0) && (
                    <div className="flex items-center space-x-2 text-green-600">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium">Listo para competir</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Layout como imagen 1: Jurados arriba, pistas en el medio, jurados abajo */}
              <div className="space-y-6">
                {/* Jurados superiores */}
                {hasJudges(0) && (
                  <div className="flex justify-center">
                    <div className="flex space-x-8">
                      {currentTanda.blocks[0].judgeIds.slice(0, 3).map((judgeId, index) => (
                        <JudgeAvatar key={`judge-top-${index}`} judgeIndex={index + 1} />
                      ))}
                    </div>
                  </div>
                )}

                {/* Área de pistas con borde negro redondeado */}
                <div className="border-4 border-black rounded-2xl bg-yellow-100 p-6">
                  {/* Headers de pistas */}
                  <div className="grid gap-4 mb-4" style={{ 
                    gridTemplateColumns: `repeat(${currentTanda.blocks[0].participants.length}, 1fr)` 
                  }}>
                    {currentTanda.blocks[0].participants.map((_, pistaIndex) => (
                      <div key={`header-${pistaIndex}`} className="text-center">
                        <div className="bg-pink-400 text-white py-2 px-4 rounded-lg text-sm font-bold">
                          PISTA {pistaIndex + 1}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Participantes en pistas */}
                  <div className="grid gap-4" style={{ 
                    gridTemplateColumns: `repeat(${currentTanda.blocks[0].participants.length}, 1fr)` 
                  }}>
                    {currentTanda.blocks[0].participants.map((tandaParticipant, pistaIndex) => (
                      <div key={tandaParticipant.participantId} 
                           className={`relative ${!hasJudges(0) ? 'opacity-50' : ''}`}>
                        {/* Líneas divisorias verticales */}
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
                {hasJudges(0) && currentTanda.blocks[0].judgeIds.length > 3 && (
                  <div className="flex justify-center">
                    <div className="flex space-x-8">
                      {currentTanda.blocks[0].judgeIds.slice(3, 5).map((judgeId, index) => (
                        <JudgeAvatar key={`judge-bottom-${index}`} judgeIndex={index + 4} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* DISEÑO VERTICAL - MÚLTIPLES BLOQUES (como imagen 2) */
            <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(currentTanda.blocks.length, 3)}, 1fr)` }}>
              {currentTanda.blocks.map((block, blockIndex) => (
                <div key={blockIndex} className="bg-white rounded-xl shadow-lg p-4 relative">
                  {/* Estado de jurados del bloque */}
                  <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                    <div className="text-center">
                      <div className="font-medium text-gray-800 text-sm mb-1">
                        Bloque {blockIndex + 1}
                      </div>
                      <div className="text-xs text-gray-600">
                        {hasJudges(blockIndex) 
                          ? `${block.judgeIds.length} jurados`
                          : 'Sin jurados'
                        }
                      </div>
                      
                      {!hasJudges(blockIndex) && (
                        <button className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors">
                          Seleccionar
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Layout vertical como imagen 2: Jurados a los lados, pistas en el centro */}
                  <div className="space-y-4">
                    {/* Jurados izquierda */}
                    {hasJudges(blockIndex) && (
                      <div className="flex justify-between">
                        <div className="flex flex-col space-y-4">
                          {block.judgeIds.slice(0, Math.ceil(block.judgeIds.length / 2)).map((judgeId, index) => (
                            <div key={`judge-left-${index}`} className="flex flex-col items-center">
                              <div className="text-xs text-gray-600 mb-1">Jurado</div>
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="text-xs text-gray-700 mt-1 text-center max-w-[60px] leading-tight">
                                Antonio Banderas
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="flex flex-col space-y-4">
                          {block.judgeIds.slice(Math.ceil(block.judgeIds.length / 2)).map((judgeId, index) => (
                            <div key={`judge-right-${index}`} className="flex flex-col items-center">
                              <div className="text-xs text-gray-600 mb-1">Jurado</div>
                              <div className="w-8 h-8 rounded-full bg-white border border-gray-300 flex items-center justify-center">
                                <Users className="w-4 h-4 text-gray-500" />
                              </div>
                              <div className="text-xs text-gray-700 mt-1 text-center max-w-[60px] leading-tight">
                                Antonio Banderas
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Área de pistas con borde negro */}
                    <div className="border-2 border-black rounded-lg bg-yellow-100 p-3">
                      {/* Participantes apilados verticalmente */}
                      <div className="space-y-2">
                        {block.participants.map((tandaParticipant, pistaIndex) => (
                          <div key={tandaParticipant.participantId} 
                               className={`relative ${!hasJudges(blockIndex) ? 'opacity-50' : ''}`}>
                            {/* Líneas divisorias horizontales */}
                            {pistaIndex > 0 && (
                              <div className="absolute top-0 left-0 right-0 h-0.5 bg-black -mt-1"></div>
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
                disabled={currentTanda.blocks.some((_, index) => !hasJudges(index))}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                  currentTanda.blocks.some((_, index) => !hasJudges(index))
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
          {currentTanda.blocks.some((_, index) => !hasJudges(index)) && (
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