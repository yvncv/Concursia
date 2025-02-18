"use client";
import { useState, useEffect } from "react";
import { db, storage } from "@/app/firebase/config";
import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import useUser from "@/app/firebase/functions";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { EventFormData, CustomEvent } from '@/app/types/eventType';
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";

interface EventCreationHandler {
  createEvent: (eventData: EventFormData, user: any) => Promise<{ success: boolean; message: string }>;
  updateEvent: (eventData: EventFormData, user: any, eventId: string) => Promise<{ success: boolean; message: string }>;
  loading: boolean;
  error: string | null;
}

export const useEventCreation = (): EventCreationHandler => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [ubigeoData, setUbigeoData] = useState<Ubigeo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [academyName, setAcademyName] = useState<string>("");

  const uploadImage = async (image: File, eventId: string, type: 'banner' | 'small'): Promise<string> => {
    const folder = type === 'banner' ? 'bannerImages' : 'smallImages';
    const storageRef = ref(storage, `events/${folder}/${eventId}`);

    try {
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      return downloadURL;
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
    const fetchAcademyNameAndUbigeo = async () => {
      if (user && user.academyId) {
        const academyRef = doc(db, "academias", user.academyId);
        const academySnap = await getDoc(academyRef);
        if (academySnap.exists()) {
          setAcademyName(academySnap.data().name);
        } else {
          console.error("Academia no encontrada");
        }
      }

      try {
        const ubigeoData = await fetchUbigeoINEI();
        setUbigeoData(ubigeoData);
      } catch (error) {
        console.error("Error al obtener datos de Ubigeo:", error);
      }
    };

    fetchAcademyNameAndUbigeo();
  }, [user]);

  const createEvent = async (eventData: EventFormData, user: any): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      const eventId = new Date().getTime().toString();

      let smallImageUrl = '';
      let bannerImageUrl = '';

      if (eventData.images.smallImage instanceof File) {
        smallImageUrl = await uploadImage(eventData.images.smallImage, eventId, 'small');
      } else if (typeof eventData.images.smallImage === 'string') {
        smallImageUrl = eventData.images.smallImage;
      }

      if (eventData.images.bannerImage instanceof File) {
        bannerImageUrl = await uploadImage(eventData.images.bannerImage, eventId, 'banner');
      } else if (typeof eventData.images.bannerImage === 'string') {
        bannerImageUrl = eventData.images.bannerImage;
      }

      const processedLevels: { [key: string]: { price: number; couple: boolean } } = {};
      Object.entries(eventData.dance.levels).forEach(([level, data]) => {
        if (data.selected) {
          processedLevels[level] = { price: parseFloat(data.price), couple: data.couple };
        }
      });

      const event: CustomEvent = {
        id: eventId,
        name: eventData.general.name,
        description: eventData.general.description,
        startDate: eventData.dates.startDate,
        endDate: eventData.dates.endDate,
        academyId: user.academyId,
        academyName: academyName,
        organizerId: user.uid,
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
        status: "pendiente",
         settings: {
          levels: processedLevels,
          categories: eventData.dance.categories,
          registrationType: [], // Ensure registrationType is included
        },
        createdBy: `${user?.firstName} ${user?.lastName}`,
        lastUpdatedBy: `${user?.firstName} ${user?.lastName}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

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

  const updateEvent = async (eventData: EventFormData, user: any, eventId: string): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      let smallImageUrl = eventData.images.smallImage as string;
      let bannerImageUrl = eventData.images.bannerImage as string;

      if (eventData.images.smallImage instanceof File) {
        smallImageUrl = await uploadImage(eventData.images.smallImage, eventId, 'small');
      }

      if (eventData.images.bannerImage instanceof File) {
        bannerImageUrl = await uploadImage(eventData.images.bannerImage, eventId, 'banner');
      }

      const processedLevels: { [key: string]: { price: number; couple: boolean } } = {};
      Object.entries(eventData.dance.levels).forEach(([level, data]) => {
        if (data.selected) {
          processedLevels[level] = { price: parseFloat(data.price), couple: data.couple };
        }
      });

      const event: CustomEvent = {
        id: eventId,
        name: eventData.general.name,
        description: eventData.general.description,
        startDate: eventData.dates.startDate,
        endDate: eventData.dates.endDate,
        academyId: user.academyId,
        academyName: academyName,
        organizerId: user.uid,
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
        status: "pendiente",
        settings: {
          levels: processedLevels,
          categories: eventData.dance.categories,
          registrationType: [], // Ensure registrationType is included
        },
        createdBy: `${user?.firstName} ${user?.lastName}`,
        lastUpdatedBy: `${user?.firstName} ${user?.lastName}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

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