'use client';

import { useState } from "react";
import useUser from "../firebase/functions";
import useEvents from "../hooks/useEvents";
import useAcademia from "../hooks/useAcademia";
import EventComponent from "../ui/event/eventComponent";
import CarruselEvento from "../ui/carrousel/carrousel";
import Pagination from "../ui/pagination/Pagination";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import Link from "next/link";

export default function MisEventos() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvents } = useEvents();
  const { academia, loadingAcademia, errorAcademia } = useAcademia();

  const [showModal, setShowModal] = useState(false); // Estado para mostrar el modal
  const [eventToDelete, setEventToDelete] = useState<string | null>(null); // Evento que se va a eliminar
  const [eventName, setEventName] = useState<string>(''); // Nombre del evento a eliminar

  // Pagination
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const loadingMessage =
    loadingUser || loadingAcademia
      ? "Cargando datos..."
      : loadingEvents
        ? "Cargando eventos..."
        : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
            <span className="animate-pulse text-red-600 text-lg font-medium">
              {loadingMessage}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (errorAcademia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
          <p className="text-red-600 text-lg font-medium">{errorAcademia}</p>
        </div>
      </div>
    );
  }

  // Filter events by academy
  const filteredEvents = events.filter(
    (event) => event.academyId === user?.academyId
  );

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const deleteEvent = async (eventId: string) => {
    try {
      if (eventId && eventId === eventToDelete) {
        await deleteDoc(doc(db, "eventos", eventId));
        alert("Evento eliminado");
        setShowModal(false); // Cerrar el modal después de la eliminación
      }
    } catch (err) {
      console.error("Error eliminando el evento: ", err);
      alert("Hubo un error al eliminar el evento");
    }
  };

  return (
    <main className="min-h-screen" >
      {/* Hero Carousel */}
      <section className="w-full max-w-[1920px] mx-auto relative">
        <CarruselEvento
          events={filteredEvents}
        />
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Welcome Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg text-center">
          <h1 className="text-2xl text-red-600">
            Saludos, {user?.firstName}. Estos son los eventos de {academia?.name || "Cargando academia"}.
          </h1>
        </div>
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg text-center">
          <Link
            href="/academy-events/create-event"
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-all"
          >
            Agregar Evento
          </Link>
        </div>

        {/* Events Grid */}
        <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
          {currentEvents.length > 0 ? (
            <div className="w-[90%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
              {currentEvents.map((event) => (
                <div
                  key={event.id}
                  className="transform transition-all duration-300 hover:scale-[1.02]"
                >
                  <EventComponent event={event} />
                  <div className="absolute top-1 right-2 md:top-2 md:right-4 rounded-full flex w-10 md:w-auto">
                    <Link
                      href={`/academy-events/update-event/${event.id}`}
                      className="text-yellow-600 px-3 py-1 bg-white rounded-l-full hover:bg-yellow-500 hover:text-white transition-all"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        setEventToDelete(event.id); // Establecer el evento a eliminar
                        setEventName(event.name); // Establecer el nombre del evento a eliminar
                        setShowModal(true); // Mostrar el modal
                      }}
                      className="text-red-600 px-3 py-1 bg-white rounded-r-full hover:bg-red-500 hover:text-white transition-all"
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
              <p className="text-gray-600 text-lg">
                No hay eventos registrados para tu academia.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredEvents.length > 0 && (
            <div className="flex justify-center py-4">
              <Pagination
                totalItems={filteredEvents.length}
                itemsPerPage={eventsPerPage}
                currentPage={currentPage}
                onPageChange={setCurrentPage}
              />
            </div>
          )}
        </div>
      </section>

      {/* Modal de confirmación */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-10">
          <div className="bg-white backdrop-blur-xl p-6 rounded-2xl shadow-lg w-[90%] sm:w-[400px] max-w-lg">
            <h2 className="font-semibold text-center mb-4 text-gray-600 text-2xl">
              ¿Seguro que desea eliminar el evento: <span className="text-rojo underline underline-offset-2">{eventName}</span>?
            </h2>
            <div className="mb-4">
              <p className="text-center text-gray-600">Escriba el nombre exacto del evento para confirmar:</p>
              <input
                type="text"
                className="w-full p-3 placeholder:text-red-200 mt-2 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder={eventName}
              />
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 hover:bg-gray-400 transition-all rounded-full"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (eventName === eventToDelete) {
                    deleteEvent(eventToDelete!);
                  } else {
                    alert("El nombre del evento no coincide. No se puede eliminar.");
                  }
                }}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-500 transition-all rounded-full"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}
