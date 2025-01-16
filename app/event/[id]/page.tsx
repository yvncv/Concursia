"use client"
import { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import useUser from "@/app/firebase/functions";
import EventoInformacion from "./EventoInformacion";
import EventoInscripcion from "./EventoInscripcion";
import dynamic from "next/dynamic";
import { use } from "react";
import PlaceIcon from "@/app/ui/icons/marker";
import CalendarIcon from "@/app/ui/icons/calendar";
import { ProfileIcon } from "@/app/ui/icons/profile";

const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const { events, loadingEvents, error } = useEvents();
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion">("informacion");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [inscripcionEnabled, setInscripcionEnabled] = useState(false);
  const { id } = use(params);

  const event = events.find((event) => event.id === id);

  const handleInscribirClick = () => {
    setInscripcionEnabled(true);
    setActiveTab("inscripcion");
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
            backgroundImage: `url(${event.smallImage})`,
            filter: "brightness(0.6)",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center space-x-2 mb-2">
              <CalendarIcon className="w-5 h-5" />
              <span className="text-sm font-medium">{event.eventType}</span>
            </div>
            <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
            <div className="flex items-center space-x-2">
              <PlaceIcon className="w-5 h-5" />
              <span>{event.location.province}, {event.location.department}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-white/80 rounded-xl shadow-sm mb-8">
          <div className="flex border-b">
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === "informacion"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("informacion")}
            >
              Información
            </button>
            <button
              className={`flex-1 px-6 py-4 text-center font-medium transition-colors
                ${activeTab === "inscripcion"
                  ? "text-red-600 border-b-2 border-red-600"
                  : "text-gray-500 hover:text-gray-700"}
                ${!inscripcionEnabled ? "opacity-50 cursor-not-allowed" : ""}`}
              onClick={() => inscripcionEnabled && setActiveTab("inscripcion")}
              disabled={!inscripcionEnabled}
            >
              Inscripción
            </button>
          </div>

          <div className="p-6">
            {activeTab === "informacion" ? (
              <EventoInformacion 
                event={event} 
                openModal={() => setIsModalOpen(true)} 
                onInscribir={handleInscribirClick}
              />
            ) : (
              user ? (
                <EventoInscripcion />
              ) : (
                <div className="flex flex-col items-center py-12 text-gray-500">
                  <ProfileIcon className="w-12 h-12 mb-4" />
                  <p className="text-lg">Debes iniciar sesión para inscribirte.</p>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6">
              <h2 className="text-xl font-semibold">
                Ubicación: {event.name}
              </h2>
              <div className="rounded-lg overflow-hidden">
                <Map event={event}/>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="mt-6 w-full bg-gradient-to-r from-red-600 to-red-500 text-white py-3 px-4 rounded-lg hover:from-red-500 hover:to-red-400 transition-all duration-300 font-medium"
              >
                Cerrar mapa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventoDetalle;