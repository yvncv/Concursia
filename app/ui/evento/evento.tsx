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
          className="m-1 relative border rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-xl bg-gradient-to-r from-red-300 via-red-200 to-red-100"
          key={event.id}
        >
          {/* {event.nombre && (
            <div className="absolute top-0 right-0 bg-yellow-500 text-white text-xs px-2 py-1">
              ¡Destacado!
            </div>
          )} */}
          <div className="relative w-full h-48 overflow-hidden">
            {/* Imagen desenfocada para los costados */}
            <div className="absolute inset-0 -z-10">
              {event.imagen && (
                <Image
                  src={event.imagen}
                  className="w-full h-full object-cover blur-sm scale-110"
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
                className="w-full h-full object-contain"
                alt={event.nombre}
                width={900}
                height={200}
              />
            )}
          </div>
          <div className="justify-center flex items-center space-x-2 text-white bg-red-700 py-1">
            {event.tipoEvento}
          </div>
          <div className="p-4 h-full bg-white bg-opacity-90">
            <h5 className="text-xl font-bold text-gray-800">{event.nombre}</h5>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <CalendarIcon className="text-red-600 w-5 h-5" />
              <span>{event.fecha.toDate().toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <PlaceIcon className="text-blue-600 w-5 h-5" />
              <span>{event.lugar}</span>
            </div>
            <div className="flex items-center space-x-2 mt-2 text-gray-600">
              <ClockIcon className="text-green-600 w-5 h-5" />
              <span>{event.fecha.toDate().toLocaleTimeString()}</span>
            </div>
            <p className="text-gray-600 mt-2">{event.descripcion}</p>
            <Link
              href={`/evento/${event.id}`}
              className="block mb-0 mt-4 text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            >
              Más información
            </Link>
          </div>
        </div>
      ))}
    </div>

  );
}
