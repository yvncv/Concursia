import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { collection, query, onSnapshot } from "firebase/firestore";
import { Event } from "../types/eventType";

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvent, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = () => {
      const q = query(collection(db, "eventos"));
      
      // Usar onSnapshot para escuchar cambios en tiempo real
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const eventsData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        setEvents(eventsData);
        setLoading(false);  // Datos cargados
      }, (err) => {
        console.error("Error fetching events", err);
        setError("Failed to fetch events");
        setLoading(false);
      });

      // Limpiar el listener cuando el componente se desmonte
      return () => unsubscribe();
    };

    fetchEvents();
  }, []); // Solo se ejecuta al montar el componente

  return { events, loadingEvent, error };
}
