import React from "react";
import { Search, Filter, ListRestart, XCircle } from "lucide-react";

export interface ParticipantFilterOptions {
  levels: string[];
  categories: string[];
  academies: string[];
  statuses: string[];
  phases: string[];
}

interface ParticipantsSearchAndFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onClearSearch: () => void;
  onOpenFilters: () => void;
  activeFilters: ParticipantFilterOptions;
  onClearAllFilters: () => void;
  totalResults: number;
}

const ParticipantsSearchAndFilters: React.FC<ParticipantsSearchAndFiltersProps> = ({
  searchTerm,
  onSearchChange,
  onClearSearch,
  onOpenFilters,
  activeFilters,
  onClearAllFilters,
  totalResults,
}) => {
  const totalActiveFilters = activeFilters.levels.length + activeFilters.categories.length + 
    activeFilters.academies.length + activeFilters.statuses.length + activeFilters.phases.length;

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6">
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            placeholder="Buscar por código, DNI o nombre..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
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

      {/* Filtros activos */}
      {totalActiveFilters > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-700">Filtros Activos:</h3>
            <span className="text-xs text-gray-500">{totalActiveFilters} filtro{totalActiveFilters !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {activeFilters.levels.map(level => (
              <span key={level} className="inline-flex items-center bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                🏆 {level}
              </span>
            ))}
            {activeFilters.categories.map(category => (
              <span key={category} className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                👥 {category}
              </span>
            ))}
            {activeFilters.academies.map(academy => (
              <span key={academy} className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                🏫 {academy}
              </span>
            ))}
            {activeFilters.statuses.map(status => (
              <span key={status} className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                📊 {status}
              </span>
            ))}
            {activeFilters.phases.map(phase => (
              <span key={phase} className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                🎯 {phase}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Resultados de búsqueda */}
      {searchTerm && (
        <div className="mt-3 text-sm text-gray-600">
          {totalResults === 0 ? (
            <span className="text-red-600">No se encontraron resultados para "{searchTerm}"</span>
          ) : (
            <span>
              Se encontraron <span className="font-semibold">{totalResults}</span> participante{totalResults !== 1 ? 's' : ''} 
              {searchTerm && ` para "${searchTerm}"`}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ParticipantsSearchAndFilters;