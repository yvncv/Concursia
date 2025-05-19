import { CustomEvent } from "@/app/types/eventType";
import { useState } from "react";

export interface FiltersProps {
    events: CustomEvent[];
    onFilterChange: (filters: FilterState) => void;
}

export interface FilterState {
    category: string;
    level: string;
    department: string;
    dateRange: {
        start: string;
        end: string;
    };
}

export default function Filters({ events, onFilterChange }: FiltersProps) {
    const [filters, setFilters] = useState<FilterState>({
        category: "",
        level: "",
        department: "",
        dateRange: {
            start: "",
            end: "",
        },
    });

    // Obtener todas las modalidades (levels) disponibles en los eventos
    const levels = Array.from(
        new Set(
            events.flatMap((event) => 
                Object.keys(event.dance.levels)
            )
        )
    );

    // Obtener todas las categorías disponibles en todos los levels
    const categories = Array.from(
        new Set(
            events.flatMap((event) => 
                Object.entries(event.dance.levels)
                    .flatMap(([_, levelData]) => levelData.categories || [])
            )
        )
    );

    // Si hay un level seleccionado, filtramos las categorías por ese level
    const filteredCategories = filters.level 
        ? Array.from(
            new Set(
                events.flatMap((event) => 
                    event.dance.levels[filters.level]?.categories || []
                )
            )
        )
        : categories;

    const departments = Array.from(
        new Set(events.map((event) => event.location.department))
    );

    const handleFilterChange = (
        key: keyof FilterState,
        value: string | { start: string; end: string }
    ) => {
        const newFilters = {
            ...filters,
            [key]: value,
        };
        
        // Si cambiamos de level, resetear el filtro de categoría
        if (key === 'level') {
            newFilters.category = '';
        }
        
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="w-full flex flex-wrap gap-4 mb-6">
            {/* Filtro por Modalidad (Level) */}
            <select
                value={filters.level}
                onChange={(e) => handleFilterChange("level", e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
            >
                <option value="">Todas las modalidades</option>
                {levels.map((level) => (
                    <option key={level} value={level}>
                        {level}
                    </option>
                ))}
            </select>

            {/* Filtro por Categoría */}
            <select
                value={filters.category}
                onChange={(e) => handleFilterChange("category", e.target.value)}
                className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 border-gray-300"
            >
                <option value="">Todas las categorías</option>
                {filteredCategories.map((category) => (
                    <option key={category} value={category}>
                        {category}
                    </option>
                ))}
            </select>

            {/* Filtro por Departamento */}
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

            {/* Filtro por Rango de Fechas */}
            <div className="flex gap-2 items-center flex-wrap">
                <span>desde: </span>
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
                <span>hasta: </span>
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