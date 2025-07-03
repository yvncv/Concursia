import React from "react";
import { Search, Filter, ListRestart, XCircle } from "lucide-react";
import { FilterOptions } from "./modals/FilterModal";

interface TicketsSearchAndFiltersProps {
  dniInput: string;
  onDniInputChange: (value: string) => void;
  onSearch: (dni: string) => void;
  onClearSearch: () => void;
  onOpenFilters: () => void;
  activeFilters: FilterOptions;
  onClearAllFilters: () => void;
}

const TicketsSearchAndFilters: React.FC<TicketsSearchAndFiltersProps> = ({
  dniInput,
  onDniInputChange,
  onSearch,
  onClearSearch,
  onOpenFilters,
  activeFilters,
  onClearAllFilters,
}) => {
  const totalActiveFilters = activeFilters.modalities.length + activeFilters.categories.length + activeFilters.academies.length;

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearch(dniInput);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por DNI..."
            value={dniInput}
            onChange={(e) => onDniInputChange(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        </div>

        <button
          onClick={onClearSearch}
          className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Limpiar búsqueda"
        >
          <ListRestart className="w-5 h-5" />
        </button>

        <button
          onClick={onOpenFilters}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 relative"
        >
          <Filter className="w-5 h-5" />
          Filtrar
          {totalActiveFilters > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
              {totalActiveFilters}
            </span>
          )}
        </button>

        {totalActiveFilters > 0 && (
          <button
            onClick={onClearAllFilters}
            className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center gap-2"
            title="Limpiar todos los filtros"
          >
            <XCircle className="w-5 h-5" />
            Limpiar ({totalActiveFilters})
          </button>
        )}
      </div>
    </div>
  );
};

export default TicketsSearchAndFilters;