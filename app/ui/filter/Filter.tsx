import { Event } from "@/app/types/eventType";
import { useState, useEffect } from "react";

export interface FiltersProps {
  events: Event[];
  onFilterChange: (filteredEvents: Event[]) => void;
}

export interface FilterState {
  category: string;
  department: string;
  dateRange: {
    start: string;
    end: string;
  };
}

export default function Filters({ events, onFilterChange }: FiltersProps) {
  const [filters, setFilters] = useState<FilterState>({
    category: "",
    department: "",
    dateRange: {
      start: "",
      end: "",
    },
  });

  const [searchTerm, setSearchTerm] = useState("");

  // Obtener valores únicos para los selectores
  const categories = Array.from(
    new Set(events.flatMap((event) => event.settings.categories))
  );

  const departments = Array.from(
    new Set(events.map((event) => event.location.department))
  );

  // Filtrar los eventos
  useEffect(() => {
    const filteredEvents = events.filter((event) => {
      const matchesSearch =
        event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory =
        !filters.category ||
        event.settings.categories.includes(filters.category);

      const matchesDepartment =
        !filters.department ||
        event.location.department === filters.department;

      const eventStartDate = event.startDate.toDate();
      const eventEndDate = event.startDate.toDate();
      const startDateFilter = filters.dateRange.start
        ? new Date(filters.dateRange.start)
        : null;
      const endDateFilter = filters.dateRange.end
        ? new Date(filters.dateRange.end)
        : null;

      const matchesDate =
        (!startDateFilter || eventStartDate >= startDateFilter) &&
        (!endDateFilter || eventEndDate <= endDateFilter);

      return matchesSearch && matchesCategory && matchesDepartment && matchesDate;
    });

    onFilterChange(filteredEvents);
  }, [filters, searchTerm, events, onFilterChange]);

  // Manejar cambios en los filtros
  const handleFilterChange = (
    key: keyof FilterState,
    value: string | { start: string; end: string }
  ) => {
    setFilters({
      ...filters,
      [key]: value,
    });
  };

  return (
    <div className="w-full flex flex-wrap gap-4 mb-6">
      <input
        type="text"
        placeholder="Buscar eventos..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
      />

      <select
        value={filters.category}
        onChange={(e) => handleFilterChange("category", e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
      >
        <option value="">Todas las categorías</option>
        {categories.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>

      <select
        value={filters.department}
        onChange={(e) => handleFilterChange("department", e.target.value)}
        className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
      >
        <option value="">Todos los departamentos</option>
        {departments.map((department) => (
          <option key={department} value={department}>
            {department}
          </option>
        ))}
      </select>

      <div className="flex gap-2 items-center flex-col md:flex-row justify-start">
        <span>Desde:</span>
        <input
          type="date"
          value={filters.dateRange.start}
          onChange={(e) =>
            handleFilterChange("dateRange", {
              ...filters.dateRange,
              start: e.target.value,
            })
          }
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
        />
        <span>Hasta:</span>
        <input
          type="date"
          value={filters.dateRange.end}
          onChange={(e) =>
            handleFilterChange("dateRange", {
              ...filters.dateRange,
              end: e.target.value,
            })
          }
          className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
        />
      </div>
    </div>
  );
}
