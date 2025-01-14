import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Academy } from "../types/academyType";

export default function useAcademias() {
  const [academias, setAcademias] = useState<Academy[]>([]);
  const [loadingAcademias, setLoading] = useState<boolean>(true);
  const [errorAcademias, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademias = () => {
      const q = query(collection(db, "academias"));
      
      // Usar onSnapshot para escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Academy[];

        setAcademias(eventsData);
        setLoading(false);  // Datos cargados
      }, (err) => {
        console.error("Error fetching academias", err);
        setError("Failed to fetch academias");
        setLoading(false);
      });

      // Limpiar el listener cuando el componente se desmonte
      return () => unsubscribe();
    };

    fetchAcademias();
  }, []); // Solo se ejecuta al montar el componente

  return { academias, loadingAcademias, errorAcademias };
}
