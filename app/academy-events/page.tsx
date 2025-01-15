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
      await deleteDoc(doc(db, "eventos", eventId));
      alert("Evento eliminado");
    } catch (err) {
      console.error("Error eliminando el evento: ", err);
      alert("Hubo un error al eliminar el evento");
    }
  };

  return (
    <main className="min-h-screen">
      {/* Hero Carousel */}
      <section className="w-full max-w-[1920px] mx-auto relative">
        <CarruselEvento
          imagenes={filteredEvents.map((event) => event.smallImage)}
          ids={filteredEvents.map((event) => event.id)}
        />
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Welcome Message */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg text-center">
          <h1 className="text-2xl text-red-600">
            Saludos, {user?.firstName}. Estos son los eventos de{" "}
            {academia?.name || "Cargando academia"}.
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
                      onClick={() => deleteEvent(event.id)}
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
    </main>
  );
}
