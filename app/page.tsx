'use client';

import useUser from "./firebase/functions";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import Pagination from "./ui/pagination/Pagination";
import Filters from "./ui/filter/Filter";
import { useState } from "react";

export default function Home() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState(events);
  // pagination
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  // loading
  const loadingMessage =
    loadingUser ? "Obteniendo usuario..." : loadingEvent ? "Cargando eventos..." : null;

  if (loadingMessage) {
    return <div className="text-center text-gray-600">{loadingMessage}</div>;
  }
  // filter
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <main className="flex flex-col items-center min-h-screen text-center">
      <CarruselEvento
        imagenes={events.map((event) => event.smallImage)}
        ids={events.map((event) => event.id)}
      />

      <h1 className="text-2xl mb-4 text-left mt-6 text-rojo font-semibold">
        SALUDOS
        {user?.firstName ? `, ${user.firstName.toUpperCase()}` : ""}.
        ESTOS SON LOS EVENTOS DISPONIBLES.
      </h1>

      <div className="w-[90%] max-w-[1400px]">
        <Filters events={events} onFilterChange={setFilteredEvents} />
      </div>

      <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
        {currentEvents.length > 0 ? (
          <div className="w-[90%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
            {currentEvents.map((event) => (
              <EventComponent key={event.id} event={event} />
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No se encontraron eventos que coincidan con tu búsqueda.</p>
        )}
      </div>

      <Pagination
        totalItems={filteredEvents.length}
        itemsPerPage={eventsPerPage}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}
