"use client";

import Image from "next/image";
import Link from "next/link";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";

export default function LandingPage() {
  const { events } = useEvents();
  const pastEvents = events.filter(
    (event) => event.endDate.toDate() < new Date(Date.now())
  );

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto scroll-smooth">
        {/* Hero Section */}
        <section className="relative h-[200px] sm:h-[450px] flex items-center justify-center w-full">
          {/* Carrusel de ancho completo */}
          <div className="absolute inset-0">
            <CarruselEvento events={events} />
          </div>

          {/* Fondo oscuro */}
          <div className="absolute inset-0 bg-red-900/80 z-0"></div>

          {/* Contenido superpuesto */}
          <div className="relative z-1 text-center text-white px-4">
            <h1 className="text-sm sm:text-2xl md:text-5xl font-bold mb-4">
              Vive la Pasión de la Marinera Norteña
            </h1>
            <p className="text-sm sm:text-lg md:text-xl mb-4 mx-5 md:mb-8">
              Descubre los mejores eventos y competencias en Perú
            </p>
            <Link
              href={"/calendario"}
              className="text-sm bg-rojo p-2 rounded-lg text-white hover:bg-red-800"
            >
              Ver Eventos
            </Link>
          </div>
        </section>

        {/* Eventos Section */}
        <section id="eventos" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-screen-lg">
            {pastEvents.length > 0 ? (
              <>
                <h2 className="text-3xl font-bold text-center mb-8">
                  Eventos Recientes
                </h2>
                <div className="flex flex-wrap justify-center gap-4">
                  {pastEvents.map((event) => (
                    <EventComponent key={event.id} event={event} />
                  ))}
                </div>
              </>
            ) : (
              <p className="text-center">No hay eventos recientes.</p>
            )}
          </div>
        </section>

        {/* Galería Section */}
        <section id="galeria" className="py-16">
          <div className="container mx-auto px-4 max-w-screen-lg">
            <h2 className="text-3xl font-bold text-center mb-8">
              Galería de Imágenes
            </h2>
            {events.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {events.map((event) => (
                  <Image
                    key={event.smallImage}
                    src={event.smallImage}
                    alt={`Imagen de marinera ${event.smallImage}`}
                    width={300}
                    height={300}
                    className="w-full h-64 object-cover rounded-lg"
                    loader={({ src }) => src}
                  />
                ))}
              </div>
            ) : (
              <p className="text-center">
                No hay eventos registrados para mostrar en esta sección.
              </p>
            )}
          </div>
        </section>

        {/* Acerca de Section */}
        <section id="acerca" className="py-16 bg-red-700 text-white">
          <div className="container mx-auto px-4 max-w-screen-lg">
            <h2 className="text-3xl font-bold text-center mb-8">
              Acerca de la Marinera Norteña
            </h2>
            <div className="max-w-3xl mx-auto text-center">
              <p className="mb-4">
                La marinera norteña es una danza tradicional peruana que
                representa el cortejo entre un hombre y una mujer. Se
                caracteriza por sus movimientos elegantes y el uso del pañuelo
                como elemento principal.
              </p>
              <p>
                Originaria de la costa norte del Perú, la marinera norteña es
                considerada Patrimonio Cultural de la Nación y es ampliamente
                celebrada en festivales y concursos a lo largo del país.
              </p>
            </div>
          </div>
        </section>

        {/* Contacto Section */}
        <section id="contacto" className="py-16">
          <div className="container mx-auto px-4 max-w-screen-md">
            <h2 className="text-3xl font-bold text-center mb-8">Contáctanos</h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Nombre"
                className="w-full p-2 rounded-lg border"
              />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full p-2 rounded-lg border"
              />
              <textarea
                placeholder="Mensaje"
                className="w-full p-2 rounded-lg border"
              ></textarea>
              <button
                type="submit"
                className="bg-rojo hover:bg-red-800 p-2 rounded-lg text-white w-full"
              >
                Enviar Mensaje
              </button>
            </form>
          </div>
        </section>
      </main>
    </div>
  );
}
