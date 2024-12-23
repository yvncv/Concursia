"use client";

import useUser from "./firebase/functions";
import EventosComponents from "./ui/evento/evento";

export default function Home() {
  const { user, loading } = useUser(); // Extraer el usuario y el estado de carga

  // Mostrar pantalla de carga mientras se verifica el estado del usuario
  if (loading) {
    return <p>Cargando...</p>;
  }

  return (
    <main className="flex flex-col items-center min-h-screen p-8 bg-background text-center">
      <h1 className="text-4xl text-foreground mb-4">Saludos{(user?.name) ? `, ${user?.name}` : ('')}. Estos son los eventos para ti</h1>
      <div>
        <EventosComponents />
      </div>
    </main>
  );
}
