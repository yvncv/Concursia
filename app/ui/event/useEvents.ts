"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Event } from "./eventoType";

export default function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loadingEvent, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "eventos"));
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventsData);
      } catch (err) {
        console.error("Error fetching events", err);
        setError("Failed to fetch events");
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []); // El efecto se ejecutará solo una vez al montar el componente

  return { events, loadingEvent, error };
}
