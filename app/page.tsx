'use client';

import { useState } from "react";
import useUser from "./firebase/functions";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import Pagination from "./ui/pagination/Pagination";

export default function TodosEventos() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const loadingMessage =
    loadingUser ? "Obteniendo usuario..." : loadingEvent ? "Cargando eventos..." : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <div className="animate-pulse text-red-600 text-lg">{loadingMessage}</div>
        </div>
      </div>
    );
  }

  // Paginación
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <main className="flex flex-col items-center min-h-screen text-center">
      {/* Carrusel de Eventos */}
      <div className="w-full max-w-[1920px] relative">
        <CarruselEvento
          imagenes={events.map((event) => event.smallImage)}
          ids={events.map((event) => event.id)}
        />
      </div>

      {/* Contenido Principal */}
      <div className="w-full max-w-[1400px] px-4 md:px-8 mt-12">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg mb-8">
          <h1 className="text-2xl font-bold text-red-600">
            {user?.firstName ? `¡Bienvenido, ${user.firstName}` : "¡Bienvenido a Tusuy Perú"}, estos son los eventos disponibles!
          </h1>
        </div>

        {/* Grid de Eventos */}
        <div className="space-y-8">
          {currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentEvents.map((event) => (
                <div
                  key={event.id}
                  className="transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <EventComponent event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
              <p className="text-gray-600 text-lg">
                No hay eventos disponibles en este momento.
              </p>
            </div>
          )}
        </div>

        {/* Paginación */}
        {events.length > 0 && (
          <div className="flex justify-center py-4">
            <Pagination
              totalItems={events.length}
              itemsPerPage={eventsPerPage}
              currentPage={currentPage}
              onPageChange={setCurrentPage}
            />
          </div>
        )}
      </div>
    </main>
  );
}
