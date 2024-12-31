import { useState, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Academy } from "../types/academyType";
import useUser from "./useUser";

export default function useAcademia() {
  const [academia, setAcademia] = useState<Academy | null>(null);
  const [loadingAcademia, setLoading] = useState(true);
  const [errorAcademia, setError] = useState<string | null>(null);
  const { user } = useUser(); // Obtener el usuario actual

  useEffect(() => {
    if (!user?.uid) {
      setError("No se encontró el ID del organizador.");
      setLoading(false);
      return;
    }
  
    const fetchAcademia = async () => {
      try {
        setLoading(true);
        const academiasRef = collection(db, "academias");
        const q = query(academiasRef, where("idOrganizador", "==", user.uid));
        const querySnapshot = await getDocs(q);
  
        if (!querySnapshot.empty) {
          const docData = querySnapshot.docs[0].data();
          const docId = querySnapshot.docs[0].id;
          setAcademia({ id: docId, ...docData } as Academy);
        } else {
          setError("No se encontraron academias para este organizador.");
        }
      } catch (error) {
        console.error("Error al obtener los datos de la academia", error);
        setError("Error al obtener los datos de la academia.");
      } finally {
        setLoading(false);
      }
    };
  
    if (user?.uid) {
      fetchAcademia();
    }
  }, [user]);  // Dependencia en el `user`
  

  return { academia, loadingAcademia, errorAcademia };
}
