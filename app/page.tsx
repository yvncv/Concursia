'use client';

import useUser from "./firebase/functions";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import { useState } from "react";

export default function Home() {
  const { user, loadingUser } = useUser(); // Estado del usuario
  const { events, loadingEvent } = useEvents(); // Estado de los eventos

  // Paginación: Cuántos eventos mostrar por página
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Estado de carga general
  const loadingMessage =
    loadingUser ? "Obteniendo usuario..."
      : loadingEvent ? "Cargando eventos..."
        : null;

  if (loadingMessage) {
    return <div className="text-center text-gray-600">{loadingMessage}</div>;
  }

  // Calcular los eventos para la página actual
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);

  // Número total de páginas
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(events.length / eventsPerPage); i++) {
    pageNumbers.push(i);
  }

  // Función para cambiar la página
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <main className="flex flex-col items-center min-h-screen text-center">
      {/* Carrusel de imágenes */}
      <CarruselEvento
        imagenes={events.map((event) => event.imagen)}
        ids={events.map((event) => event.id)}
      />

      {/* Mensaje de bienvenida */}
      <h1 className="text-2xl mb-4 text-left mt-6 text-rojo font-semibold">
        SALUDOS
        {user?.name ? `, ${user.name.toUpperCase()}` : ""}.
        ESTOS SON LOS EVENTOS DISPONIBLES.
      </h1>

      {/* Lista de eventos */}
      <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
        <div className="w-[90%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
          {currentEvents.map((event) => (
            <EventComponent key={event.id} event={event} />
          ))}
        </div>
      </div>

      {/* Paginación */}
      <div className="flex justify-center items-center m-6">
        {pageNumbers.map((number) => (
          <button
            key={number}
            onClick={() => paginate(number)}
            className={`px-4 py-2 rounded-3xl mx-2 ${
              currentPage === number
                ? "bg-rojo text-white"
                : "bg-gray-300 text-gray-700"
            } hover:bg-red-500 transition-all`}
          >
            {number}
          </button>
        ))}
      </div>
    </main>
  );
}
