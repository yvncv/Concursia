"use client";

import { useEffect, useMemo, useState } from "react";
import { Tanda } from "@/app/types/tandaType";
import { BlockInTanda } from "@/app/types/blockInTandaType";
import { Participant } from "@/app/types/participantType";
import { Timestamp, updateDoc, doc, getFirestore } from "firebase/firestore";
import { useParams } from "next/navigation";
import { JudgeScore } from "@/app/types/tandaParticipantType";

import useUser from "@/app/hooks/useUser";
import useUsers from "@/app/hooks/useUsers";
import { 
  useParticipantsWithUsers, 
  getParticipantDisplayName, 
} from "@/app/hooks/useParticipantsWithUsers";
import { decryptValue } from "@/app/utils/encryption";

interface JudgeViewProps {
  currentTanda: Tanda;
  liveCompetitionId: string;
  allParticipants: Participant[];
}

const JudgeView = ({
  currentTanda,
  liveCompetitionId,
  allParticipants,
}: JudgeViewProps) => {
  const { id: eventId } = useParams() as { id: string };
  const { user } = useUser();
  const [myBlocks, setMyBlocks] = useState<BlockInTanda[]>([]);
  const [selectedScores, setSelectedScores] = useState<{[participantId: string]: 3 | 4 | 5}>({});

  // Use optimized hook for participants with users
  const participantsWithUsers = useParticipantsWithUsers(allParticipants);
  
  // Get judge user data
  const judgeUserIds = useMemo(() => {
    return user?.id ? [user.id] : [];
  }, [user?.id]);

  const { users: judgeProfiles, loadingUsers: loadingJudge } = useUsers(judgeUserIds);
  
  const judgeUser = useMemo(() => {
    return judgeProfiles.find(u => u.id === user?.id);
  }, [judgeProfiles, user?.id]);

  // Create participant map for quick access
  const participantsMap = useMemo(() => {
    const map: { [participantId: string]: typeof participantsWithUsers[0] } = {};
    participantsWithUsers.forEach(p => {
      map[p.participant.id] = p;
    });
    return map;
  }, [participantsWithUsers]);

  // Check if all participants are loaded
  const allParticipantsLoaded = participantsWithUsers.every(p => !p.isLoading);

  // Verificar si los jurados pueden votar según el estado de la tanda
  const canJudgeVote = currentTanda.status === 'waiting_scores';

  useEffect(() => {
    if (!user?.id) return;

    const assignedBlocks = currentTanda.blocks.filter((block) =>
      block.judgeIds.includes(user.id)
    );

    setMyBlocks(assignedBlocks);
  }, [currentTanda, user?.id]);

  // Actualizar en tiempo real cuando cambie el estado de la tanda
  useEffect(() => {
    // Si ya no puede votar, limpiar selecciones
    if (!canJudgeVote) {
      setSelectedScores({});
    }
  }, [canJudgeVote]);

  const handleScoreSelect = (participantId: string, score: 3 | 4 | 5) => {
    if (!canJudgeVote) return;
    
    setSelectedScores(prev => ({
      ...prev,
      [participantId]: score
    }));
  };

  const saveScore = async (participantId: string) => {
    const selectedScore = selectedScores[participantId];
    if (!selectedScore || !user?.id || !eventId || !liveCompetitionId || !canJudgeVote) {
      console.error("Datos insuficientes para guardar el puntaje o votación no habilitada");
      return;
    }

    const db = getFirestore();

    const updatedBlocks = myBlocks.map((block) => {
      const updatedParticipants = block.participants.map((tp) => {
        if (tp.participantId === participantId) {
          const newScore: JudgeScore = {
            judgeId: user.id,
            score: selectedScore,
            timestamp: Timestamp.now(),
          };
          const filteredScores = tp.scores.filter((s) => s.judgeId !== user.id);
          return {
            ...tp,
            scores: [...filteredScores, newScore],
          };
        }
        return tp;
      });
      return {
        ...block,
        participants: updatedParticipants,
      };
    });

    try {
      const tandaRef = doc(
        db,
        "eventos",
        eventId,
        "liveCompetition",
        liveCompetitionId,
        "tandas",
        `tanda_${currentTanda.index}`
      );

      await updateDoc(tandaRef, { blocks: updatedBlocks });
      setMyBlocks(updatedBlocks);
      
      // Limpiar la selección después de enviar
      setSelectedScores(prev => {
        const updated = { ...prev };
        delete updated[participantId];
        return updated;
      });
    } catch (error) {
      console.error("Error al guardar el puntaje:", error);
    }
  };

  // Loading state
  if (!user?.id || myBlocks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-800 mb-2">Sin asignación</h3>
        <p className="text-gray-600 max-w-md">
          No estás asignado como jurado en la tanda actual. Contacta al organizador si crees que esto es un error.
        </p>
      </div>
    );
  }

  if (loadingJudge || !allParticipantsLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <div className="w-16 h-16 border-4 border-red-200 border-t-red-600 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600 animate-pulse">Cargando datos de participantes y jurado...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4">
      {/* Judge Info Card */}
      <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-red-600 font-medium mb-1">JUEZ ASIGNADO</p>
            <p className="text-lg font-bold text-gray-900">
              {judgeUser?.firstName || 'N/A'} {judgeUser?.lastName || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">DNI: {decryptValue(judgeUser?.dni) || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Estado de votación */}
      {!canJudgeVote && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-400 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="text-amber-800 font-semibold mb-1">
                {currentTanda.status === 'stopped' && '⏹️ Esperando inicio de tanda'}
                {currentTanda.status === 'playing' && '▶️ Tanda en curso - Observa el baile'}
                {currentTanda.status === 'paused' && '⏸️ Tanda pausada'}
                {currentTanda.status === 'finished' && '✅ Tanda finalizada'}
              </p>
              <p className="text-amber-600 text-sm">
                {currentTanda.status === 'playing' && 'La votación se habilitará cuando el organizador lo indique'}
                {currentTanda.status !== 'playing' && 'Espera a que se habilite la votación'}
              </p>
            </div>
          </div>
        </div>
      )}

      {canJudgeVote && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center animate-pulse">
              <span className="text-white font-bold text-xl">🗳️</span>
            </div>
            <div>
              <p className="text-green-800 font-semibold mb-1">¡Votación habilitada!</p>
              <p className="text-green-600 text-sm">Puedes calificar a los participantes de tu bloque</p>
            </div>
          </div>
        </div>
      )}

      {/* Blocks */}
      {myBlocks.map((block) => (
        <div key={block.blockIndex} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Block Header */}
          <div className="bg-gray-900 px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white flex items-center gap-3">
                <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-sm font-bold">
                  {String.fromCharCode(65 + block.blockIndex)}
                </div>
                BLOQUE {String.fromCharCode(65 + block.blockIndex)}
              </h2>
              <div className="text-sm text-gray-300">
                {block.participants.length} participante{block.participants.length !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Participants Grid */}
          <div className="p-6">
            <div className="grid gap-4 grid-cols-1">
              {block.participants.map((tp) => {
                const participantWithUsers = participantsMap[tp.participantId];
                const scoreGiven = tp.scores.find((s) => s.judgeId === user.id);
                const selectedScore = selectedScores[tp.participantId];
                const hasSelection = selectedScore !== undefined;

                return (
                  <div
                    key={tp.participantId}
                    className={`rounded-xl p-5 border-2 transition-all duration-200 ${scoreGiven
                        ? 'bg-green-50 border-green-200 shadow-sm'
                        : canJudgeVote 
                          ? 'bg-amber-50 border-amber-200 shadow-sm'
                          : 'bg-gray-50 border-gray-200 shadow-sm opacity-60'
                      }`}
                  >
                    {/* Participant Info */}
                    <div className="mb-4">
                      {participantWithUsers ? (
                        participantWithUsers.isLoading ? (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                            </div>
                          </div>
                        ) : participantWithUsers.error ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-red-600 text-sm font-medium">
                              ⚠️ {participantWithUsers.error}
                            </p>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                              <span className="text-white font-bold text-lg">
                                {"EV"}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-gray-900 text-lg">
                                {getParticipantDisplayName(participantWithUsers)}
                              </h3>
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                  {participantWithUsers.participant?.category || 'Sin categoría'}
                                </span>
                                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  {participantWithUsers.participant?.level || 'Sin nivel'}
                                </span>
                              </div>
                            </div>

                            {/* Score Badge */}
                            {scoreGiven && (
                              <div className="flex items-center gap-2">
                                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center">
                                  <span className="text-white font-bold text-xl">{scoreGiven.score}</span>
                                </div>
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                              </div>
                            )}
                          </div>
                        )
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-600 text-sm font-medium">
                            ⚠️ Participante no encontrado (ID: {tp.participantId})
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Score Selection - Solo si puede votar y no ha calificado */}
                    {!scoreGiven && canJudgeVote && (
                      <div className="space-y-3">
                        {/* Score Buttons */}
                        <div className="flex justify-center gap-3">
                          {[3, 4, 5].map((score) => (
                            <button
                              key={score}
                              onClick={() => handleScoreSelect(tp.participantId, score as 3 | 4 | 5)}
                              className={`w-16 h-16 rounded-full text-2xl font-bold transition-all duration-200 transform hover:scale-105 ${
                                selectedScore === score
                                  ? "bg-blue-600 text-white border-4 border-blue-300 shadow-lg"
                                  : "bg-white text-gray-700 border-2 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                              }`}
                            >
                              {score}
                            </button>
                          ))}
                        </div>

                        {/* Send Button */}
                        <button
                          disabled={!hasSelection}
                          onClick={() => saveScore(tp.participantId)}
                          className={`w-full py-3 px-4 rounded-xl font-medium transition-all duration-200 ${
                            hasSelection
                              ? "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:scale-105 shadow-md"
                              : "bg-gray-100 text-gray-400 cursor-not-allowed"
                          }`}
                        >
                          {hasSelection ? `Enviar (${selectedScore})` : 'Selecciona un puntaje'}
                        </button>
                      </div>
                    )}

                    {/* Status when can't vote */}
                    {!scoreGiven && !canJudgeVote && (
                      <div className="text-center py-4">
                        <span className="flex items-center justify-center gap-2 text-gray-500 font-medium">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                          </svg>
                          Esperando habilitación de votación
                        </span>
                      </div>
                    )}

                    {/* Already scored status */}
                    {scoreGiven && (
                      <div className="text-center py-2">
                        <span className="flex items-center justify-center gap-2 text-green-700 font-bold">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          Calificado con {scoreGiven.score} puntos
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default JudgeView;