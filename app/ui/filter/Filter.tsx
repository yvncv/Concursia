import { Event } from "@/app/types/eventType";
import { useState } from "react";

export interface FiltersProps {
    events: Event[];
    onFilterChange: (filters: FilterState) => void;
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

    // Obtener valores únicos para los filtros
    const categories = Array.from(
        new Set(events.flatMap((event) => event.settings.categories))
    );

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
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    return (
        <div className="w-full flex flex-wrap gap-4 mb-6">
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
