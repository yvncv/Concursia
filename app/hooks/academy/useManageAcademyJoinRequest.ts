import { useState } from "react";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  serverTimestamp,
  FirestoreError,
  runTransaction
} from "firebase/firestore";

interface UseManageAcademyJoinRequestResult {
  acceptRequest: (requestId: string, userId: string, academyId: string, academyName: string) => Promise<void>;
  rejectRequest: (requestId: string) => Promise<void>;
  loading: boolean;
  error: Error | null;
}

export function useManageAcademyJoinRequest(): UseManageAcademyJoinRequestResult {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const acceptRequest = async (
    requestId: string, 
    userId: string, 
    academyId: string, 
    academyName: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const db = getFirestore();
      
      // Usar transacción para asegurar consistencia
      await runTransaction(db, async (transaction) => {
        // Actualizar la solicitud
        const requestRef = doc(db, "academyJoinRequests", requestId);
        transaction.update(requestRef, {
          status: "accepted",
          responseDate: serverTimestamp()
        });

        // Actualizar el usuario para afiliarlo a la academia
        const userRef = doc(db, "users", userId);
        transaction.update(userRef, {
          "marinera.academyId": academyId,
          "marinera.academyName": academyName
        });
      });

      console.log("Solicitud aceptada exitosamente");
    } catch (err: any) {
      console.error("Error al aceptar solicitud:", err);
      
      if (err instanceof FirestoreError) {
        switch (err.code) {
          case 'permission-denied':
            setError(new Error("No tienes permisos para aceptar esta solicitud"));
            break;
          case 'not-found':
            setError(new Error("La solicitud o usuario no fue encontrado"));
            break;
          default:
            setError(new Error(`Error del servidor: ${err.message}`));
        }
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const rejectRequest = async (requestId: string): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      const db = getFirestore();
      const requestRef = doc(db, "academyJoinRequests", requestId);
      
      await updateDoc(requestRef, {
        status: "rejected",
        responseDate: serverTimestamp()
      });

      console.log("Solicitud rechazada exitosamente");
    } catch (err: any) {
      console.error("Error al rechazar solicitud:", err);
      
      if (err instanceof FirestoreError) {
        switch (err.code) {
          case 'permission-denied':
            setError(new Error("No tienes permisos para rechazar esta solicitud"));
            break;
          case 'not-found':
            setError(new Error("La solicitud no fue encontrada"));
            break;
          default:
            setError(new Error(`Error del servidor: ${err.message}`));
        }
      } else {
        setError(err instanceof Error ? err : new Error("Error desconocido"));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    acceptRequest,
    rejectRequest,
    loading,
    error
  };
}