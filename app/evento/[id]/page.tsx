"use client"
import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import { Evento } from "../../ui/evento/eventoType"; // Ajusta la importación según la ubicación de tu tipo de datos
import { use } from 'react';

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const [evento, setEvento] = useState<Evento | undefined>(undefined);
  const { id } = use(params); // Desenvuelve el id de los parámetros
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion">("informacion");

  useEffect(() => {
    if (id) {
      const fetchEvento = async () => {
        const eventoDoc = await getDoc(doc(db, "eventos", id));
        if (eventoDoc.exists()) {
          const eventoData = eventoDoc.data() as Evento;
          setEvento(eventoData);
        }
      };
      fetchEvento();
    }
  }, [id]);

  if (!evento) {
    return <p>Cargando...</p>;
  }

  // Estado para manejar qué pestaña está activa

  const handleTabClick = (tab: "informacion" | "inscripcion") => {
    setActiveTab(tab);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-foreground shadow-lg rounded-lg">
      <h1 className="text-4xl font-serif text-center text-background">{evento.nombre}</h1>

      {/* Contenedor de tabs */}
      <div className="flex justify-center space-x-4 mb-6">
        <button
          className={`px-6 py-2 text-lg font-medium rounded-tl-lg ${
            activeTab === "informacion" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabClick("informacion")}
        >
          Información
        </button>
        <button
          className={`px-6 py-2 text-lg font-medium rounded-tr-lg ${
            activeTab === "inscripcion" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabClick("inscripcion")}
        >
          Inscripción
        </button>
      </div>

      {/* Pestaña de Información */}
      {activeTab === "informacion" && (
        <div className="mt-6">
          <p className="text-lg mt-4 text-background">{evento.descripcion}</p>
          <div className="mt-6">
            <p className="text-md text-background">
              <strong>Fecha:</strong> {new Date(evento.fecha.seconds * 1000).toLocaleString()}
            </p>
            <p className="text-md text-background">
              <strong>Lugar:</strong> {evento.lugar}
            </p>
            <p className="text-md text-background">
              <strong>Tipo de Evento:</strong> {evento.tipoEvento}
            </p>
          </div>
          {evento.imagen && (
            <div className="mt-6">
              <Image
                src={evento.imagen}
                alt={evento.nombre}
                width={800}
                height={400}
                className="w-full h-auto rounded-lg shadow-md"
              />
            </div>
          )}
        </div>
      )}

      {/* Pestaña de Inscripción */}
      {activeTab === "inscripcion" && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold text-center">Inscríbete al evento</h2>
          <form className="mt-4">
            <div className="mb-4">
              <label htmlFor="nombre" className="block text-md text-background">Nombre</label>
              <input
                id="nombre"
                type="text"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Escribe tu nombre"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="email" className="block text-md text-background">Correo electrónico</label>
              <input
                id="email"
                type="email"
                className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                placeholder="Escribe tu correo"
              />
            </div>
            <div className="text-center">
              <button
                type="submit"
                className="px-6 py-3 mt-4 text-foreground bg-blue-600 rounded-full text-lg hover:bg-blue-700 transition duration-300"
              >
                Inscribirse
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default EventoDetalle;
