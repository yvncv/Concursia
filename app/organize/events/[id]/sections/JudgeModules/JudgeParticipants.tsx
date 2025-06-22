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
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedParticipantId, setSelectedParticipantId] = useState<string | null>(null);
  const [selectedScore, setSelectedScore] = useState<0 | 1 | 2 | 3 | 4 | 5 | null>(null);

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

  useEffect(() => {
  if (!user?.id) return;

  if (currentTanda.status !== "pendiente") return;

  const assignedBlocks = currentTanda.blocks.filter((block) =>
    block.judgeIds.includes(user.id)
  );

  setMyBlocks(assignedBlocks);
}, [currentTanda, user?.id]);

  const openModal = (participantId: string) => {
    setSelectedParticipantId(participantId);
    setSelectedScore(null);
    setModalOpen(true);
  };

  const saveScore = async () => {
    if (!selectedParticipantId || selectedScore == null || !user?.id || !eventId || !liveCompetitionId) {
      console.error("Datos insuficientes para guardar el puntaje");
      return;
    }

    const db = getFirestore();

    const updatedBlocks = myBlocks.map((block) => {
      const updatedParticipants = block.participants.map((tp) => {
        if (tp.participantId === selectedParticipantId) {
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
      setModalOpen(false);
    } catch (error) {
      console.error("Error al guardar el puntaje:", error);
    }
  };
  console.log("[DEBUG] allParticipants en padre:", allParticipants);


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
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              {block.participants.map((tp) => {
                const participantWithUsers = participantsMap[tp.participantId];
                const scoreGiven = tp.scores.find((s) => s.judgeId === user.id);

                return (
                  <div
                    key={tp.participantId}
                    className={`relative rounded-xl p-5 border-2 transition-all duration-200 ${scoreGiven
                        ? 'bg-green-50 border-green-200 shadow-sm'
                        : 'bg-amber-50 border-amber-200 shadow-sm hover:shadow-md'
                      }`}
                  >
                    {/* Score Badge */}
                    <div className="absolute top-3 right-3">
                      {scoreGiven ? (
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <span className="text-white font-bold text-lg">{scoreGiven.score}</span>
                          </div>
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      ) : (
                        <div className="w-10 h-10 bg-amber-400 rounded-full flex items-center justify-center">
                          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Participant Info */}
                    <div className="pr-16">
                      {participantWithUsers ? (
                        participantWithUsers.isLoading ? (
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                              <div className="h-3 bg-gray-200 rounded animate-pulse w-24"></div>
                            </div>
                          </div>
                        ) : participantWithUsers.error ? (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                            <p className="text-red-600 text-sm font-medium">
                              ⚠️ {participantWithUsers.error}
                            </p>
                          </div>
                        ) : (
                          <div className="mb-4">
                            {/* Avatar and Name */}
                            <div className="flex items-center gap-3 mb-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-gray-600 to-gray-700 rounded-full flex items-center justify-center">
                                <span className="text-white font-bold text-lg">
                                  {"EV"}
                                </span>
                              </div>
                              <div>
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
                            </div>
                          </div>
                        )
                      ) : (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mb-2">
                          <p className="text-red-600 text-sm font-medium">
                            ⚠️ Participante no encontrado (ID: {tp.participantId})
                          </p>
                        </div>
                      )}

                      {/* Status */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">Estado:</span>
                          {scoreGiven ? (
                            <span className="flex items-center gap-2 text-green-700 font-bold">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                              Calificado
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 text-amber-600 font-medium">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                              </svg>
                              Pendiente
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Action Button */}
                      {!scoreGiven && (
                        <button
                          className="mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 px-4 rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all duration-200 transform hover:scale-105 shadow-md"
                          onClick={() => openModal(tp.participantId)}
                        >
                          Calificar Ahora
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Scoring Modal */}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">Asignar Puntaje</h2>
                <button
                  onClick={() => setModalOpen(false)}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <p className="text-sm text-gray-500 mt-1">Selecciona un puntaje del 0 al 5</p>
            </div>

            {/* Score Selection */}
            <div className="px-6 py-6">
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 5].map((score) => (
                  <button
                    key={score}
                    onClick={() => setSelectedScore(score as 0 | 1 | 2 | 3 | 4 | 5)}
                    className={`h-16 rounded-xl border-2 text-2xl font-bold transition-all duration-200 transform hover:scale-105 ${selectedScore === score
                        ? "bg-blue-600 text-white border-blue-600 shadow-lg"
                        : "bg-white text-gray-700 border-gray-300 hover:border-blue-300 hover:bg-blue-50"
                      }`}
                  >
                    {score}
                  </button>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
              <button
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                onClick={() => setModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                disabled={selectedScore === null}
                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-200 ${selectedScore === null
                    ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-green-600 to-green-700 text-white hover:from-green-700 hover:to-green-800 transform hover:scale-105 shadow-md"
                  }`}
                onClick={saveScore}
              >
                Guardar Puntaje
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeView;