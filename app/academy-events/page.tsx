'use client';
import { useState, useEffect } from "react";
import useUser from "../firebase/functions";
import useEvents from "../hooks/useEvents";
import EventComponent from "../ui/event/eventComponent";
import CarruselEvento from "../ui/carrousel/carrousel";
import { deleteDoc, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import Link from "next/link";
import { Academy } from "../types/academyType";
import { Timestamp } from "firebase/firestore";

export default function MisEventos() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 12;
  const [academia, setAcademia] = useState<Academy | null>(null);

  useEffect(() => {
    const fetchAcademia = async () => {
      if (user && user.academyId) {
        const academiaRef = doc(db, "academias", user.academyId);
        const docSnap = await getDoc(academiaRef);

        if (docSnap.exists()) {
          const data = docSnap.data();

          // Verificar si todos los campos requeridos están presentes
          if (
            data &&
            data.name &&
            data.id &&
            data.organizerId &&
            data.email &&
            data.phoneNumber &&
            data.location &&
            data.location.coordinates &&
            data.location.street &&
            data.location.district &&
            data.location.province &&
            data.location.department &&
            data.location.placeName
          ) {
            const academiaData: Academy = {
              id: data.id,
              organizerId: data.organizerId,
              name: data.name,
              email: data.email,
              phoneNumber: data.phoneNumber,
              location: {
                street: data.location.street,
                district: data.location.district,
                province: data.location.province,
                department: data.location.department,
                placeName: data.location.placeName,
                coordinates: {
                  latitude: data.location.coordinates.latitude,
                  longitude: data.location.coordinates.longitude,
                },
              },
              createdAt: data.createdAt
                ? data.createdAt
                : Timestamp.fromDate(new Date()),
              updatedAt: data.updatedAt
                ? data.updatedAt
                : Timestamp.fromDate(new Date()),
            };
            setAcademia(academiaData);
          } else {
            console.error("Datos incompletos de la academia.");
          }
        } else {
          console.error("No se encontró la academia.");
        }
      }
    };

    fetchAcademia();
  }, [user]);

  const loadingMessage =
    loadingUser ? "Obteniendo usuario..." : loadingEvent ? "Cargando eventos..." : null;

  if (loadingMessage) {
    return <div className="text-center text-gray-600">{loadingMessage}</div>;
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
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-500 transition-all"
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
                    className="pr-2 text-blue-500 px-3 py-1 rounded-l-full w-full hover:bg-blue-100 transition-all"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => deleteEvent(event.id)}
                    className="text-red-500 px-3 py-1 rounded-r-full w-full hover:bg-red-100 transition-all"
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
