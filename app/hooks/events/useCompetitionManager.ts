import { useState, useEffect } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { Tanda } from '@/app/types/tandaType';
import { Participant } from '@/app/types/participantType';
import { LiveCompetition } from '@/app/types/liveCompetitionType';
import { generateAndPrepareTandas, confirmAndSaveTandas, checkIfTandasExist } from '@/app/services/generateTandasService';
import { db } from '@/app/firebase/config';
import { collection, doc, getDoc, getDocs, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

// Tipos para los diferentes estados de competencia
interface CompetitionStatus {
  isConfigured: boolean;
  hasExistingTandas: boolean;
  isFinished: boolean;
  completedTandas: number;
  totalTandas: number;
  currentStatus: 'pending' | 'ready' | 'in-progress' | 'completed';
}

interface UseCompetitionManagerProps {
  event: CustomEvent;
  scheduleItems: any[];
  getParticipantsByGender: (level: string, category: string, gender: string) => Participant[];
  getParticipantsByCategory: (level: string, category: string) => Participant[];
}

interface ActionButtonData {
  iconType: 'settings' | 'play' | 'eye' | 'loader';
  className: string;
  title: string;
  disabled: boolean;
  action: 'none' | 'config' | 'play' | 'view';
}

interface BadgeData {
  text: string;
  className: string;
}

interface UseCompetitionManagerReturn {
  // Estados
  competitionStatuses: Record<string, CompetitionStatus>;
  showConfigModal: boolean;
  showTandasModal: boolean;
  selectedItem: any;
  generatedTandas: Tanda[];
  isConfiguring: boolean;
  isGeneratingTandas: boolean;
  isConfirmingTandas: boolean;
  
  // Handlers de configuración
  handleConfigClick: (item: any) => void;
  handleConfirmConfig: (config: { blocks: number; tracksPerBlock: number; judgesPerBlock: number }) => void;
  handleCloseConfigModal: () => void;
  
  // Handlers de tandas
  handlePlayClick: (item: any, index: number) => Promise<{ tandas: Tanda[]; participants: Participant[] } | null>;
  handleConfirmTandas: () => Promise<{ tandas: Tanda[]; participants: Participant[] } | null>;
  handleCloseModal: () => void;
  
  // Función para finalizar competencia
  handleCompetitionFinished: (liveCompetitionId: string) => Promise<void>;
  
  // Utilidades
  getActionButton: (item: any, participantsCount: number) => ActionButtonData;
  getBadgeInfo: (status: CompetitionStatus) => BadgeData;
}

export const useCompetitionManager = ({
  event,
  scheduleItems,
  getParticipantsByGender,
  getParticipantsByCategory
}: UseCompetitionManagerProps): UseCompetitionManagerReturn => {
  
  // Estados principales
  const [competitionStatuses, setCompetitionStatuses] = useState<Record<string, CompetitionStatus>>({});
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showTandasModal, setShowTandasModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [generatedTandas, setGeneratedTandas] = useState<Tanda[]>([]);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isGeneratingTandas, setIsGeneratingTandas] = useState(false);
  const [isConfirmingTandas, setIsConfirmingTandas] = useState(false);

  // Verificar estados de todas las competencias
  useEffect(() => {
    const checkCompetitionStatuses = async () => {
      const statuses: Record<string, CompetitionStatus> = {};
      
      for (const item of scheduleItems) {
        const liveCompetitionId = `${item.levelId}_${item.category}_${item.gender || 'Mixto'}`;
        
        try {
          // Verificar configuración de LiveCompetition
          const liveCompDocRef = doc(db, 'eventos', event.id, 'liveCompetition', liveCompetitionId);
          const docSnap = await getDoc(liveCompDocRef);
          
          let isConfigured = false;
          let isFinished = false;
          let completedTandas = 0;
          let totalTandas = 0;
          
          if (docSnap.exists()) {
            const data = docSnap.data() as LiveCompetition;
            isConfigured = data.blocks !== null && data.tracksPerBlock !== null && data.judgesPerBlock !== null;
            isFinished = data.isFinished || false;
            completedTandas = data.completedTandas || 0;
            totalTandas = data.totalTandas || 0;
          }
          
          // Verificar si existen tandas
          const hasExistingTandas = await checkIfTandasExist(event.id, liveCompetitionId, item.phase || 'Final');
          
          // Si hay tandas, obtener el conteo real de tandas completadas
          if (hasExistingTandas) {
            const tandasSnapshot = await getDocs(
              collection(db, `eventos/${event.id}/liveCompetition/${liveCompetitionId}/tandas`)
            );
            
            totalTandas = tandasSnapshot.size;
            completedTandas = tandasSnapshot.docs.filter(doc => {
              const tandaData = doc.data();
              return tandaData.status === 'completed';
            }).length;
          }
          
          // Determinar estado actual
          let currentStatus: CompetitionStatus['currentStatus'] = 'pending';
          
          if (isFinished || (hasExistingTandas && completedTandas === totalTandas && totalTandas > 0)) {
            currentStatus = 'completed';
          } else if (hasExistingTandas && completedTandas > 0) {
            currentStatus = 'in-progress';
          } else if (isConfigured && hasExistingTandas) {
            currentStatus = 'in-progress';
          } else if (isConfigured) {
            currentStatus = 'ready';
          }
          
          statuses[item.id] = {
            isConfigured,
            hasExistingTandas,
            isFinished,
            completedTandas,
            totalTandas,
            currentStatus
          };
          
        } catch (error) {
          console.error('Error checking competition status:', error);
          // Estado por defecto en caso de error
          statuses[item.id] = {
            isConfigured: false,
            hasExistingTandas: false,
            isFinished: false,
            completedTandas: 0,
            totalTandas: 0,
            currentStatus: 'pending'
          };
        }
      }
      
      setCompetitionStatuses(statuses);
    };

    if (scheduleItems.length > 0) {
      checkCompetitionStatuses();
    }
  }, [scheduleItems, event.id]);

  // Handlers de configuración
  const handleConfigClick = (item: any) => {
    setSelectedItem(item);
    setShowConfigModal(true);
  };

  const handleConfirmConfig = async (config: { blocks: number; tracksPerBlock: number; judgesPerBlock: number }) => {
    if (!selectedItem) return;

    try {
      setIsConfiguring(true);

      const liveCompetitionId = `${selectedItem.levelId}_${selectedItem.category}_${selectedItem.gender || 'Mixto'}`;
      const liveCompDocRef = doc(db, 'eventos', event.id, 'liveCompetition', liveCompetitionId);

      // Actualizar la configuración en Firestore
      await updateDoc(liveCompDocRef, {
        blocks: config.blocks,
        tracksPerBlock: config.tracksPerBlock,
        judgesPerBlock: config.judgesPerBlock,
        updatedAt: serverTimestamp()
      });

      // Actualizar estado local
      setCompetitionStatuses(prev => ({
        ...prev,
        [selectedItem.id]: {
          ...prev[selectedItem.id],
          isConfigured: true,
          currentStatus: 'ready'
        }
      }));
      
      setShowConfigModal(false);
      setSelectedItem(null);

    } catch (error) {
      console.error('Error saving configuration:', error);
      alert(`Error al guardar configuración: ${error.message || error}`);
    } finally {
      setIsConfiguring(false);
    }
  };

  const handleCloseConfigModal = () => {
    setShowConfigModal(false);
    setSelectedItem(null);
  };

  // Handlers de tandas
  const handlePlayClick = async (item: any, index: number): Promise<{ tandas: Tanda[]; participants: Participant[] } | null> => {
    try {
      setIsGeneratingTandas(true);
      setSelectedItem(item);

      const participants = item.gender
        ? getParticipantsByGender(item.levelId, item.category, item.gender)
        : getParticipantsByCategory(item.levelId, item.category);

      if (participants.length === 0) {
        alert('No hay participantes registrados para esta categoría');
        return null;
      }

      const liveCompetitionId = `${item.levelId}_${item.category}_${item.gender || 'Mixto'}`;
      const phase = item.phase || 'Final';
      const status = competitionStatuses[item.id];

      // Si ya existen tandas, cargarlas desde Firestore
      if (status?.hasExistingTandas) {
        const snapshot = await getDocs(
          collection(db, `eventos/${event.id}/liveCompetition/${liveCompetitionId}/tandas`)
        );

        const tandas: Tanda[] = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id
        })) as Tanda[];

        return { tandas, participants };
      }

      // Asegurar que el documento LiveCompetition existe
      const liveCompDocRef = doc(db, 'eventos', event.id, 'liveCompetition', liveCompetitionId);
      const docSnap = await getDoc(liveCompDocRef);
      if (!docSnap.exists()) {
        await setDoc(liveCompDocRef, {
          eventId: event.id,
          level: item.levelId,
          category: item.category,
          gender: item.gender || 'Mixto',
          phase,
          createdAt: serverTimestamp(),
          status: 'pending',
        });
      }

      // Generar nuevas tandas
      const tandas = await generateAndPrepareTandas(
        event.id,
        liveCompetitionId,
        phase,
        participants
      );

      setGeneratedTandas(tandas);
      setShowTandasModal(true);
      return null;

    } catch (error) {
      console.error('Error generando o cargando tandas:', error);
      alert(`Error al procesar tandas: ${error.message || error}`);
      return null;
    } finally {
      setIsGeneratingTandas(false);
    }
  };

  const handleConfirmTandas = async (): Promise<{ tandas: Tanda[]; participants: Participant[] } | null> => {
    if (!selectedItem || generatedTandas.length === 0) return null;

    try {
      setIsConfirmingTandas(true);

      const liveCompetitionId = `${selectedItem.levelId}_${selectedItem.category}_${selectedItem.gender || 'Mixto'}`;
      const phase = selectedItem.phase || 'Final';

      await confirmAndSaveTandas(event.id, liveCompetitionId, phase, generatedTandas);

      // Actualizar evento para marcar esta competencia como activa
      const eventRef = doc(db, 'eventos', event.id);
      await updateDoc(eventRef, {
        currentLiveCompetitionId: liveCompetitionId,
        updatedAt: serverTimestamp()
      });

      const participants = selectedItem.gender
        ? getParticipantsByGender(selectedItem.levelId, selectedItem.category, selectedItem.gender)
        : getParticipantsByCategory(selectedItem.levelId, selectedItem.category);

      // Actualizar estado local
      setCompetitionStatuses(prev => ({
        ...prev,
        [selectedItem.id]: {
          ...prev[selectedItem.id],
          hasExistingTandas: true,
          totalTandas: generatedTandas.length,
          currentStatus: 'in-progress'
        }
      }));

      const result = { tandas: generatedTandas, participants };
      
      setShowTandasModal(false);
      setGeneratedTandas([]);
      setSelectedItem(null);

      return result;

    } catch (error) {
      console.error('Error confirmando tandas:', error);
      alert(`Error al confirmar tandas: ${error.message || error}`);
      return null;
    } finally {
      setIsConfirmingTandas(false);
    }
  };

  const handleCloseModal = () => {
    setShowTandasModal(false);
    setGeneratedTandas([]);
    setSelectedItem(null);
  };

  // Función para finalizar competencia
  const handleCompetitionFinished = async (liveCompetitionId: string) => {
    try {
      const eventRef = doc(db, 'eventos', event.id);
      await updateDoc(eventRef, {
        currentLiveCompetitionId: null,
        completedCompetitions: [...(event.completedCompetitions || []), liveCompetitionId],
        updatedAt: serverTimestamp()
      });

      console.log(`✅ Competencia ${liveCompetitionId} completada y marcada como finalizada`);
    } catch (error) {
      console.error('Error al finalizar competencia:', error);
    }
  };

  // Utilidades
  const getActionButton = (item: any, participantsCount: number): ActionButtonData => {
    const status = competitionStatuses[item.id];
    
    if (!status || participantsCount === 0) {
      return {
        iconType: 'settings',
        className: 'bg-gray-100 text-gray-400 cursor-not-allowed',
        title: 'Sin participantes registrados',
        disabled: true,
        action: 'none'
      };
    }

    switch (status.currentStatus) {
      case 'pending':
        return {
          iconType: isConfiguring && selectedItem?.id === item.id ? 'loader' : 'settings',
          className: 'bg-orange-100 text-orange-600 hover:bg-orange-200',
          title: 'Configurar competencia',
          disabled: isConfiguring,
          action: 'config'
        };

      case 'ready':
        return {
          iconType: isGeneratingTandas && selectedItem?.id === item.id ? 'loader' : 'play',
          className: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          title: 'Iniciar competencia',
          disabled: isGeneratingTandas,
          action: 'play'
        };

      case 'in-progress':
      case 'completed':
        return {
          iconType: 'eye',
          className: 'bg-blue-100 text-blue-600 hover:bg-blue-200',
          title: status.currentStatus === 'completed' ? 'Ver resultados' : 'Ver progreso',
          disabled: isGeneratingTandas,
          action: 'view'
        };

      default:
        return {
          iconType: 'settings',
          className: 'bg-gray-100 text-gray-400',
          title: 'Estado desconocido',
          disabled: true,
          action: 'none'
        };
    }
  };

  const getBadgeInfo = (status: CompetitionStatus): BadgeData => {
    switch (status.currentStatus) {
      case 'pending':
        return {
          text: 'Sin configurar',
          className: 'bg-orange-100 text-orange-800'
        };
      case 'ready':
        return {
          text: 'Listo para iniciar',
          className: 'bg-green-100 text-green-800'
        };
      case 'in-progress':
        return {
          text: `En progreso (${status.completedTandas}/${status.totalTandas})`,
          className: 'bg-red-100 text-red-800'
        };
      case 'completed':
        return {
          text: 'Completado',
          className: 'bg-purple-100 text-purple-800'
        };
      default:
        return {
          text: 'Estado desconocido',
          className: 'bg-gray-100 text-gray-800'
        };
    }
  };

  return {
    // Estados
    competitionStatuses,
    showConfigModal,
    showTandasModal,
    selectedItem,
    generatedTandas,
    isConfiguring,
    isGeneratingTandas,
    isConfirmingTandas,
    
    // Handlers de configuración
    handleConfigClick,
    handleConfirmConfig,
    handleCloseConfigModal,
    
    // Handlers de tandas
    handlePlayClick,
    handleConfirmTandas,
    handleCloseModal,
    
    // Función para finalizar competencia
    handleCompetitionFinished,
    
    // Utilidades
    getActionButton,
    getBadgeInfo
  };
};