/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, where, getDocs, addDoc, onSnapshot, doc, deleteDoc, Timestamp, updateDoc } from "firebase/firestore";
import { Academy } from "../types/academyType";

export default function useAcademies() {
  const [academies, setAcademies] = useState<Academy[]>([]);
  const [loadingAcademies, setLoading] = useState<boolean>(true);
  const [errorAcademies, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAcademias = () => {
      const q = query(collection(db, "academias"));

      // Usar onSnapshot para escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Academy[];

        setAcademies(eventsData);
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
  }, [academies]); // Solo se ejecuta al montar el componente


  const saveAcademy = async (academyData: Omit<Academy, 'id'>) => {
    try {
      const docRef = await addDoc(collection(db, "academias"), academyData);
      return docRef; // Devuelve el docRef que contiene la ID del academy creado
    } catch (error) {
      console.error('Error saving academy:', error);
      alert('Failed to save academy.');
    }
  };

  const deleteAcademy = async (id: string) => {
    try {
      // Importar deleteDoc y doc al inicio del archivo
      const docRef = doc(db, "academias", id);
      await deleteDoc(docRef);
      return true; // Retorna true si se eliminó exitosamente
    } catch (error) {
      console.error('Error deleting academy:', error);
      alert('Failed to delete academy.');
      return false;
    }
  };

  const updateAcademy = async (id: string, academyData: Partial<Omit<Academy, 'id'>>) => {
    try {
      // Añadir timestamp para updatedAt
      const dataWithTimestamp = {
        ...academyData,
        updatedAt: Timestamp.now()
      };

      const docRef = doc(db, "academias", id);
      await updateDoc(docRef, dataWithTimestamp);
      return true; // Retorna true si se actualizó exitosamente
    } catch (error) {
      console.error('Error updating academy:', error);
      alert('Failed to update academy.');
      return false;
    }
  };

  return {
    academies,
    loadingAcademies,
    errorAcademies,
    saveAcademy,
    deleteAcademy,
    updateAcademy
  };
}
