import { useState, useEffect } from "react";
import { 
  getFirestore, 
  collection, 
  query, 
  where, 
  orderBy, 
  getDocs,
  doc,
  getDoc
} from "firebase/firestore";

interface AcademyHistoryRecord {
  id: string;
  academyId: string;
  academyName?: string;
  joinedAt: Date;
  leftAt?: Date;
  reason?: string;
  removedBy?: string;
  role?: string;
  isActive: boolean;
}

interface UseAcademyHistoryResult {
  academyHistory: AcademyHistoryRecord[];
  loading: boolean;
  error: string | null;
  totalAcademies: number;
  totalYears: number;
}

export function useAcademyHistory(userId: string | undefined): UseAcademyHistoryResult {
  const [academyHistory, setAcademyHistory] = useState<AcademyHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchAcademyHistory = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const db = getFirestore();
        
        // Obtener historial de membresías del usuario (sin orderBy para evitar el índice)
        const historyQuery = query(
          collection(db, "academyMembershipHistory"),
          where("userId", "==", userId)
        );
        
        const snapshot = await getDocs(historyQuery);
        
        if (snapshot.empty) {
          setAcademyHistory([]);
          setLoading(false);
          return;
        }

        // Procesar cada registro y obtener información de la academia
        const historyPromises = snapshot.docs.map(async (docSnapshot) => {
          const data = docSnapshot.data();
          
          // Convertir timestamps a fechas
          const joinedAt = data.joinedAt?.toDate() || new Date();
          const leftAt = data.leftAt?.toDate() || null;
          
          // Intentar obtener el nombre de la academia
          let academyName = data.academyName || 'Academia desconocida';
          
          try {
            if (data.academyId) {
              const academyDoc = await getDoc(doc(db, "academias", data.academyId));
              if (academyDoc.exists()) {
                academyName = academyDoc.data().name || academyName;
              }
            }
          } catch (academyError) {
            console.warn(`No se pudo obtener información de la academia ${data.academyId}:`, academyError);
          }

          return {
            id: docSnapshot.id,
            academyId: data.academyId || '',
            academyName,
            joinedAt,
            leftAt,
            reason: data.reason || '',
            removedBy: data.removedBy || '',
            role: data.role || 'participant',
            isActive: !leftAt // Si no tiene leftAt, está activo
          } as AcademyHistoryRecord;
        });

        const historyRecords = await Promise.all(historyPromises);
        
        // Ordenar manualmente por fecha de ingreso (más reciente primero)
        historyRecords.sort((a, b) => b.joinedAt.getTime() - a.joinedAt.getTime());
        
        setAcademyHistory(historyRecords);

      } catch (err) {
        console.error("Error fetching academy history:", err);
        setError("Error al cargar el historial de academias");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademyHistory();
  }, [userId]);

  // Calcular estadísticas
  const uniqueAcademies = new Set(academyHistory.map(record => record.academyId));
  const totalAcademies = uniqueAcademies.size;
  
  const totalYears = academyHistory.reduce((total, record) => {
    const startDate = record.joinedAt;
    const endDate = record.leftAt || new Date();
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return total + diffYears;
  }, 0);

  return {
    academyHistory,
    loading,
    error,
    totalAcademies,
    totalYears: Math.round(totalYears * 10) / 10 // Redondear a 1 decimal
  };
}