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
  const openModal = (evento: Evento) => {
    setEvento(evento);
    setIsModalOpen(true);
  };


  // Función para cerrar el modal
  const closeModal = () => setIsModalOpen(false);

  // Función para manejar el clic afuera del modal para cerrarlo
  const handleOutsideClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).id === 'modal-overlay') {
      closeModal();
    }
  };

  // Formato de la fecha (ejemplo: Domingo, 5 de Enero)
  const formattedDate = new Date(evento.fecha.seconds * 1000).toLocaleDateString("es-PE", {
    weekday: "long", // Día de la semana
    day: "numeric",  // Día del mes
    month: "long",   // Mes en formato largo
  });

  // Función para capitalizar la primera letra de cada palabra
  const capitalize = (text: string) => {
    return text.replace(/\b\w/g, char => char.toUpperCase());
  };

  // Aplicar la capitalización a la fecha
  const capitalizedFormattedDate = capitalize(formattedDate);

  // Formato de la hora (ejemplo: 10:00 am)
  const formattedTime = new Date(evento.fecha.seconds * 1000).toLocaleTimeString("es-PE", {
    hour: "2-digit", minute: "2-digit", hour12: true,
  });

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
            <div className="flex flex-col lg:flex-row space-x-6 text-2xl">
              {/* Información del evento (mitad del espacio en pantallas grandes) */}
              <div className="lg:w-1/2 flex flex-col space-y-4 mx-auto">
                <p className="">{evento.descripcion}</p>
                <div className="space-y-2 flex flex-col">
                  <div className="flex mt-4 items-center space-x-2 text-gray-600">
                    <CalendarIcon className="text-red-600 w-5 h-5" />
                    <span>
                      <strong>Fecha:</strong> {capitalizedFormattedDate}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <PlaceIcon className="text-blue-600 w-5 h-5" />
                    {
                      evento.ubicacion ? (
                        <>
                          <span><strong>Lugar:</strong> {evento.lugar}.</span>
                          <span onClick={() => openModal(evento)} className="text-red-500 cursor-pointer">
                            <strong>Click aquí para ver el mapa.</strong>
                          </span>
                        </>
                      ) : ('')
                    }
                  </div>
                  <div className="flex items-center space-x-2 text-gray-600">
                    <ClockIcon className="text-green-600 w-5 h-5" />
                    <span><strong>Hora:</strong> {formattedTime}</span>
                  </div>
                  <div className="mt-4 text-gray-600">
                    <strong>Tipo de Evento:</strong> {evento.tipoEvento}.
                  </div>
                </div>
              </div>

              <div className="relative lg:w-1/2 mt-6 lg:mt-0 sm:start-0 mb-6 overflow-hidden border border-red-500">
                {/* Imagen desenfocada para los costados */}
                <div className="absolute inset-0 -z-10">
                  {evento.imagen && (
                    <Image
                      src={evento.imagen}
                      className="w-full h-full object-cover blur-sm scale-150"
                      alt={`Blur background of ${evento.nombre}`}
                      width={900}
                      height={200}
                    />
                  )}
                </div>
                {/* Imagen principal */}
                {evento.imagen && (
                  <Image
                    src={evento.imagen}
                    className="w-full h-full object-contain"
                    alt={evento.nombre}
                    width={900}
                    height={200}
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
      </div >

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
            <h2 className="text-xl mb-4">Ubicación del Evento {evento?.nombre}</h2>
            <div className="w-full">
              {/* Pasar el evento completo al mapa */}
              <Map evento={evento} />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EventoDetalle;
