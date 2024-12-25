'use client';

import { useEffect, useState } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc } from "firebase/firestore";
import Image from "next/image";
import dynamic from "next/dynamic"; // Para cargar dinámicamente el mapa
import { Evento } from "../../ui/evento/eventoType";
import { use } from "react";
import useUser from "@/app/firebase/functions";
import CalendarIcon from "@/app/ui/icons/calendar"; // Import CalendarIcon
import ClockIcon from "@/app/ui/icons/clock";       // Import ClockIcon
import PlaceIcon from "@/app/ui/icons/place";       // Import PlaceIcon

// Carga dinámica del mapa para evitar problemas en el renderizado del lado del cliente
const Map = dynamic(() => import("@/app/ui/map/mapa"), { ssr: false });

const EventoDetalle = ({ params }: { params: Promise<{ id: string }> }) => {
  const { user } = useUser();
  const { id } = use(params);
  const [evento, setEvento] = useState<Evento | undefined>(undefined);
  const [activeTab, setActiveTab] = useState<"informacion" | "inscripcion">("informacion");

  // Estado para controlar la visibilidad del modal
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

  const handleTabClick = (tab: "informacion" | "inscripcion") => {
    setActiveTab(tab);
  };

  // Función para abrir el modal
  const openModal = () => setIsModalOpen(true);

  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  // Función para manejar el clic afuera del modal para cerrarlo
  const handleOutsideClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'modal-overlay') {
      closeModal();
    }
  };

  return (
    <>
      {/* Contenedor de la imagen con filtro aplicado solo al fondo */}
      <div className="relative w-full h-64 bg-cover bg-center">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url(${evento.imagen})`,
            filter: "brightness(0.5) sepia(1) saturate(2) hue-rotate(-50deg)", // Filtro oscurecido
          }}
        ></div>

        {/* Título del evento sin filtro */}
        <h1 className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-2xl font-bold text-white text-center">
          {evento.nombre.toUpperCase()}
        </h1>
      </div>

      <div className="max-w-screen-2xl pt-0 mt-0 mx-auto p-6 m-6 rounded-lg relative">
        {/* Contenedor de las pestañas */}
        <div className="text-xl flex justify-center mt-6">
          <button
            className={`px-6 py-2 rounded-tl-lg w-full ${activeTab === "informacion" ? "border-b border-red-600 text-red-600" : ""}`}
            onClick={() => handleTabClick("informacion")}
          >
            Información
          </button>
          <button
            className={`px-6 py-2 rounded-tr-lg w-full ${activeTab === "inscripcion" ? "border-b border-red-600 text-red-600" : ""}`}
            onClick={() => handleTabClick("inscripcion")}
          >
            Inscripción
          </button>
        </div>

        {/* Contenido de las pestañas */}
        {activeTab === "informacion" && (
          <div className="mt-6">
            {/* Contenedor principal con Flexbox */}
            <div className="flex flex-col lg:flex-row space-x-6">
              {/* Información del evento (mitad del espacio en pantallas grandes) */}
              <div className="lg:w-1/2 flex flex-col space-y-4 mx-auto">
                <p className="text-lg">{evento.descripcion}</p>
                <div className="space-y-2 flex flex-col">
                  <div className="flex mt-4 items-center space-x-2 text-gray-600">
                    <CalendarIcon />
                    <span>
                      <strong>Fecha:</strong> {new Date(evento.fecha.seconds * 1000).toLocaleString("es-PE", { timeZone: "America/Lima" })}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <PlaceIcon />
                    <strong>Lugar:</strong> {evento.lugar}.
                    {
                      evento.ubicacion ? (
                        <span onClick={openModal} className="text-red-500 cursor-pointer">
                          <strong>Click aquí para ver el mapa.</strong>
                        </span>
                      ) : ('')
                    }
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ClockIcon />
                    <span><strong>Hora:</strong> {new Date(evento.fecha.seconds * 1000).toLocaleTimeString("es-PE", { timeZone: "America/Lima" })}</span>
                  </div>
                  <div className="mt-4">
                    <strong>Tipo de Evento:</strong> {evento.tipoEvento}.
                  </div>
                </div>
              </div>

              {/* Imagen del evento */}
              <div className="lg:w-1/2 mt-6 lg:mt-0 sm:start-0 mb-6">
                {evento.imagen && (
                  <Image
                    src={evento.imagen}
                    alt={evento.nombre}
                    width={800}
                    height={800}
                    className="lazy w-full h-auto rounded-lg shadow-md border-2 border-red-500"
                  />
                )}
              </div>
            </div>
          </div>
        )}

        {/* Sección de inscripción */}
        {user ? (
          activeTab === "inscripcion" && (
            <div className="mt-6">
              <h2 className="text-center text-xl font-semibold">Inscríbete al evento</h2>
              <form className="mt-4">
                <div className="mb-4">
                  <label htmlFor="nombre" className="block font-medium">Nombre</label>
                  <input
                    id="nombre"
                    type="text"
                    className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
                    placeholder="Escribe tu nombre"
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="email" className="block font-medium">Correo electrónico</label>
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
                    className="px-6 py-3 mt-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300"
                  >
                    Inscribirse
                  </button>
                </div>
              </form>
            </div>
          )
        ) : (
          <div className="mt-6">
            <h2 className="text-center text-lg">Debes iniciar sesión para inscribirte al evento</h2>
          </div>
        )}
      </div>

      {/* Modal para mostrar el mapa */}
      {isModalOpen && (
        <div
          id="modal-overlay"
          className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50"
          onClick={handleOutsideClick}
        >
          <div className="bg-white p-6 rounded-lg w-full sm:w-3/4 lg:w-1/2 max-w-4xl relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-600 font-bold">
              X
            </button>
            <h2 className="text-xl mb-4">Ubicación del Evento</h2>
            <div className="w-full">
              <Map eventId={evento.id} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventoDetalle;
