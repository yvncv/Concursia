"use client";

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import Image from "next/image";
import { Evento } from "./eventoType";
import Link from "next/link";

export default function EventosComponents() {
  // Use the defined event type for the state
  const [events, setEvents] = useState<Evento[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "eventos"));
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Evento[]; // Cast to Evento type
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {events.map((event) => (
        <div
          className="bg-foreground rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg"
          key={event.id}
        >
          {/* Conditionally render the image if it exists */}
          {event.imagen && (
            <Image
              src={event.imagen}
              className="w-full h-48 object-cover"
              alt={event.nombre}
              width={200}
              height={200}
            />
          )}
          <div className="p-4">
            <h5 className="text-lg font-semibold text-background">{event.nombre}</h5>
            <p className="text-background text-sm mt-2">{event.tipoEvento}</p>
            <p className="text-background text-sm mt-2">{event.lugar}</p>
            <p className="text-background text-sm mt-2">{event.descripcion}</p>
            <Link
              href={`/evento/${event.id}`}
              className="block mt-4 text-center bg-blue-600 text-foreground py-2 px-4 rounded hover:bg-blue-700"
            >
              Más información
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
