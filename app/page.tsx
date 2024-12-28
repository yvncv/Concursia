'use client';

import useUser from "./firebase/functions";
import useEvents from "./ui/evento/useEvents";
import EventComponent from "./ui/evento/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";

export default function Home() {
  const { user, loadingUser } = useUser(); // Estado del usuario
  const { events, loadingEvent } = useEvents(); // Estado de los eventos

  // Estado de carga general
  const loadingMessage =
    loadingUser ? "Obteniendo usuario..."
      : loadingEvent ? "Cargando eventos..."
        : null;

  if (loadingMessage) {
    return <div className="text-center text-gray-600">{loadingMessage}</div>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen text-center">
      {/* Carrusel de imágenes */}
      <CarruselEvento
        imagenes={events.map((evento) => evento.imagen)}
        ids={events.map((evento) => evento.id)}
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
          {events.map((event) => (
            <EventComponent key={event.id} event={event} />
          ))}
        </div>
      </div>
    </main>
  );
}
