'use client';

import { useState } from "react";
import useUser from "./firebase/functions";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import Pagination from "./ui/pagination/Pagination";
import Filters from "./ui/filter/Filter";

const EVENTS_PER_PAGE = 12;

export default function Home() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState(events);
  const [currentPage, setCurrentPage] = useState(1);

  // Loading states
  const loadingMessage = loadingUser 
    ? "Obteniendo usuario..." 
    : loadingEvent 
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

  // Pagination logic
  const indexOfLastEvent = currentPage * EVENTS_PER_PAGE;
  const indexOfFirstEvent = indexOfLastEvent - EVENTS_PER_PAGE;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  return (
    <main className="min-h-screen">
      {/* Hero Carousel */}
      <section className="w-full max-w-[1920px] mx-auto relative">
        <CarruselEvento
          imagenes={events.map((event) => event.smallImage)}
          ids={events.map((event) => event.id)}
        />
      </section>

      {/* Main Content */}
      <section className="w-full max-w-[1400px] mx-auto px-4 md:px-8 py-12 space-y-8">
        {/* Welcome Card */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 md:p-8 shadow-lg">
          <h1 className="text-2xl md:text-3xl font-bold text-red-600 mb-6">
            {user?.firstName 
              ? `¡Bienvenido, ${user.firstName}!`
              : "¡Bienvenido a Tusuy Perú!"
            }
          </h1>
          
          <Filters 
            events={events} 
            onFilterChange={setFilteredEvents} 
          />
        </div>

        {/* Events Grid */}
        <div className="space-y-8">
          {currentEvents.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {currentEvents.map((event) => (
                <div 
                  key={event.id} 
                  className="
                    transform 
                    transition-all 
                    duration-300 
                    hover:scale-[1.02]
                  "
                >
                  <EventComponent event={event} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-8 shadow-lg text-center">
              <p className="text-gray-600 text-lg">
                No se encontraron eventos que coincidan con tu búsqueda.
              </p>
            </div>
          )}

          {/* Pagination */}
          {filteredEvents.length > 0 && (
            <div className="flex justify-center py-4">
              <Pagination
                totalItems={filteredEvents.length}
                itemsPerPage={EVENTS_PER_PAGE}
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