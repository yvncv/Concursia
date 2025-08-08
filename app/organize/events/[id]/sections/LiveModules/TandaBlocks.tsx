import React from 'react';
import { Users, Settings } from 'lucide-react';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { BlockInTanda } from '@/app/types/blockInTandaType';
import { User } from '@/app/types/userType';
import { useParticipantsWithUsers, getParticipantDisplayName, getParticipantImages } from '@/app/hooks/useParticipantsWithUsers';
import { JudgeAvatar } from './components/JudgeAvatar';

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
      <div className="bg-yellow-200 rounded-lg p-2 text-center min-h-[80px] flex items-center justify-center">
        <div className="text-gray-600 text-xs">Cargando...</div>
      </div>
    );
  }

  if (participantWithUsers.isLoading) {
    return (
      <div className="bg-yellow-200 rounded-lg p-2 text-center min-h-[80px] flex items-center justify-center">
        <div className="animate-pulse">
          <div className="w-8 h-8 bg-gray-300 rounded-full mx-auto mb-1"></div>
          <div className="h-2 bg-gray-300 rounded mb-1"></div>
          <div className="h-2 bg-gray-300 rounded"></div>
        </div>
      </div>
    );
  }

  const displayName = getParticipantDisplayName(participantWithUsers);
  const images = getParticipantImages(participantWithUsers);
  const isCouple = participantWithUsers.users.length === 2;

  return (
    <div className="bg-yellow-200 rounded-lg p-2 text-center min-h-[80px] flex flex-col items-center justify-center">
      {/* Imagen(es) del participante */}
      <div className="mb-1">
        {isCouple ? (
          <div className="flex justify-center space-x-1">
            {images.map((image, index) => (
              <div key={index} className="relative">
                {image ? (
                  <img
                    src={image}
                    alt={`Participante ${index + 1}`}
                    className="w-6 h-6 rounded-full object-cover border border-gray-300"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300">
                    <Users className="w-3 h-3 text-gray-500" />
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
                className="w-8 h-8 rounded-full object-cover border border-gray-300"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center border border-gray-300">
                <Users className="w-4 h-4 text-gray-500" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Nombre del participante */}
      <div className="text-xs font-medium text-gray-800 mb-1 leading-tight text-center px-1">
        {displayName}
      </div>

      {/* Código del participante */}
      <div className="text-xs text-gray-600">
        #{participant.code}
      </div>
    </div>
  );
};

interface TandaBlocksProps {
  currentTanda: Tanda;
  allParticipants: Participant[];
  requiredJudgesCount: number;
  usersMap: Record<string, User>;
  onAssignJudges: (blocks: BlockInTanda[]) => void;
}

export const TandaBlocks: React.FC<TandaBlocksProps> = ({
  currentTanda,
  allParticipants,
  requiredJudgesCount,
  usersMap,
  onAssignJudges
}) => {
  
  // Verificar si un bloque tiene EXACTAMENTE la cantidad requerida de jurados
  const hasExactJudges = (blockIndex: number): boolean => {
    const block = currentTanda.blocks[blockIndex];
    return block && block.judgeIds && block.judgeIds.length === requiredJudgesCount;
  };

  // Obtener el estado de jurados de un bloque específico
  const getJudgesStatus = (blockIndex: number): { current: number; required: number; isReady: boolean } => {
    const block = currentTanda.blocks[blockIndex];
    const current = block?.judgeIds?.length || 0;
    return {
      current,
      required: requiredJudgesCount,
      isReady: current === requiredJudgesCount
    };
  };

  const didJudgeScoreAllParticipants = (block: BlockInTanda, judgeId: string): boolean => {
    return block.participants.every(participant => {
      const scoreEntry = participant.scores?.find(score => score.judgeId === judgeId);
      return typeof scoreEntry?.score === 'number';
    });
  };

  // Determinar el layout basado en el número de bloques
  const getGridLayout = (blockCount: number) => {
    switch (blockCount) {
      case 1: return 'flex justify-center';
      case 2: return 'grid grid-cols-2 gap-6';
      case 3: return 'grid grid-cols-3 gap-4';
      case 4: return 'grid grid-cols-2 lg:grid-cols-4 gap-4';
      default: return 'grid grid-cols-1 gap-4';
    }
  };

  if (currentTanda.blocks.length === 1) {
    // DISEÑO HORIZONTAL - UN SOLO BLOQUE
    const block = currentTanda.blocks[0];
    const judgesStatus = getJudgesStatus(0);
    const totalJudges = block.judgeIds.length;
    const topJudges = Math.ceil(totalJudges / 2);
    const bottomJudges = Math.floor(totalJudges / 2);

    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        {/* Header con información del bloque */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-800">
                  Tanda {currentTanda.index} - Bloque Único
                </div>
                <div className="text-sm text-gray-600">
                  {judgesStatus.current} de {requiredJudgesCount} jurados | {block.participants.length} participantes
                </div>
              </div>
            </div>

            <button
              onClick={() => onAssignJudges(currentTanda.blocks)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Gestionar Jurados</span>
            </button>

            {judgesStatus.isReady ? (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Listo para competir</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Faltan {requiredJudgesCount - judgesStatus.current} jurado(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Layout del bloque único */}
        <div className="max-w-6xl mx-auto">
          {/* Jurados superiores */}
          {topJudges > 0 && (
            <div className="flex justify-center gap-3 mb-4">
              {block.judgeIds.slice(0, topJudges).map((judgeId, index) => {
                const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);
                return (
                  <JudgeAvatar
                    key={`top-${judgeId}`}
                    userId={judgeId}
                    usersMap={usersMap}
                    judgeIndex={index}
                    hasScoredAll={hasScoredAll}
                    block={block}
                  />
                );
              })}
            </div>
          )}

          {/* Pista horizontal con todas las pistas */}
          <div className="border-4 border-gray-800 rounded-2xl bg-yellow-100 p-4">
            {/* Headers de pistas */}
            <div className="grid gap-2 mb-3" style={{
              gridTemplateColumns: `repeat(${block.participants.length}, 1fr)`
            }}>
              {block.participants.map((_, pistaIndex) => (
                <div key={`header-${pistaIndex}`} className="text-center">
                  <div className="bg-pink-400 text-white py-1 px-2 rounded text-xs font-bold">
                    PISTA {pistaIndex + 1}
                  </div>
                </div>
              ))}
            </div>

            {/* Participantes */}
            <div className="grid gap-2" style={{
              gridTemplateColumns: `repeat(${block.participants.length}, 1fr)`
            }}>
              {block.participants.map((tandaParticipant, pistaIndex) => (
                <div key={`participant-${tandaParticipant.participantId}`}
                  className={`relative ${!judgesStatus.isReady ? 'opacity-50' : ''}`}>
                  {pistaIndex > 0 && (
                    <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-800 -ml-1"></div>
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
          {bottomJudges > 0 && (
            <div className="flex justify-center gap-3 mt-4">
              {block.judgeIds.slice(topJudges).map((judgeId, index) => {
                const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);
                return (
                  <JudgeAvatar
                    key={`bottom-${judgeId}`}
                    userId={judgeId}
                    usersMap={usersMap}
                    judgeIndex={topJudges + index}
                    hasScoredAll={hasScoredAll}
                    block={block}
                  />
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  } else {
    // DISEÑO PARA MÚLTIPLES BLOQUES
    return (
      <div className="space-y-6">
        {/* Header general de la tanda */}
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Tanda {currentTanda.index}
              </h2>
              <p className="text-sm text-gray-600">
                {currentTanda.blocks.length} bloques simultáneos | 
                Total: {currentTanda.blocks.reduce((sum, block) => sum + block.participants.length, 0)} participantes
              </p>
            </div>
            <button
              onClick={() => onAssignJudges(currentTanda.blocks)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Gestionar Jurados</span>
            </button>
          </div>
        </div>

        {/* Grid de bloques */}
        <div className={getGridLayout(currentTanda.blocks.length)}>
          {currentTanda.blocks.map((block, blockIndex) => {
            const judgesStatus = getJudgesStatus(blockIndex);
            const blockLetter = String.fromCharCode(65 + blockIndex);

            return (
              <div key={`block-${blockIndex}`} className="bg-white rounded-xl shadow-lg p-4">
                {/* Header del bloque */}
                <div className="text-center mb-4">
                  <div className="font-bold text-gray-800 text-lg mb-1">
                    BLOQUE {blockLetter}
                  </div>
                  <div className="text-xs text-gray-600 mb-2">
                    {judgesStatus.current}/{judgesStatus.required} jurados | {block.participants.length} participantes
                  </div>

                  {/* Estado del bloque */}
                  {judgesStatus.isReady ? (
                    <div className="flex items-center justify-center space-x-1 text-green-600">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-medium">Listo</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-1 text-orange-600">
                      <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                      <span className="text-xs font-medium">
                        Faltan {judgesStatus.required - judgesStatus.current}
                      </span>
                    </div>
                  )}
                </div>

                {/* Layout del bloque */}
                <div className="flex items-center justify-center gap-2">
                  {/* Jurados izquierda */}
                  <div className="flex flex-col gap-1">
                    {block.judgeIds.slice(0, Math.ceil(block.judgeIds.length / 2)).map((judgeId, judgeIndex) => {
                      const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);
                      return (
                        <JudgeAvatar
                          key={`left-${judgeId}`}
                          userId={judgeId}
                          usersMap={usersMap}
                          judgeIndex={judgeIndex}
                          hasScoredAll={hasScoredAll}
                          block={block}
                        />
                      );
                    })}
                  </div>

                  {/* Área de pistas verticales */}
                  <div className="border-3 border-gray-800 rounded-lg overflow-hidden bg-yellow-100 min-w-[120px] max-w-[160px]">
                    {block.participants.map((tandaParticipant, pistaIndex) => (
                      <div
                        key={`block-${blockIndex}-participant-${tandaParticipant.participantId}`}
                        className={`relative ${!judgesStatus.isReady ? 'opacity-50' : ''} ${
                          pistaIndex > 0 ? 'border-t-2 border-gray-800' : ''
                        }`}
                      >
                        {/* Header de pista */}
                        <div className="bg-pink-400 text-white text-xs font-bold text-center py-1">
                          PISTA {pistaIndex + 1}
                        </div>
                        {/* Participante */}
                        <div className="p-1">
                          <ParticipantCard
                            participantId={tandaParticipant.participantId}
                            allParticipants={allParticipants}
                            pistaNumber={pistaIndex + 1}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Jurados derecha */}
                  <div className="flex flex-col gap-1">
                    {block.judgeIds.slice(Math.ceil(block.judgeIds.length / 2)).map((judgeId, judgeIndex) => {
                      const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);
                      return (
                        <JudgeAvatar
                          key={`right-${judgeId}`}
                          userId={judgeId}
                          usersMap={usersMap}
                          judgeIndex={judgeIndex + Math.ceil(block.judgeIds.length / 2)}
                          hasScoredAll={hasScoredAll}
                          block={block}
                        />
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Resumen de la tanda */}
        <div className="bg-gray-50 rounded-xl p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {currentTanda.blocks.length}
              </div>
              <div className="text-sm text-gray-600">Bloques</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600">
                {currentTanda.blocks.reduce((sum, block) => sum + block.participants.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Participantes</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {currentTanda.blocks.reduce((sum, block) => sum + block.judgeIds.length, 0)}
              </div>
              <div className="text-sm text-gray-600">Jurados Asignados</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-600">
                {currentTanda.blocks.length * requiredJudgesCount}
              </div>
              <div className="text-sm text-gray-600">Jurados Requeridos</div>
            </div>
          </div>
        </div>
      </div>
    );
  }
};