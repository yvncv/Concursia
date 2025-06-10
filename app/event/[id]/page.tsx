"use client"
import { useState, useEffect } from "react";
import useSettings from "@/app/hooks/useSettings";
import useEvents from "@/app/hooks/useEvents";
import useUser from "@/app/hooks/useUser";
import EventoInformacion from "./EventoInformacion";
import EventoInscripcion from "./EventoInscripcion";
import EventoInscripcionAlumnos from "./EventoInscripcionAlumnos";
import dynamic from "next/dynamic";
import { use } from "react";
import { MapPin, Calendar, User, ArrowLeftCircle } from "lucide-react";
import useAcademy from "@/app/hooks/useAcademy";
import Link from "next/link";
import Image from "next/image";

const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

// Type adapter for converting coordinates from string to number for EventoInscripcionAlumnos
const adaptEventForInscripcionAlumnos = (event: any): any => {
  if (!event) return null;
  
  // Create a deep copy of the event to avoid modifying the original
  const adaptedEvent = {
    ...event,
    location: {
      ...event.location,
      coordinates: {
        ...event.location.coordinates,
        // Convert string coordinates to numbers if they're strings
        latitude: typeof event.location.coordinates.latitude === 'string' 
          ? parseFloat(event.location.coordinates.latitude) 
          : event.location.coordinates.latitude,
        longitude: typeof event.location.coordinates.longitude === 'string' 
          ? parseFloat(event.location.coordinates.longitude) 
          : event.location.coordinates.longitude,
      }
    }
  };
  
  return adaptedEvent;
};

// Helper function to ensure coordinates are strings for Map component
const ensureStringCoordinates = (value: any): string => {
  if (typeof value === 'number') {
    return value.toString();
  }
  return value;
};

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const { events, loadingEvents, error } = useEvents();
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion" | "inscripcionAlumnos">("informacion");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAcademyModalOpen, setIsAcademyModalOpen] = useState(false);
  const { id } = use(params);
  const { settings, loading: loadingSettings, error: error_settings } = useSettings(id);

  const event = events.find((event) => event.id === id);
  const { academy } = useAcademy(event?.academyId);

  // Determina si el usuario es el organizador del evento actual
  const isEventOrganizer = user?.id === event?.organizerId;

  // Determina si el usuario es un organizador (cualquier organizador)
  const isOrganizer = user?.roleId === "organizer";

  // Adapt the event for EventoInscripcionAlumnos to fix type incompatibility
  const adaptedEvent = event ? adaptEventForInscripcionAlumnos(event) : null;

  // Determine if individual web inscription is enabled
  const isIndividualWebEnabled = settings?.inscription?.individualEnabled || false;
  
  // Determine if group CSV inscription is enabled
  const isGrupalCSVEnabled = settings?.inscription?.groupEnabled || false;

  // Set active tab to information if the current tab is disabled based on settings
  useEffect(() => {
    if (
      (activeTab === "inscripcion" && !isIndividualWebEnabled) ||
      (activeTab === "inscripcionAlumnos" && !isGrupalCSVEnabled)
    ) {
      setActiveTab("informacion");
    }
  }, [activeTab, isIndividualWebEnabled, isGrupalCSVEnabled]);

  const handleInscribirClick = () => {
    // Only allow changing tab if individual web inscription is enabled
    if (isIndividualWebEnabled) {
      setActiveTab("inscripcion");
    }
  };

  const handleInscribirAlumnosClick = () => {
    // Only allow changing tab if group CSV inscription is enabled
    if (isGrupalCSVEnabled) {
      setActiveTab("inscripcionAlumnos");
    }
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
    <div className="min-h-screen relative">
      <div className="absolute top-4 left-4 z-20">
        <Link href="/calendario" passHref>
          <div
            className="rounded-xl p-1 shadow cursor-pointer"
            aria-label="Ir a calendario"
          >
            <ArrowLeftCircle className="bg-white rounded-xl text-rojo w-6 h-6 border-red transition" />
          </div>
        </Link>
      </div>
      <div className="relative h-96 overflow-hidden">
        <div className="relative w-full h-full overflow-hidden">
          {/* Fondo desenfocado */}
          <div className="absolute inset-0 -z-10">
            <Image
              src={event.bannerImage}
              fill
              className="object-cover w-full h-full blur-xl brightness-50 scale-125"
              alt={`Blurred background of ${event.bannerImage}`}
              loader={({ src }) => src}
            />
          </div>

          {/* Imagen principal con efecto hover */}
          <div className="relative w-full h-full transition-transform duration-500 hover:scale-105">
            <Image
              src={event.bannerImage}
              fill
              className="object-contain w-full h-full"
              alt={`Main banner of ${event.bannerImage}`}
              loader={({ src }) => src}
            />
          </div>
        </div>

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

      <div className="md:max-w-6xl text-sm md:text-lg md:mx-auto md:px-4 md:py-8">
        <div className="bg-white/80 md:rounded-xl shadow-sm mb-8">
          <div className="flex border-b">
            {/* Tab de Información - siempre visible para todos */}
            <button
              className={`flex-1 p-2 md:px-6 md:py-4 text-center font-medium transition-colors
                ${activeTab === "informacion"
                  ? "text-yellow-600 border-b-2 border-yellow-600"
                  : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("informacion")}
            >
              Información
            </button>

            {/* Tab de Inscripción - visible solo si individualWeb está habilitado */}
            <div className="flex flex-col text-center flex-1 p-2 md:px-6 md:py-4 font-medium transition-colors">
              <button
                className={`
                ${!isIndividualWebEnabled ? "text-gray-400 cursor-not-allowed" : ""}
                ${activeTab === "inscripcion"
                    ? "text-red-600 border-b-2 border-red-600"
                    : "text-gray-500 hover:text-gray-700"}`}
                onClick={() => isIndividualWebEnabled && setActiveTab("inscripcion")}
                disabled={!isIndividualWebEnabled}
              >
                Inscripción
              </button>
              <div>
                {!isGrupalCSVEnabled && (
                  <span className="ml-2 text-xs text-gray-400">(Deshabilitado)</span>
                )}
              </div>
            </div>

            {/* Tab de Inscripción de Alumnos - solo visible para organizadores y si grupalCSV está habilitado */}
            {isOrganizer && (
              <div className="flex flex-col text-center flex-1 p-2 md:px-6 md:py-4 font-medium transition-colors">
                <button
                  className={`
                  ${!isGrupalCSVEnabled ? "text-gray-400 cursor-not-allowed" : ""}
                  ${activeTab === "inscripcionAlumnos"
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-500 hover:text-gray-700"}`}
                  onClick={() => isGrupalCSVEnabled && setActiveTab("inscripcionAlumnos")}
                  disabled={!isGrupalCSVEnabled}
                >
                  Inscribir Alumnos
                </button>
                <div>
                  {!isGrupalCSVEnabled && (
                    <span className="ml-2 text-xs text-gray-400">(Deshabilitado)</span>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="lg:p-6">
            {activeTab === "informacion" ? (
              <EventoInformacion
                event={event}
                openModal={() => setIsModalOpen(true)}
                onInscribir={handleInscribirClick}
                onInscribirAlumnos={handleInscribirAlumnosClick}
                user={user}
                isEventOrganizer={isEventOrganizer}
                loading={loadingSettings}
                error={error_settings}
                isIndividualWebEnabled={isIndividualWebEnabled}
                isGrupalCSVEnabled={isGrupalCSVEnabled}
              />
            ) : activeTab === "inscripcion" ? (
              user ? (
                isIndividualWebEnabled ? (
                  <EventoInscripcion
                    event={event}
                    openModal={() => setIsAcademyModalOpen(true)}
                    user={user} 
                  />
                ) : (
                  <div className="flex flex-col items-center py-12 text-gray-500">
                    <User className="w-12 h-12 mb-4" />
                    <p className="text-lg">La inscripción web individual no está habilitada para este evento.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <User className="w-12 h-12 mb-4" />
                  <p className="text-lg">Debes iniciar sesión para inscribirte.</p>
                </div>
              )
            ) : activeTab === "inscripcionAlumnos" ? (
              user ? (
                isGrupalCSVEnabled ? (
                  <EventoInscripcionAlumnos event={adaptedEvent} user={user} />
                ) : (
                  <div className="flex flex-col items-center py-12 text-gray-500">
                    <User className="w-12 h-12 mb-4" />
                    <p className="text-lg">La inscripción grupal CSV no está habilitada para este evento.</p>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <User className="w-12 h-12 mb-4" />
                  <p className="text-lg">Debes iniciar sesión para inscribir alumnos.</p>
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
                  latitude={ensureStringCoordinates(event.location.coordinates.latitude)}
                  longitude={ensureStringCoordinates(event.location.coordinates.longitude)}
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
                  latitude={ensureStringCoordinates(academy.location.coordinates.latitude)}
                  longitude={ensureStringCoordinates(academy.location.coordinates.longitude)}
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