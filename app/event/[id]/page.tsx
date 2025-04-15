"use client"
import { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import useUser from "@/app/firebase/functions";
import EventoInformacion from "./EventoInformacion";
import EventoInscripcion from "./EventoInscripcion";
import EventoInscripcionAlumnos from "./EventoInscripcionAlumnos";
import dynamic from "next/dynamic";
import { use } from "react";
import { MapPin, Calendar, User } from "lucide-react";
import useAcademy from "@/app/hooks/useAcademy";

const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const { events, loadingEvents, error } = useEvents();
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion" | "inscripcionAlumnos">("informacion");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const { id } = use(params);

  const event = events.find((event) => event.id === id);
  const { academy } = useAcademy(event?.academyId);

  // Determina si el usuario es el organizador del evento actual
  const isEventOrganizer = user?.id === event?.organizerId;

  // Determina si el usuario es un organizador (cualquier organizador)
  const isOrganizer = user?.roleId === "organizer";

  const handleInscribirClick = () => {
    setActiveTab("inscripcion");
  };

  const handleInscribirAlumnosClick = () => {
    setActiveTab("inscripcionAlumnos");
  };

  if (loadingEvents) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-100 p-4 rounded-lg text-red-700">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-yellow-100 p-4 rounded-lg text-yellow-700">
          Evento no encontrado.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-96 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center transform hover:scale-105 transition-transform duration-500"
          style={{
            backgroundImage: `url(${event.bannerImage})`,
            filter: "brightness(0.6)",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <Calendar className="w-5 h-5" />
              <span className="text-sm font-medium">{event.eventType}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
            <div className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>{event.location.province}, {event.location.department}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 rounded-xl shadow-sm mb-8">
          <div className="flex border-b">
            {/* Tab de Información - siempre visible para todos */}
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === "informacion"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("informacion")}
            >
              Información
            </button>

            {/* Tab de Inscripción - visible para todos */}
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === "inscripcion"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("inscripcion")}
            >
              Inscripción
            </button>

            {/* Tab de Inscripción de Alumnos - solo visible para organizadores */}
            {isOrganizer && (
              <button
                className={`flex-1 px-6 py-4 text-center font-medium transition-colors
                  ${activeTab === "inscripcionAlumnos"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => setActiveTab("inscripcionAlumnos")}
              >
                Inscripción de Alumnos
              </button>
            )}
          </div>

          <div className="p-6">
            {activeTab === "informacion" ? (
              <EventoInformacion
                event={event}
                openModal={() => setIsModalOpen(true)}
                onInscribir={handleInscribirClick}
                onInscribirAlumnos={handleInscribirAlumnosClick}
                user={user}
                isEventOrganizer={isEventOrganizer}
              />
            ) : activeTab === "inscripcion" ? (
              user ? (
                <EventoInscripcion
                  event={event}
                  openModal={() => setIsAcademyModalOpen(true)}
                  user={user} />
              ) : (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <User className="w-12 h-12 mb-4" />
                  <p className="text-lg">Debes iniciar sesión para inscribirte.</p>
                </div>
              )
            ) : activeTab === "inscripcionAlumnos" ? (
              user ? (
                <EventoInscripcionAlumnos event={event} user={user} />
              ) : (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <User className="w-12 h-12 mb-4" />
                  <p className="text-lg">Debes iniciar sesión para inscribirte.</p>
                </div>
              )
            ) : null}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsModalOpen(false)}
        >
          <div
            className="bg-white/80 rounded-xl shadow-lg w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Ubicación de{" "}
                <span className="text-red-600">
                  {event.eventType}: {event.name}
                </span>
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-400 transition-all duration-300"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Contenido principal */}
            <div className="p-4 h-[400px] sm:h-[500px]">
              <div className="rounded-lg overflow-hidden h-full">
                <Map
                  latitude={event.location.coordinates.latitude}
                  longitude={event.location.coordinates.longitude}
                />
              </div>
            </div>

          </div>
        </div>
      )}

      {isAcademyModalOpen && academy && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setIsAcademyModalOpen(false)}
        >
          <div
            className="bg-white/80 rounded-xl shadow-lg w-full max-w-3xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Encabezado del modal */}
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800">
                Ubicación de{" "}
                <span className="text-red-600">
                  {academy.name}
                </span>
              </h2>
              <button
                onClick={() => setIsAcademyModalOpen(false)}
                className="bg-gradient-to-r from-red-600 to-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center hover:from-red-500 hover:to-red-400 transition-all duration-300"
                aria-label="Cerrar modal"
              >
                ✕
              </button>
            </div>

            {/* Contenido principal */}
            <div className="p-4 h-[400px] sm:h-[500px]">
              <div className="rounded-lg overflow-hidden h-full">
                <Map
                  latitude={academy.location.coordinates.latitude}
                  longitude={academy.location.coordinates.longitude}
                />
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default EventoDetalle;