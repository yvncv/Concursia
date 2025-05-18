"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/app/firebase/config";
import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import useUser from "@/app/hooks/useUser";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { EventFormData, CustomEvent, LevelData, EventSettings } from '@/app/types/eventType';
import { User } from "@/app/types/userType";

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

  const DEFAULT_SETTINGS: EventSettings = {
    inscription: {
      groupEnabled: false,
      individualEnabled: false,
      onSiteEnabled: false,
    },
    registration: {
      grupalCSV: false,
      individualWeb: false,
      sameDay: false
    },
    pullCouple: {
      enabled: false,
      criteria: "Category",
      difference: 0
    }
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

    const fetchDataAsync = async () => {
      await fetchData();
    };

    fetchDataAsync().catch(error => {
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

    // Process levels including their categories
    const processedLevels: { 
      [key: string]: LevelData 
    } = {};
    
    Object.entries(eventData.dance.levels).forEach(([level, data]) => {
      if (data.selected) {
        processedLevels[level] = { 
          categories: data.categories || [],
          price: Number(data.price),
          couple: data.couple,
          selected: true
        };
      }
    });

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
      settings: eventData.settings || DEFAULT_SETTINGS,
      createdBy: user?.uid,
      lastUpdatedBy: user?.uid,
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
      const event = await processEventData(eventData, user, eventId, academyName, uploadImage);
      event.updatedAt = Timestamp.now(); // Solo actualizamos el timestamp de actualización

      await setDoc(doc(db, "eventos", eventId), event, { merge: true });

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