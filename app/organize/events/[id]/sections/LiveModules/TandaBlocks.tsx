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

  if (currentTanda.blocks.length === 1) {
    // DISEÑO HORIZONTAL - UN SOLO BLOQUE
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 relative">
        {/* Estado de jurados del bloque */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center space-x-3">
              <Users className="w-5 h-5 text-gray-600" />
              <div>
                <div className="font-medium text-gray-800">Jurados asignados</div>
                <div className="text-sm text-gray-600">
                  {getJudgesStatus(0).current} de {requiredJudgesCount} jurados requeridos
                </div>
              </div>
            </div>

            <button
              onClick={() => onAssignJudges(currentTanda.blocks)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
            >
              <Settings className="w-4 h-4" />
              <span>Seleccionar Jurados</span>
            </button>

            {hasExactJudges(0) ? (
              <div className="flex items-center space-x-2 text-green-600">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium">Listo para competir</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-orange-600">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium">
                  Faltan {requiredJudgesCount - getJudgesStatus(0).current} jurado(s)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Jurados superiores */}
        <div className="flex justify-center gap-3 mb-4">
          {currentTanda.blocks[0].judgeIds.slice(0, Math.ceil(currentTanda.blocks[0].judgeIds.length / 2)).map((judgeId, index) => {
            const hasScoredAll = didJudgeScoreAllParticipants(currentTanda.blocks[0], judgeId);

            return (
              <JudgeAvatar
                key={judgeId}
                userId={judgeId}
                usersMap={usersMap}
                judgeIndex={index}
                hasScoredAll={hasScoredAll}
                block={currentTanda.blocks[0]}
              />
            );
          })}
        </div>

        {/* Área de pistas */}
        <div className="border-4 border-gray-800 rounded-2xl bg-yellow-100 p-6">
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

          <div className="grid gap-4" style={{
            gridTemplateColumns: `repeat(${currentTanda.blocks[0].participants.length}, 1fr)`
          }}>
            {currentTanda.blocks[0].participants.map((tandaParticipant, pistaIndex) => (
              <div key={tandaParticipant.participantId}
                className={`relative ${!hasExactJudges(0) ? 'opacity-50' : ''}`}>
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
        <div className="flex justify-center gap-3 mt-4">
          {currentTanda.blocks[0].judgeIds.slice(Math.ceil(currentTanda.blocks[0].judgeIds.length / 2)).map((judgeId, index) => {
            const hasScoredAll = didJudgeScoreAllParticipants(currentTanda.blocks[0], judgeId);

            return (
              <JudgeAvatar
                key={judgeId}
                userId={judgeId}
                usersMap={usersMap}
                hasScoredAll={hasScoredAll}
                block={currentTanda.blocks[0]}
                judgeIndex={index + Math.ceil(currentTanda.blocks[0].judgeIds.length / 2)}
              />
            );
          })}
        </div>
      </div>
    );
  } else {
    // DISEÑO VERTICAL - MÚLTIPLES BLOQUES
    return (
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: `repeat(${Math.min(currentTanda.blocks.length, 3)}, 1fr)` }}
      >
        {currentTanda.blocks.map((block, blockIndex) => {
          const judgesStatus = getJudgesStatus(blockIndex);

          return (
            <div key={blockIndex} className="bg-white rounded-xl shadow-lg p-4 relative flex flex-col items-center">
              {/* Título del bloque */}
              <div className="mb-4 text-center">
                <div className="font-semibold text-gray-800 text-sm mb-1">
                  BLOQUE {String.fromCharCode(65 + blockIndex)}
                </div>
                <div className="text-xs text-gray-600">
                  {judgesStatus.current}/{judgesStatus.required} jurados
                </div>

                {!judgesStatus.isReady && (
                  <button
                    onClick={() => onAssignJudges([block])}
                    className="mt-2 bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 transition-colors"
                  >
                    Seleccionar
                  </button>
                )}

                {judgesStatus.isReady ? (
                  <div className="mt-2 flex items-center justify-center space-x-1 text-green-600">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    <span className="text-xs font-medium">Listo</span>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-center space-x-1 text-orange-600">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full"></div>
                    <span className="text-xs font-medium">
                      Faltan {judgesStatus.required - judgesStatus.current}
                    </span>
                  </div>
                )}
              </div>

              {/* Jurados a los lados + pista vertical */}
              <div className="flex items-center justify-center gap-3">
                {/* Jurados izquierda */}
                <div className="flex flex-col gap-2">
                  {block.judgeIds.slice(0, Math.ceil(block.judgeIds.length / 2)).map((judgeId, i) => {
                    const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);

                    return (
                      <JudgeAvatar
                        key={judgeId}
                        userId={judgeId}
                        usersMap={usersMap}
                        hasScoredAll={hasScoredAll}
                        block={block}
                        judgeIndex={i}
                      />
                    );
                  })}
                </div>

                {/* Área de pista con participantes */}
                <div className="border-4 border-gray-800 rounded-lg overflow-hidden bg-yellow-100 min-w-[140px]">
                  {block.participants.map((tandaParticipant, pistaIndex) => (
                    <div
                      key={tandaParticipant.participantId}
                      className={`h-16 flex items-center justify-center px-2 relative text-sm font-medium text-gray-800 ${
                        pistaIndex > 0 ? 'border-t-2 border-gray-800' : ''
                      } ${!hasExactJudges(blockIndex) ? 'opacity-50' : ''}`}
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
                <div className="flex flex-col gap-2">
                  {block.judgeIds.slice(Math.ceil(block.judgeIds.length / 2)).map((judgeId, i) => {
                    const hasScoredAll = didJudgeScoreAllParticipants(block, judgeId);

                    return (
                      <JudgeAvatar
                        key={judgeId}
                        userId={judgeId}
                        usersMap={usersMap}
                        hasScoredAll={hasScoredAll}
                        block={block}
                        judgeIndex={i + Math.ceil(block.judgeIds.length / 2)}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  }
};