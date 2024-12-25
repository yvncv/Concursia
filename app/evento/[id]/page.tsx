"use client"
import React, { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { Evento } from "../../ui/evento/eventoType";
import Tabs from "./tabs";
import InformacionEvento from "./informacion-evento";
import PagoEvento from "./inscripcion-evento";
import dynamic from "next/dynamic";
import { use } from "react";

// Carga dinámica del mapa
const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const [evento, setEvento] = useState<Evento | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion">("informacion");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchEvento = async () => {
        const eventoDoc = await getDoc(doc(db, "eventos", id));
        if (eventoDoc.exists()) {
          const eventoData = eventoDoc.data() as Evento;
          setEvento(eventoData);
        } else {
          console.error("Evento no encontrado");
        }
      };
      fetchEvento();
    }
  }, [id]);

  if (!evento) {
    return <p>Cargando...</p>;
  }

  const formattedDate = new Date(evento.fecha.seconds * 1000).toLocaleDateString("es-PE", {
    weekday: "long", day: "numeric", month: "long",
  });
  
  const formattedTime = new Date(evento.fecha.seconds * 1000).toLocaleTimeString("es-PE", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

  const capitalize = (text: string) => {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  };

  const openModal = (evento: Evento) => {
    setEvento(evento);
    setIsModalOpen(true);
  };

  const closeModal = () => setIsModalOpen(false);

  const handleTabClick = (tab: "informacion" | "inscripcion") => {
    setActiveTab(tab);
  };

  return (
    <>
      {/* Pestañas */}
      <Tabs activeTab={activeTab} onTabClick={handleTabClick} />

      {/* Información del evento */}
      {activeTab === "informacion" && (
        <InformacionEvento
          evento={evento}
          formattedDate={formattedDate}
          formattedTime={formattedTime}
          capitalize={capitalize}
          openModal={openModal}
        />
      )}

      {/* Inscripción al evento */}
      {activeTab === "inscripcion" && <PagoEvento />}
      
      {/* Modal para el mapa */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
          onClick={() => setIsModalOpen(false)}
        >
          <div className="bg-white p-6 rounded-lg w-full sm:w-3/4 lg:w-1/2 max-w-4xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-600 font-bold">
              X
            </button>
            <h2 className="text-xl mb-4">Ubicación del Evento {evento?.nombre}</h2>
            <Map evento={evento} />
          </div>
        </div>
      )}
    </>
  );
};

export default EventoDetalle;
