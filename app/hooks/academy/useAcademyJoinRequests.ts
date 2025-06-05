import { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  FirestoreError
} from "firebase/firestore";
import { AcademyJoinRequest } from "@/app/types/academyJoinRequestType";

interface UseAcademyJoinRequestsResult {
  requests: AcademyJoinRequest[];
  loading: boolean;
  error: Error | null;
  hasRequestForAcademy: (academyId: string) => AcademyJoinRequest | null;
}

export function useAcademyJoinRequests(userId?: string): UseAcademyJoinRequestsResult {
  const [requests, setRequests] = useState<AcademyJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const requestsRef = collection(db, "academyJoinRequests");
    const q = query(requestsRef, where("userId", "==", userId));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const requestsData: AcademyJoinRequest[] = [];
          snapshot.forEach((doc: QueryDocumentSnapshot<DocumentData>) => {
            requestsData.push({
              id: doc.id,
              ...doc.data()
            } as AcademyJoinRequest);
          });
          
          setRequests(requestsData);
          setError(null);
        } catch (err: any) {
          console.error("Error al procesar solicitudes:", err);
          setError(err instanceof Error ? err : new Error("Error desconocido"));
        } finally {
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("Error en listener de solicitudes:", err);
        
        // Manejo específico de errores de permisos
        if (err.code === 'permission-denied') {
          console.log("Sin permisos para leer solicitudes - esto es normal si no hay solicitudes");
          setRequests([]);
          setError(null); // No mostrar error para permisos denegados en este caso
        } else {
          setError(new Error(`Error de Firestore: ${err.message}`));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [userId]);

  const hasRequestForAcademy = (academyId: string): AcademyJoinRequest | null => {
    return requests.find(request => 
      request.academyId === academyId && 
      request.status === "pending"
    ) || null;
  };

  return {
    requests,
    loading,
    error,
    hasRequestForAcademy
  };
}