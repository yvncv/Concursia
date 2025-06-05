import { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  onSnapshot,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
  FirestoreError
} from "firebase/firestore";
import { AcademyJoinRequest } from "@/app/types/academyJoinRequestType";

interface UseAcademyJoinRequestsForOrganizerResult {
  requests: AcademyJoinRequest[];
  pendingRequests: AcademyJoinRequest[];
  processedRequests: AcademyJoinRequest[];
  loading: boolean;
  error: Error | null;
}

export function useAcademyJoinRequestsForOrganizer(academyId?: string): UseAcademyJoinRequestsForOrganizerResult {
  const [requests, setRequests] = useState<AcademyJoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!academyId) {
      setRequests([]);
      setLoading(false);
      return;
    }

    const db = getFirestore();
    const requestsRef = collection(db, "academyJoinRequests");
    const q = query(
      requestsRef, 
      where("academyId", "==", academyId),
      orderBy("requestDate", "desc")
    );

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
          console.error("Error al procesar solicitudes de la academia:", err);
          setError(err instanceof Error ? err : new Error("Error desconocido"));
        } finally {
          setLoading(false);
        }
      },
      (err: FirestoreError) => {
        console.error("Error en listener de solicitudes de la academia:", err);
        
        if (err.code === 'permission-denied') {
          setError(new Error("No tienes permisos para ver las solicitudes de esta academia"));
        } else {
          setError(new Error(`Error de Firestore: ${err.message}`));
        }
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [academyId]);

  // Separar solicitudes por estado
  const pendingRequests = requests.filter(req => req.status === 'pending');
  const processedRequests = requests.filter(req => req.status !== 'pending');

  return {
    requests,
    pendingRequests,
    processedRequests,
    loading,
    error
  };
}