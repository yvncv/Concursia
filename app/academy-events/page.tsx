'use client';
import { useState } from "react";
import useUser from "../firebase/functions";
import useEvents from "../hooks/useEvents";
import EventComponent from "../ui/event/eventComponent";
import CarruselEvento from "../ui/carrousel/carrousel";
import { deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase/config";
import Link from "next/link";
import useAcademia from "../hooks/useAcademia"; // Importamos el hook

export default function MisEventos() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;

  // Usamos el hook useAcademia en lugar del useEffect
  const { academia, loadingAcademia, errorAcademia } = useAcademia();

  const loadingMessage =
    loadingUser ? "Obteniendo usuario..." : loadingEvent ? "Cargando eventos..." : null;

  if (loadingMessage || loadingAcademia) {
    return <div className="text-center text-gray-600">{loadingMessage || "Cargando academia..."}</div>;
  }

  if (errorAcademia) {
    return <div className="text-center text-rojo">{errorAcademia}</div>;
  }

  const filteredEvents = events.filter(
    (event) => event.academyId === user?.academyId
  );

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredEvents.length / eventsPerPage); i++) {
    pageNumbers.push(i);
  }

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
    <main className="flex flex-col items-center min-h-screen text-center">
      <CarruselEvento
        imagenes={filteredEvents.map((event) => event.smallImage)}
        ids={filteredEvents.map((event) => event.id)}
      />

      <h1 className="text-2xl mb-4 text-left mt-6 text-rojo font-semibold">
        SALUDOS{user?.firstName ? `, ${user.firstName.toUpperCase()}` : ""}. ESTOS SON LOS EVENTOS DE LA ACADEMIA {(academia?.name || "Cargando academia...").toUpperCase()}.
      </h1>

      <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
        <div className="w-full flex justify-center mb-4">
          <Link
            href="/academy-events/create-event"
            className="bg-green-600 w-4/5 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-all"
          >
            Agregar Evento
          </Link>
        </div>

        {filteredEvents.length > 0 ? (
          <div className="w-[90%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
            {currentEvents.map((event) => (
              <div key={event.id} className="relative">
                <EventComponent key={event.id} event={event} />
                <div className="absolute top-0 right-0 m-2 bg-white rounded-full flex">
                  <Link
                    href={`/academy-events/update-event/${event.id}`}
                    className="pr-2 text-yellow-600 px-3 py-1 rounded-l-full w-full hover:bg-yellow-500 hover:text-white transition-all"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-rojo px-3 py-1 rounded-r-full w-full hover:bg-rojo hover:text-white transition-all"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No hay eventos registrados para tu academia.</p>
        )}
      </div>

      {filteredEvents.length > eventsPerPage && (
        <div className="flex justify-center items-center m-6">
          {pageNumbers.map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded-3xl mx-2 ${currentPage === number
                ? "bg-rojo text-white"
                : "bg-gray-300 text-gray-700"
                } hover:bg-red-500 transition-all`}
            >
              {number}
            </button>
          ))}
        </div>
      )}
    </main>
  );
}
