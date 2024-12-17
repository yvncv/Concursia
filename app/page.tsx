"use client";
import { useEffect } from "react";
import useUser from "./firebase/functions";
import { useRouter } from "next/navigation";
import EventosComponents from "./ui/evento/evento";

export default function Home() {
  const { user, loading } = useUser(); // Extraer el usuario y el estado de carga
  const router = useRouter();

  // Manejo de redirección
  useEffect(() => {
    if (!loading && (!user || !user.email)) {
      router.push("/login");
    }
  }, [loading, user, router]);

  // Mostrar pantalla de carga mientras se verifica el estado del usuario
  if (loading || (!user && typeof window !== "undefined")) {
    return <p>Cargando...</p>;
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-center">
      <h1 className="text-4xl text-foreground mb-4">Saludos, {user?.name}. Estos son los eventos para ti</h1>
      {
        user && (
          <div>
            <EventosComponents />
          </div>
        )
      }
    </main>
  );
}
