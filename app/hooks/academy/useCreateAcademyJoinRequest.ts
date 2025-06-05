import { useState } from "react";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  serverTimestamp,
  FirestoreError 
} from "firebase/firestore";
import { AcademyJoinRequest } from "@/app/types/academyJoinRequestType";

interface UseCreateAcademyJoinRequestResult {
  createRequest: (
    userId: string,
    academyId: string,
    message?: string
  ) => Promise<void>;
  loading: boolean;
  success: boolean | null;
  error: Error | null;
}

export function useCreateAcademyJoinRequest(): UseCreateAcademyJoinRequestResult {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const createRequest = async (
    userId: string,
    academyId: string,
    message?: string
  ): Promise<void> => {
    setLoading(true);
    setSuccess(null);
    setError(null);

    try {
      const db = getFirestore();
      const requestRef = collection(db, "academyJoinRequests");

      const requestData: Omit<AcademyJoinRequest, "id"> = {
        userId,
        academyId,
        status: "pending",
        requestDate: serverTimestamp(),
        message: message || "",
      };

      console.log("Enviando solicitud:", requestData);
      
      const docRef = await addDoc(requestRef, requestData);
      console.log("Solicitud creada con ID:", docRef.id);

      setSuccess(true);
    } catch (err: any) {
      console.error("Error al crear solicitud de afiliación:", err);
      
      // Manejo específico de errores de Firestore
      if (err instanceof FirestoreError) {
        switch (err.code) {
          case 'permission-denied':
            setError(new Error("No tienes permisos para enviar solicitudes. Verifica que hayas iniciado sesión."));
            break;
          case 'not-found':
            setError(new Error("La academia no fue encontrada."));
            break;
          case 'unavailable':
            setError(new Error("El servicio no está disponible. Intenta más tarde."));
            break;
          default:
            setError(new Error(`Error del servidor: ${err.message}`));
        }
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido al enviar la solicitud"));
      }
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return {
    createRequest,
    loading,
    success,
    error,
  };
}