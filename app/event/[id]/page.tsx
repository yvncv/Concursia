"use client"
import { useState, useEffect } from "react";
import useSettings from "@/app/hooks/useSettings";
import useEvents from "@/app/hooks/useEvents";
import useUser from "@/app/hooks/useUser";
import EventoInformacion from "./EventoInformacion";
import EventoInscripcion from "./EventoInscripcion";
import EventoInscripcionAlumnos from "./EventGroupInscription";
import dynamic from "next/dynamic";
import { use } from "react";
import { MapPin, Calendar, User, ArrowLeftCircle } from "lucide-react";
import useAcademy from "@/app/hooks/useAcademy";
import Link from "next/link";
import Image from "next/image";
import IzipayScriptWrapper from "@/app/wrappers/IzipayButtonWrapper";

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
            className="rounded-xl bg-white/80 p-1 shadow cursor-pointer"
            aria-label="Ir a calendario"
          >
            <ArrowLeftCircle className="rounded-xl text-rojo w-6 h-6 border-red transition" />
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
            {/* Imagen para celulares */}
            <div className="sm:hidden">
              <Image
                src={event.smallImage}
                fill
                className="object-contain w-full h-full"
                alt={`Small banner of ${event.smallImage}`}
                loader={({ src }) => src}
              />
            </div>

            {/* Imagen para pantallas medianas y grandes */}
            <div className="hidden sm:block">
              <Image
                src={event.bannerImage}
                fill
                className="object-contain w-full h-full"
                alt={`Main banner of ${event.bannerImage}`}
                loader={({ src }) => src}
              />
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
      </div>

      <div className="md:max-w-6xl text-sm md:text-lg md:mx-auto md:px-4 md:py-8">
        <div className="bg-gradient-to-br from-white/90 to-gray-50/90 backdrop-blur-sm md:rounded-2xl shadow-xl mb-8">
          <div className="flex border-b border-gray-200/50">
            {/* Tab de Información - siempre visible para todos */}
            <button
              className={`flex-1 p-3 md:px-6 md:py-4 text-center font-medium transition-all duration-300 relative
                ${activeTab === "informacion"
                  ? "text-white bg-gradient-to-r from-yellow-400 to-amber-500 shadow-lg md:rounded-t-xl border-b-4 border-yellow-600"
                  : "text-gray-600"}`}
              onClick={() => setActiveTab("informacion")}
            >
              <span className="relative z-10">Información</span>
              {activeTab === "informacion" && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-yellow-500 to-amber-600 animate-pulse" />
              )}
            </button>

            {/* Tab de Inscripción - visible solo si individualWeb está habilitado */}
            <div className="flex-1 relative">
              <button
                className={`w-full p-3 md:px-6 md:py-4 text-center font-medium transition-all duration-300 relative
                  ${!isIndividualWebEnabled ? "text-gray-400 cursor-not-allowed opacity-50" : ""}
                  ${activeTab === "inscripcion"
                    ? "text-white bg-gradient-to-r from-red-400 to-rose-500 shadow-lg md:rounded-t-xl border-b-4 border-red-600"
                    : "text-gray-600"}`}
                onClick={() => isIndividualWebEnabled && setActiveTab("inscripcion")}
                disabled={!isIndividualWebEnabled}
              >
                <span className="relative z-10">
                  Inscripción{!isIndividualWebEnabled && " (Deshabilitado)"}
                </span>
                {activeTab === "inscripcion" && (
                  <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-rose-600 animate-pulse" />
                )}
              </button>
            </div>

            {/* Tab de Inscripción de Alumnos - solo visible para organizadores y si grupalCSV está habilitado */}
            {isOrganizer && (
              <div className="flex-1 relative">
                <button
                  className={`w-full p-3 md:px-6 md:py-4 text-center font-medium transition-all duration-300 relative
                    ${!isGrupalCSVEnabled ? "text-gray-400 cursor-not-allowed opacity-50" : ""}
                    ${activeTab === "inscripcionAlumnos"
                      ? "text-white bg-gradient-to-r from-blue-400 to-indigo-500 shadow-lg md:rounded-t-xl border-b-4 border-blue-600"
                      : "text-gray-600"}`}
                  onClick={() => isGrupalCSVEnabled && setActiveTab("inscripcionAlumnos")}
                  disabled={!isGrupalCSVEnabled}
                >
                  <span className="relative z-10">
                    Inscribir Alumnos{!isGrupalCSVEnabled && " (Deshabilitado)"}
                  </span>
                  {activeTab === "inscripcionAlumnos" && (
                    <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse" />
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="lg:p-6">
            {activeTab === "informacion" ? (
              <div className="p-1">
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
              </div>
            ) : activeTab === "inscripcion" ? (
              <div className="p-1">
                {user ? (
                  isIndividualWebEnabled ? (
                    <IzipayScriptWrapper>
                      <EventoInscripcion
                        event={event}
                        openModal={() => setIsAcademyModalOpen(true)}
                        user={user}
                      />
                    </IzipayScriptWrapper>
                  ) : (
                    <div className="flex flex-col items-center py-16 text-gray-500">
                      <div className="bg-red-100/50 p-6 rounded-full mb-6">
                        <User className="w-16 h-16 text-red-400" />
                      </div>
                      <p className="text-lg font-medium text-center">La inscripción web individual no está habilitada para este evento.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center py-16 text-gray-500">
                    <div className="bg-red-100/50 p-6 rounded-full mb-6 animate-pulse">
                      <User className="w-16 h-16 text-red-400" />
                    </div>
                    <p className="text-lg font-medium text-center">Debes iniciar sesión para inscribirte.</p>
                  </div>
                )}
              </div>
            ) : activeTab === "inscripcionAlumnos" ? (
              <div className="p-1">
                {user ? (
                  isGrupalCSVEnabled ? (
                    <EventoInscripcionAlumnos event={adaptedEvent} user={user} />
                  ) : (
                    <div className="flex flex-col items-center py-16 text-gray-500">
                      <div className="bg-blue-100/50 p-6 rounded-full mb-6">
                        <User className="w-16 h-16 text-blue-400" />
                      </div>
                      <p className="text-lg font-medium text-center">La inscripción grupal CSV no está habilitada para este evento.</p>
                    </div>
                  )
                ) : (
                  <div className="flex flex-col items-center py-16 text-gray-500">
                    <div className="bg-blue-100/50 p-6 rounded-full mb-6 animate-pulse">
                      <User className="w-16 h-16 text-blue-400" />
                    </div>
                    <p className="text-lg font-medium text-center">Debes iniciar sesión para inscribir alumnos.</p>
                  </div>
                )}
              </div>
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