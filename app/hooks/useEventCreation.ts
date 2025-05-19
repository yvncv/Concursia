"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/app/firebase/config";
import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import useUser from "@/app/hooks/useUser";
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
import { v4 as uuidv4 } from 'uuid';

interface EventCreationHandler {
  createEvent: (eventData: EventFormData, user: User) => Promise<{ success: boolean; message: string }>;
  updateEvent: (eventData: EventFormData, user: User, eventId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export const useEventCreation = (): EventCreationHandler => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [academyName, setAcademyName] = useState<string>("");

  // Configuración predeterminada para cada modalidad (level)
  const DEFAULT_LEVEL_CONFIG: LevelConfig = {
    blocks: 1,
    tracksPerBlock: 4,
    judgesCount: 5,
    notes: ""
  };

  // Configuraciones por defecto del evento
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
      semifinalThreshold: 12, // Si hay más de 12 participantes, habrá semifinal
      finalParticipantsCount: 6, // 6 participantes pasan a la final
      timePerParticipant: {
        [CompetitionPhase.ELIMINATORIA]: 3, // 3 minutos por participante en eliminatorias
        [CompetitionPhase.SEMIFINAL]: 4,    // 4 minutos por participante en semifinales
        [CompetitionPhase.FINAL]: 5         // 5 minutos por participante en finales
      }
    },
    schedule: {
      items: [],
      lastUpdated: Timestamp.now(),
      dayCount: 1
    }
  };

  // Función para generar los ítems del schedule basados en las modalidades y categorías
  const generateScheduleItems = (
    levels: { [key: string]: LevelData }
  ): ScheduleItem[] => {
    const scheduleItems: ScheduleItem[] = [];
    let orderCounter = 1;

    // Procesamos primero el Seriado (tanda única = final)
    if (levels["Seriado"] && levels["Seriado"].selected) {
      const seriadoCategories = levels["Seriado"].categories || [];
      
      // Seriado Mujeres
      seriadoCategories.forEach(category => {
        scheduleItems.push({
          id: uuidv4(),
          levelId: "Seriado",
          category: category,
          gender: "Mujeres",
          phase: CompetitionPhase.FINAL, // Seriado es siempre final (tanda única)
          order: orderCounter++,
          estimatedTime: 15 // Aproximadamente 15 minutos por categoría
        });
      });
      
      // Seriado Varones
      seriadoCategories.forEach(category => {
        scheduleItems.push({
          id: uuidv4(),
          levelId: "Seriado",
          category: category,
          gender: "Varones",
          phase: CompetitionPhase.FINAL, // Seriado es siempre final (tanda única)
          order: orderCounter++,
          estimatedTime: 15 // Aproximadamente 15 minutos por categoría
        });
      });
    }

    // Procesamos Individual (con eliminatorias, semifinales y finales)
    if (levels["Individual"] && levels["Individual"].selected) {
      const individualCategories = levels["Individual"].categories || [];
      
      // Procesamos las fases para Mujeres
      ["Mujeres", "Varones"].forEach((gender) => {
        // Eliminatorias
        individualCategories.forEach(category => {
          scheduleItems.push({
            id: uuidv4(),
            levelId: "Individual",
            category: category,
            gender: gender as Gender,
            phase: CompetitionPhase.ELIMINATORIA,
            order: orderCounter++,
            estimatedTime: 20 // Aproximadamente 20 minutos por categoría en eliminatorias
          });
        });
        
        // Semifinales
        individualCategories.forEach(category => {
          scheduleItems.push({
            id: uuidv4(),
            levelId: "Individual",
            category: category,
            gender: gender as Gender,
            phase: CompetitionPhase.SEMIFINAL,
            order: orderCounter++,
            estimatedTime: 15 // Aproximadamente 15 minutos por categoría en semifinales
          });
        });
        
        // Finales
        individualCategories.forEach(category => {
          scheduleItems.push({
            id: uuidv4(),
            levelId: "Individual",
            category: category,
            gender: gender as Gender,
            phase: CompetitionPhase.FINAL,
            order: orderCounter++,
            estimatedTime: 10 // Aproximadamente 10 minutos por categoría en finales
          });
        });
      });
    }

    // Procesamos el resto de modalidades (Novel Novel, Novel Abierto, etc.)
    Object.entries(levels).forEach(([levelId, levelData]) => {
      // Saltamos Seriado e Individual que ya fueron procesados
      if (levelId === "Seriado" || levelId === "Individual" || !levelData.selected) {
        return;
      }
      
      const categories = levelData.categories || [];
      
      // Para estas modalidades, no separamos por género (son mixtas)
      // Eliminatorias
      categories.forEach(category => {
        scheduleItems.push({
          id: uuidv4(),
          levelId: levelId,
          category: category,
          gender: "Mixto",
          phase: CompetitionPhase.ELIMINATORIA,
          order: orderCounter++,
          estimatedTime: 20 // Aproximadamente 20 minutos por categoría en eliminatorias
        });
      });
      
      // Semifinales
      categories.forEach(category => {
        scheduleItems.push({
          id: uuidv4(),
          levelId: levelId,
          category: category,
          gender: "Mixto",
          phase: CompetitionPhase.SEMIFINAL,
          order: orderCounter++,
          estimatedTime: 15 // Aproximadamente 15 minutos por categoría en semifinales
        });
      });
      
      // Finales
      categories.forEach(category => {
        scheduleItems.push({
          id: uuidv4(),
          levelId: levelId,
          category: category,
          gender: "Mixto",
          phase: CompetitionPhase.FINAL,
          order: orderCounter++,
          estimatedTime: 10 // Aproximadamente 10 minutos por categoría en finales
        });
      });
    });

    return scheduleItems;
  };

  const uploadImage = async (image: File, eventId: string, type: 'banner' | 'small'): Promise<string> => {
    const folder = type === 'banner' ? 'bannerImages' : 'smallImages';
    const storageRef = ref(storage, `events/${folder}/${eventId}`);

    try {
      await uploadBytes(storageRef, image);
      return await getDownloadURL(storageRef);
    } catch (error) {
      console.error(`Error al subir ${type} imagen:`, error);
      if (error instanceof Error) {
        throw new Error(`Error al subir la imagen ${type}: ${error.message}`);
      } else {
        throw new Error(`Error desconocido al subir la imagen ${type}`);
      }
    }
  };

  useEffect(() => {
    const fetchAcademyName = async () => {
      if (user && (user?.marinera?.academyId)) {
        const academyRef = doc(db, "academias", (user?.marinera?.academyId));
        const academySnap = await getDoc(academyRef);
        if (academySnap.exists()) {
          setAcademyName(academySnap.data().name);
        } else {
          console.error("Academia no encontrada");
        }
      }
    };

    const fetchData = async () => {
      await fetchAcademyName();
    };

    fetchData().catch(error => {
      console.error("Error fetching data:", error);
    });
  }, [user]);

  const processEventData = async (eventData: EventFormData, user: User, eventId: string, academyName: string, uploadImage: (image: File, eventId: string, type: 'banner' | 'small') => Promise<string>): Promise<CustomEvent> => {
    let smallImageUrl = eventData.images.smallImage as string;
    let bannerImageUrl = eventData.images.bannerImage as string;

    if (eventData.images.smallImage instanceof File) {
      smallImageUrl = await uploadImage(eventData.images.smallImage, eventId, 'small');
    }

    if (eventData.images.bannerImage instanceof File) {
      bannerImageUrl = await uploadImage(eventData.images.bannerImage, eventId, 'banner');
    }

    // Process levels including their categories and add default config
    const processedLevels: { 
      [key: string]: LevelData 
    } = {};
    
    Object.entries(eventData.dance.levels).forEach(([level, data]) => {
      if (data.selected) {
        processedLevels[level] = { 
          categories: data.categories || [],
          price: Number(data.price),
          couple: data.couple,
          selected: true,
          config: data.config || DEFAULT_LEVEL_CONFIG // Añadimos config por defecto
        };
      }
    });

    // Aseguramos que tenemos settings establecidos
    const settings = {
      ...DEFAULT_SETTINGS,
      ...eventData.settings
    };
    
    // Generamos los items del schedule si no existen
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
        coordinates: {
          latitude: eventData.location.latitude,
          longitude: eventData.location.longitude,
        },
        department: eventData.location.department,
        province: eventData.location.province,
        district: eventData.location.district,
        placeName: eventData.location.placeName,
        street: eventData.location.street,
      },
      eventType: eventData.details.eventType,
      capacity: eventData.details.capacity,
      dance: {
        levels: processedLevels,
      },
      settings: settings,
      createdBy: user.uid,
      lastUpdatedBy: user.uid,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
  };

  const createEvent = async (eventData: EventFormData, user: User): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    if (!user) {
      const errorMessage = "Usuario no autenticado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }

    try {
      const eventId = new Date().getTime().toString();
      const event = await processEventData(eventData, user, eventId, academyName, uploadImage);

      await setDoc(doc(db, "eventos", eventId), event);

      return {
        success: true,
        message: "Evento creado exitosamente"
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al crear el evento";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  const updateEvent = async (eventData: EventFormData, user: User, eventId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    if (!user) {
      const errorMessage = "Usuario no autenticado";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    }

    try {
      // Para actualización, necesitamos primero obtener el evento actual
      const eventDocRef = doc(db, "eventos", eventId);
      const eventDocSnap = await getDoc(eventDocRef);
      
      if (!eventDocSnap.exists()) {
        throw new Error("El evento no existe");
      }
      
      const currentEvent = eventDocSnap.data() as CustomEvent;
      
      // Procesar los nuevos datos del evento
      const updatedEvent = await processEventData(eventData, user, eventId, academyName, uploadImage);
      
      // Preservar el schedule existente si ya existe, a menos que sea explícitamente actualizado
      if (currentEvent.settings?.schedule?.items?.length > 0 && 
          (!eventData.settings?.schedule || !eventData.settings.schedule.items)) {
        updatedEvent.settings.schedule = currentEvent.settings.schedule;
      }
      
      // Actualizar la fecha de última modificación
      updatedEvent.updatedAt = Timestamp.now();

      await setDoc(doc(db, "eventos", eventId), updatedEvent, { merge: true });

      return {
        success: true,
        message: "Evento actualizado exitosamente"
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido al actualizar el evento";
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage
      };
    } finally {
      setLoading(false);
    }
  };

  return { createEvent, updateEvent, loading, error };
};