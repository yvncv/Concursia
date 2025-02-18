import { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Academy } from "../types/academyType";

export default function useAcademy(academyId: string | undefined) {
  const [academy, setAcademy] = useState<Academy | null>(null);
  const [loadingAcademy, setLoading] = useState(true);
  const [errorAcademy, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!academyId) {
      setLoading(false);
      return;
    }

    const fetchAcademy = async () => {
      try {
        const academyDoc = await getDoc(doc(db, "academias", academyId));
        if (academyDoc.exists()) {
          setAcademy(academyDoc.data() as Academy);
        } else {
          setError("Academia no encontrada.");
        }
      } catch (err) {
        console.error("Error fetching academy:", err);
        setError("Error al obtener los datos de la academia.");
      } finally {
        setLoading(false);
      }
    };

    fetchAcademy();
  }, [academyId]);

  return { academy, loadingAcademy, errorAcademy };
}