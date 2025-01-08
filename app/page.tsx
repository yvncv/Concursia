'use client';

import useUser from "./firebase/functions";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import Pagination from "./ui/pagination/Pagination";
import Filters from "./ui/filter/Filter";
import { useState } from "react";
import { FilterState } from "./ui/filter/Filter";

export default function Home() {
  const { user, loadingUser } = useUser();
  const { events, loadingEvent } = useEvents();
  const eventsPerPage = 12;
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    category: '',
    department: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  const loadingMessage =
    loadingUser ? "Obteniendo usuario..."
      : loadingEvent ? "Cargando eventos..."
        : null;

  if (loadingMessage) {
    return <div className="text-center text-gray-600">{loadingMessage}</div>;
  }

  const filteredEvents = events.filter((event) => {
    const matchesSearch =
      event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase());
  
    const matchesCategory =
      !activeFilters.category ||
      event.settings.categories.includes(activeFilters.category);
  
    const matchesDepartment =
      !activeFilters.department || event.location.department === activeFilters.department;
  
    const eventStartDate = event.startDate.toDate(); // Asegúrate de que `event.startDate` sea válido
    const eventEndDate = event.startDate.toDate(); // Asegúrate de que `event.endDate` sea válido
    const startDateFilter = activeFilters.dateRange.start
      ? new Date(activeFilters.dateRange.start)
      : null;
    const endDateFilter = activeFilters.dateRange.end
      ? new Date(activeFilters.dateRange.end)
      : null;
  
    const matchesDate =
      (!startDateFilter || eventStartDate >= startDateFilter) &&
      (!endDateFilter || eventEndDate <= endDateFilter);
  
    return matchesSearch && matchesCategory && matchesDepartment && matchesDate;
  });

  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = filteredEvents.slice(indexOfFirstEvent, indexOfLastEvent);

  const handleFilterChange = (filters: FilterState) => {
    setActiveFilters(filters);
    setCurrentPage(1);
  };

  return (
    <main className="flex flex-col items-center min-h-screen text-center">
      <CarruselEvento
        imagenes={events.map((event) => event.smallImage)}
        ids={events.map((event) => event.id)}
      />

      <h1 className="text-2xl mb-4 text-left mt-6 text-rojo font-semibold">
        SALUDOS
        {user?.firstName ? `, ${user.firstName.toUpperCase()}` : ""}.
        ESTOS SON LOS EVENTOS DISPONIBLES.
      </h1>

      <div className="w-[90%] max-w-[1400px]">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Buscar eventos..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
          />
        </div>

        <Filters 
          events={events}
          onFilterChange={handleFilterChange}
        />
      </div>

      <div className="w-full flex flex-col items-center justify-start max-w-[1400px]">
        {currentEvents.length === 0 ? (
          <div className="text-gray-600 py-8">
            No se encontraron eventos que coincidan con tu búsqueda.
          </div>
        ) : (
          <div className="w-[90%] grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 min-h-[400px]">
            {currentEvents.map((event) => (
              <EventComponent key={event.id} event={event} />
            ))}
          </div>
        )}
      </div>

      <Pagination
        currentPage={currentPage}
        totalItems={filteredEvents.length}
        itemsPerPage={eventsPerPage}
        onPageChange={setCurrentPage}
      />
    </main>
  );
}