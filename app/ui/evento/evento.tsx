'use client';

import { useEffect, useState } from "react";
import { getDocs, collection } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import Image from "next/image";
import { Evento } from "./eventoType";
import Link from "next/link";
import CalendarIcon from "../icons/calendar"; // Import CalendarIcon
import ClockIcon from "../icons/clock";       // Import ClockIcon
import PlaceIcon from "../icons/place";       // Import PlaceIcon

export default function EventosComponents() {
  const [events, setEvents] = useState<Evento[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const eventsSnapshot = await getDocs(collection(db, "eventos"));
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Evento[];
        setEvents(eventsData);
      } catch (error) {
        console.error("Error fetching events", error);
      }
    };

    fetchEvents();
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {events.map((event) => (
        <div
          className="relative border border-red-500 rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg max-w-sm mx-auto"
          key={event.id}
        >
          {/* Fondo extendido con desenfoque */}
          <div className="relative w-full h-48 overflow-hidden">
            {/* Imagen desenfocada para los costados */}
            <div className="absolute inset-0 -z-10">
              {event.imagen && (
                <Image
                  src={event.imagen}
                  className="w-full h-full object-cover blur-md scale-110"
                  alt={`Blur background of ${event.nombre}`}
                  width={900}
                  height={200}
                />
              )}
            </div>
            {/* Imagen principal */}
            {event.imagen && (
              <Image
                src={event.imagen}
                className="w-full h-full object-contain p-2"
                alt={event.nombre}
                width={900}
                height={200}
              />
            )}
          </div>
          <div className="justify-center flex items-center space-x-2 text-white bg-red-700">
            {event.tipoEvento}
          </div>
          {/* Contenido del evento */}
          <div className="p-2 bg-white bg-opacity-80">
            <h5 className="text-xl font-bold text-gray-800">{event.nombre}</h5>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <CalendarIcon />
              <span>{event.fecha.toDate().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <PlaceIcon />
              <span>{event.lugar}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <ClockIcon />
              <span>{event.fecha.toDate().toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-600 mt-2">{event.descripcion}</p>
            <Link
              href={`/evento/${event.id}`}
              className="block mt-4 text-center border border-red-500 text-red-500 py-2 px-4 rounded hover:bg-red-500 hover:text-white transition"
            >
              Más información
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}
