"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/app/firebase/config";
import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import useUser from "@/app/hooks/useUser";
import { useGlobalLevels } from "@/app/hooks/useGlobalLevels";
import { useGlobalCategories } from "@/app/hooks/useGlobalCategories";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import {
  EventFormData,
  CustomEvent,
  LevelData,
  EventSettings,
  LevelConfig,
  ScheduleItem,
  CompetitionPhase,
  Gender
} from '@/app/types/eventType';
import { User } from "@/app/types/userType";
import { ModalityLevel } from '@/app/types/levelsType';
import { CategoryLevel } from '@/app/types/categoriesType';
import { v4 as uuidv4 } from 'uuid';

interface EventCreationHandler {
  createEvent: (eventData: EventFormData, user: User) => Promise<{ success: boolean; message: string }>;
  updateEvent: (eventData: EventFormData, user: User, eventId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  globalConfigLoading: boolean;
  globalConfigError: string | null;
}

export const useEventCreation = (): EventCreationHandler => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [academyName, setAcademyName] = useState<string>("");

  // 🔥 Hooks globales - Firebase como ÚNICA fuente de verdad
  const {
    levels: availableModalities,
    isCouple,
    getPhases,
    isGenderSeparated,
    loading: levelsLoading,
    error: levelsError
  } = useGlobalLevels();

  const {
    categorias: availableCategories,
    loading: categoriesLoading,
    error: categoriesError
  } = useGlobalCategories();

  const globalConfigLoading = levelsLoading || categoriesLoading;
  const globalConfigError = levelsError?.message || categoriesError?.message || null;

  // 🔧 Configuración básica del evento (solo estructura, no datos de modalidades)
  const DEFAULT_LEVEL_CONFIG: LevelConfig = {
    blocks: 1,
    tracksPerBlock: 4,
    judgesCount: 5,
    notes: ""
  };

  const DEFAULT_SETTINGS: EventSettings = {
    inscription: {
      groupEnabled: false,
      individualEnabled: true,
      onSiteEnabled: true
    },
    pullCouple: {
      enabled: false,
      criteria: "Category",
      difference: 0
    },
    phases: {
      semifinalThreshold: 12,
      finalParticipantsCount: 6,
      timePerParticipant: {
        [CompetitionPhase.ELIMINATORIA]: 3,
        [CompetitionPhase.SEMIFINAL]: 4,
        [CompetitionPhase.FINAL]: 5
      }
    },
    schedule: {
      items: [],
      lastUpdated: Timestamp.now(),
      dayCount: 1
    }
  };

  // 🎯 Generador de schedule 100% dinámico
  const generateScheduleItems = (levels: { [key: string]: LevelData }): ScheduleItem[] => {
    if (availableModalities.length === 0) {
      console.error("No se pueden generar items de schedule: modalidades no cargadas desde Firebase");
      return [];
    }

    const scheduleItems: ScheduleItem[] = [];
    let orderCounter = 1;

    availableModalities.forEach(modalityName => {
      const levelData = levels[modalityName];
      if (!levelData?.selected) return;

      const categories = levelData.categories || [];
      if (categories.length === 0) return;

      const modalityPhases = getPhases(modalityName);
      const isGenderSeparatedModality = isGenderSeparated(modalityName);

      const genders: Gender[] = isGenderSeparatedModality
        ? ["Mujeres", "Varones"]
        : ["Mixto"];

      modalityPhases.forEach(phase => {
        genders.forEach(gender => {
          categories.forEach(category => {
            scheduleItems.push({
              id: uuidv4(),
              levelId: modalityName,
              category: category,
              gender: gender,
              phase: phase,
              order: orderCounter++,
              estimatedTime: getEstimatedTime(phase)
            });
          });
        });
      });
    });

    return scheduleItems;
  };

  const getEstimatedTime = (phase: CompetitionPhase): number => {
    switch (phase) {
      case CompetitionPhase.ELIMINATORIA:
        return 20;
      case CompetitionPhase.SEMIFINAL:
        return 15;
      case CompetitionPhase.FINAL:
        return 10;
      default:
        return 15;
    }
  };

  // ✅ Validación estricta basada SOLO en Firebase
  const validateEventData = (eventData: EventFormData): string | null => {
    // 🚨 Primero verificar que la configuración global esté cargada
    if (globalConfigLoading) {
      return "Esperando carga de configuración global...";
    }

    if (globalConfigError) {
      return `Error en configuración global: ${globalConfigError}`;
    }

    if (availableModalities.length === 0) {
      return "No hay modalidades disponibles. Verifica la configuración en Firebase.";
    }

    if (availableCategories.length === 0) {
      return "No hay categorías disponibles. Verifica la configuración en Firebase.";
    }

    // Validaciones básicas
    if (!eventData.general.name?.trim()) {
      return "El nombre del evento es requerido";
    }

    if (!eventData.dates.startDate || !eventData.dates.endDate) {
      return "Las fechas de inicio y fin son requeridas";
    }

    if (eventData.dates.startDate.toMillis() >= eventData.dates.endDate.toMillis()) {
      return "La fecha de inicio debe ser anterior a la fecha de fin";
    }

    // 🛡️ Validación estricta contra Firebase
    const selectedLevels = Object.entries(eventData.dance.levels)
      .filter(([_, levelData]) => levelData.selected);

    if (selectedLevels.length === 0) {
      return "Debe seleccionar al menos una modalidad";
    }

    for (const [levelId, levelData] of selectedLevels) {
      // Validar modalidad existe en Firebase
      if (!availableModalities.includes(levelId as ModalityLevel)) {
        return `Modalidad "${levelId}" no existe en la configuración de Firebase`;
      }

      // Validar categorías existen en Firebase
      if (levelData.categories && levelData.categories.length > 0) {
        const invalidCategories = levelData.categories
          .filter(category => !availableCategories.includes(category as CategoryLevel));

        if (invalidCategories.length > 0) {
          return `Categorías no válidas en ${levelId}: ${invalidCategories.join(', ')}`;
        }
      } else {
        return `La modalidad "${levelId}" debe tener al menos una categoría`;
      }
    }

    return null;
  };

  const clearError = () => {
    setError(null);
  };

  const uploadImage = async (image: File, eventId: string, type: 'banner' | 'small'): Promise<string> => {
    const folder = type === 'banner' ? 'bannerImages' : 'smallImages';
    const storageRef = ref(storage, `events/${folder}/${eventId}`);

    try {
      await uploadBytes(storageRef, image);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error al subir ${type} imagen:`, error);
      throw new Error(`Error al subir la imagen ${type}: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  };

  useEffect(() => {
    const fetchAcademyName = async () => {
      if (!user?.marinera?.academyId) return;

      try {
        const academyRef = doc(db, "academias", user.marinera.academyId);
        const academySnap = await getDoc(academyRef);

        if (academySnap.exists()) {
          setAcademyName(academySnap.data().name);
        }
      } catch (error) {
        console.error("Error fetching academy name:", error);
        setError("Error al cargar información de la academia");
      }
    };

    fetchAcademyName();
  }, [user]);

  const processEventData = async (
    eventData: EventFormData,
    user: User,
    eventId: string,
    academyName: string
  ): Promise<CustomEvent> => {
    let smallImageUrl = eventData.images.smallImage as string;
    let bannerImageUrl = eventData.images.bannerImage as string;

    if (eventData.images.smallImage instanceof File) {
      smallImageUrl = await uploadImage(eventData.images.smallImage, eventId, 'small');
    }

    if (eventData.images.bannerImage instanceof File) {
      bannerImageUrl = await uploadImage(eventData.images.bannerImage, eventId, 'banner');
    }

    const processedLevels: { [key: string]: LevelData } = {};

    Object.entries(eventData.dance.levels).forEach(([level, data]) => {
      if (data.selected) {
        processedLevels[level] = {
          categories: data.categories || [],
          price: Number(data.price),
          couple: data.couple,
          selected: true,
          config: data.config || DEFAULT_LEVEL_CONFIG
        };
      }
    });

    const settings = {
      ...DEFAULT_SETTINGS,
      ...eventData.settings
    };

    if (!settings.schedule || !settings.schedule.items || settings.schedule.items.length === 0) {
      settings.schedule = {
        ...DEFAULT_SETTINGS.schedule,
        items: generateScheduleItems(processedLevels)
      };
    }

    return {
      id: eventId,
      name: eventData.general.name,
      description: eventData.general.description,
      status: eventData.general.status,
      startDate: eventData.dates.startDate,
      endDate: eventData.dates.endDate,
      academyId: user?.marinera?.academyId,
      academyName: academyName,
      organizerId: user?.uid,
      smallImage: smallImageUrl,
      bannerImage: bannerImageUrl,
      location: {
        street: eventData.location.street,
        district: eventData.location.district,
        province: eventData.location.province,
        department: eventData.location.department,
        placeName: eventData.location.placeName,
        coordinates: {
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
        },
      },
      eventType: eventData.details.eventType,
      capacity: eventData.details.capacity,
      dance: { levels: processedLevels },
      settings: settings,
      createdBy: user.uid,
      lastUpdatedBy: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  };

  const createEvent = async (eventData: EventFormData, user: User): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      const errorMessage = "Usuario no autenticado";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }

    const validationError = validateEventData(eventData);
    if (validationError) {
      setError(validationError);
      return { success: false, message: validationError };
    }

    setLoading(true);
    setError(null);

    try {
      const eventId = new Date().getTime().toString();
      const event = await processEventData(eventData, user, eventId, academyName);

      await setDoc(doc(db, "eventos", eventId), event);

      return { success: true, message: "Evento creado exitosamente" };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al crear el evento";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventData: EventFormData, user: User, eventId: string): Promise<{ success: boolean; message: string }> => {
    if (!user) {
      const errorMessage = "Usuario no autenticado";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    }

    const validationError = validateEventData(eventData);
    if (validationError) {
      setError(validationError);
      return { success: false, message: validationError };
    }

    setLoading(true);
    setError(null);

    try {
      const eventDocRef = doc(db, "eventos", eventId);
      const eventDocSnap = await getDoc(eventDocRef);

      if (!eventDocSnap.exists()) {
        throw new Error("El evento no existe");
      }

      const currentEvent = eventDocSnap.data() as CustomEvent;
      const updatedEvent = await processEventData(eventData, user, eventId, academyName);

      if (currentEvent.settings?.schedule?.items?.length > 0 &&
        (!eventData.settings?.schedule || !eventData.settings.schedule.items)) {
        updatedEvent.settings.schedule = currentEvent.settings.schedule;
      }

      updatedEvent.updatedAt = Timestamp.now();

      await setDoc(doc(db, "eventos", eventId), updatedEvent, { merge: true });

      return { success: true, message: "Evento actualizado exitosamente" };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar el evento";
      setError(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createEvent,
    updateEvent,
    loading,
    error,
    clearError,
    globalConfigLoading,
    globalConfigError
  };
};