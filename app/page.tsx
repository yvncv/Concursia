'use client';

import useUser from "./firebase/functions";
import EventComponent from "./ui/evento/eventComponent";
import useEvents from "./ui/evento/useEvents";

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
    <main className="flex flex-col items-center min-h-screen p-8 text-center">
      <h1 className="text-3xl mb-4 text-center">
        SALUDOS
        {user?.name ? `, ${user.name.toUpperCase()}` : ""}.
        <br />
        ESTOS SON LOS EVENTOS DISPONIBLES.
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4">
      {events.map((event) => (
          <EventComponent event={event} key={event.id} />
      ))}
      </div>
    </main>
  );
}
