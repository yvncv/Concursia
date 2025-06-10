'use client';

import { useState } from "react";
import useUser from "@/app/hooks/useUser";
import useEvents from "../hooks/useEvents";
import EventComponent from "../ui/event/eventComponent";
import CarruselEvento from "../ui/carrousel/carrousel";
import Pagination from "../ui/pagination/Pagination";

export default function TodosEventos() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvents } = useEvents();
  
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  const loadingMessage =
    loadingUser ? "Obteniendo usuario..." : loadingEvents ? "Cargando eventos..." : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white/80 backdrop-blur-sm p-6 rounded-lg shadow-lg">
          <div className="animate-pulse text-red-600 text-lg">{loadingMessage}</div>
        </div>
      </div>
    );
  }

  const capitalizeName = (name : string) =>
    name.toLowerCase().replace(/\b\w/g, (char : string) => char.toUpperCase());

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const activeEvents = currentEvents.filter(event => event.status === 'active');

  return (
      <main className="flex flex-col items-center min-h-screen text-center">
        {/* Carrusel de Eventos */}
        <section className="relative h-[200px] sm:h-[450px] flex items-center justify-center w-full">
          {/* Carrusel de ancho completo */}
          <div className="absolute inset-0">
            <CarruselEvento events={events}/>
          </div>
        </section>

        {/* Contenido Principal */}
        <div className="w-full max-w-[1400px] md:px-8 md:mt-12">
          <div className="bg-white/80 backdrop-blur-sm md:rounded-xl p-3 md:p-6 shadow-lg mb-5 md:mb-8">
            <h1 className="md:text-2xl font-bold text-red-600">
              {user?.firstName ? `¡${user?.gender === "Femenino" ? "Bienvenida" : "Bienvenido"}, ${capitalizeName(user?.firstName)}` : "¡Bienvenido a Tusuy Perú"},
              estos son los eventos de la fecha!
            </h1>
          </div>

          {/* Grid de Eventos */}
          <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
              {activeEvents.length > 0 ? (
                  <div
                      className="w-[90%] grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
                    {activeEvents.map((event) => (
                        <div
                            key={event.id}
                            className="transform transition-all duration-300 hover:scale-[1.02]"
                        >
                          <EventComponent event={event}/>
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
)
  ;
}
