import { useState, useEffect, useCallback } from 'react';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Tanda } from '@/app/types/tandaType';
import { finalizeTandaAndCheckTransitions } from '@/app/services/competitionFlowService';

interface UseTandaPlayerProps {
  eventId: string;
  liveCompetitionId: string;
  tandaIndex: number;
  currentTandaState: Tanda;
}

export const useTandaPlayer = ({ eventId, liveCompetitionId, tandaIndex, currentTandaState }: UseTandaPlayerProps) => {
  const [currentTime, setCurrentTime] = useState(0);

  // Derivar estados del estado de la tanda
  const isRunning = currentTandaState.status === 'playing';
  const isWaitingScores = currentTandaState.status === 'waiting_scores';
  const isFinished = currentTandaState.status === 'finished';

  // Temporizador para la tanda
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning || isWaitingScores) {
      interval = setInterval(() => {
        setCurrentTime(prevTime => prevTime + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, isWaitingScores]);

  // Calcular tiempo transcurrido basado en los timestamps de Firestore
  useEffect(() => {
    if (currentTandaState.startTime) {
      const startTime = currentTandaState.startTime.toDate().getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startTime) / 1000);
      
      // Restar tiempo pausado si existe
      const totalPaused = currentTandaState.totalPausedDuration || 0;
      setCurrentTime(Math.max(0, elapsed - totalPaused));
    } else {
      setCurrentTime(0);
    }
  }, [currentTandaState.startTime, currentTandaState.totalPausedDuration]);

  // Verificar si todos los jurados han votado
  const checkAllJudgesVoted = useCallback((): boolean => {
    return currentTandaState.blocks.every(block =>
      block.judgeIds.every(judgeId =>
        block.participants.every(participant =>
          participant.scores?.some(score => score.judgeId === judgeId && typeof score.score === 'number')
        )
      )
    );
  }, [currentTandaState.blocks]);

  // Asignar puntaje mínimo (3) a jurados que no votaron
  const assignMinimumScores = useCallback(async (): Promise<void> => {
    const updatedBlocks = currentTandaState.blocks.map(block => ({
      ...block,
      participants: block.participants.map(participant => ({
        ...participant,
        scores: block.judgeIds.map(judgeId => {
          const existingScore = participant.scores?.find(score => score.judgeId === judgeId);
          if (existingScore && typeof existingScore.score === 'number') {
            return existingScore;
          }
          // Asignar puntaje mínimo de 3 si no votó
          return {
            judgeId,
            score: 3 as const,
            timestamp: serverTimestamp()
          };
        })
      }))
    }));

    try {
      const tandaRef = doc(
        db,
        "eventos",
        eventId,
        "liveCompetition",
        liveCompetitionId,
        "tandas",
        `tanda_${tandaIndex}`
      );

      await updateDoc(tandaRef, { blocks: updatedBlocks });
    } catch (error) {
      console.error("Error al asignar puntajes mínimos:", error);
    }
  }, [currentTandaState.blocks, eventId, liveCompetitionId, tandaIndex]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const updateTandaStatus = useCallback(async (status: string, additionalData: any = {}) => {
    try {
      const tandaRef = doc(
        db,
        "eventos",
        eventId,
        "liveCompetition",
        liveCompetitionId,
        "tandas",
        `tanda_${tandaIndex}`
      );

      const updateData: any = {
        status,
        updatedAt: serverTimestamp(),
        ...additionalData
      };

      await updateDoc(tandaRef, updateData);
    } catch (error) {
      console.error("Error al actualizar estado de la tanda:", error);
    }
  }, [eventId, liveCompetitionId, tandaIndex]);

  const setActualCurrentTandaIndex = useCallback(async () => {
    try {
      const compRef = doc(
        db,
        "eventos",
        eventId,
        "liveCompetition",
        liveCompetitionId
      );
      await updateDoc(compRef, {
        currentTandaIndex: tandaIndex,
      });
      console.log("✔ currentTandaIndex actualizado en Firestore");
    } catch (error) {
      console.error("❌ Error al actualizar el índice de la tanda:", error);
    }
  }, [eventId, liveCompetitionId, tandaIndex]);

  const handlePlay = useCallback(() => {
    if (currentTandaState.status === 'stopped') {
      // Primera vez que inicia
      updateTandaStatus('playing', {
        startTime: serverTimestamp()
      });
      setActualCurrentTandaIndex();
    } else if (currentTandaState.status === 'paused') {
      // Reanudar después de pausa
      const pausedTime = currentTandaState.pausedAt ? 
        Math.floor((Date.now() - currentTandaState.pausedAt.toDate().getTime()) / 1000) : 0;
      
      const newTotalPaused = (currentTandaState.totalPausedDuration || 0) + pausedTime;
      
      updateTandaStatus('playing', {
        resumedAt: serverTimestamp(),
        totalPausedDuration: newTotalPaused
      });
    }
  }, [currentTandaState, updateTandaStatus, setActualCurrentTandaIndex]);

  const handlePause = useCallback(() => {
    if (currentTandaState.status === 'playing') {
      updateTandaStatus('paused', {
        pausedAt: serverTimestamp()
      });
    }
  }, [currentTandaState.status, updateTandaStatus]);

  const handleOpenVoting = useCallback(() => {
    if (currentTandaState.status === 'playing') {
      updateTandaStatus('waiting_scores');
    }
  }, [currentTandaState.status, updateTandaStatus]);

  const handleFinish = useCallback(async () => {
    try {
      // Asignar puntajes mínimos antes de finalizar
      if (!checkAllJudgesVoted()) {
        await assignMinimumScores();
      }

      // Calcular datos finales si está pausado
      let finalData: any = {
        endTime: serverTimestamp()
      };

      if (currentTandaState.status === 'paused' && currentTandaState.pausedAt) {
        const pausedTime = Math.floor((Date.now() - currentTandaState.pausedAt.toDate().getTime()) / 1000);
        finalData.totalPausedDuration = (currentTandaState.totalPausedDuration || 0) + pausedTime;
      }

      // Finalizar tanda
      await updateTandaStatus('finished', finalData);

      // NUEVO: Manejar transiciones automáticas
      await finalizeTandaAndCheckTransitions(eventId, liveCompetitionId, tandaIndex);
      
      console.log('✅ Tanda finalizada y transiciones procesadas');
      
    } catch (error) {
      console.error('❌ Error al finalizar tanda:', error);
    }
  }, [currentTandaState, updateTandaStatus, checkAllJudgesVoted, assignMinimumScores, eventId, liveCompetitionId, tandaIndex]);

  const handleStartPause = useCallback(() => {
    if (isRunning) {
      handlePause();
    } else {
      handlePlay();
    }
  }, [isRunning, handlePlay, handlePause]);

  // Auto-finalización cuando todos votan en waiting_scores
  useEffect(() => {
    if (isWaitingScores && checkAllJudgesVoted()) {
      handleFinish();
    }
  }, [isWaitingScores, checkAllJudgesVoted, handleFinish]);

  // Calcular progreso de votación
  const getVotingProgress = useCallback(() => {
    let totalJudges = 0;
    let votedJudges = 0;

    currentTandaState.blocks.forEach(block => {
      block.judgeIds.forEach(judgeId => {
        totalJudges++;
        const hasVoted = block.participants.every(participant =>
          participant.scores?.some(score => score.judgeId === judgeId && typeof score.score === 'number')
        );
        if (hasVoted) votedJudges++;
      });
    });

    return { votedJudges, totalJudges };
  }, [currentTandaState.blocks]);

  return {
    currentTime,
    isRunning,
    isWaitingScores,
    isFinished,
    formatTime: formatTime(currentTime),
    status: currentTandaState.status,
    votingProgress: getVotingProgress(),
    allJudgesVoted: checkAllJudgesVoted(),
    controls: {
      handleStartPause,
      handlePlay,
      handlePause,
      handleOpenVoting,
      handleFinish
    }
  };
};