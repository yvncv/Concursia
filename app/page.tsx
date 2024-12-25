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
    <main className="flex flex-col items-center min-h-screen p-8 text-center">
      <h1 className="text-3xl mb-4 text-center">SALUDOS{(user?.name) ? `, ${user?.name.toUpperCase()}` : ('')}.<br></br>ESTOS SON LOS EVENTOS DISPONIBLES.</h1>
      <div>
        <EventosComponents />
      </div>
    </main>
  );
}
