'use client';

import { useState } from "react";
import useEvents from "@/app/ui/evento/useEvents";
import useUser from "@/app/firebase/functions";
import EventoInformacion from "./EventoInformacion";
import EventoInscripcion from "./EventoInscripcion";
import dynamic from "next/dynamic";
import { use } from "react";

// Carga dinámica del mapa
const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const { events, loadingEvent, error } = useEvents();
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion">("informacion");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { id } = use(params);

  // Filtrar el evento por ID
  const evento = events.find((event) => event.id === id);

  if (loadingEvent) return <p>Cargando...</p>;
  if (error) return <p>Error: {error}</p>;
  if (!evento) return <p>Evento no encontrado.</p>;

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      {/* Imagen principal */}
      <div className="relative w-full h-64 bg-cover bg-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${evento.imagen})`,
            filter: "brightness(0.5) sepia(1) saturate(2) hue-rotate(-50deg)",
          }}
        ></div>
        <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white text-center">
          {evento.nombre.toUpperCase()}
        </h1>
      </div>

      {/* Tabs de información e inscripción */}
      <div className="max-w-screen-2xl mx-auto p-6">
        <div className="flex justify-center mt-6">
          <button
            className={`px-6 py-2 ${activeTab === "informacion" ? "text-red-600 border-b border-red-600" : ""}`}
            onClick={() => setActiveTab("informacion")}
          >
            Información
          </button>
          <button
            className={`px-6 py-2 ${activeTab === "inscripcion" ? "text-red-600 border-b border-red-600" : ""}`}
            onClick={() => setActiveTab("inscripcion")}
          >
            Inscripción
          </button>
        </div>

        {activeTab === "informacion" && (
          <EventoInformacion evento={evento} openModal={openModal} />
        )}

        {activeTab === "inscripcion" && 
          (user ? (
          <EventoInscripcion />
        ) : (
          <p className="text-center mt-6">Debes iniciar sesión para inscribirte.</p>
        ))}

      </div>

      {/* Modal del mapa */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-black-600 bg-opacity-50 flex justify-center items-center z-50"
          onClick={closeModal}
        >
          <div className="bg-white p-6 rounded-lg w-full sm:w-3/4 lg:w-1/2 max-w-4xl relative">
            <h2 className="text-xl mb-4">Ubicación del evento: {evento?.nombre}</h2>
            <div className="w-full">
              {/* Pasar el evento completo al mapa */}
              <Map evento={evento} />
            </div>
            <button onClick={closeModal} className="w-full block mb-0 mt-4 text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all">
              Cerrar mapa
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default EventoDetalle;
