import React, { useState, useEffect } from "react";
import { X, Filter, Trash2, Check, Search } from "lucide-react";

export interface ParticipantFilterOptions {
  levels: string[];
  categories: string[];
  academies: string[];
  statuses: string[];
  phases: string[];
}

interface ParticipantFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filterOptions: ParticipantFilterOptions) => void;
  availableFilters: {
    levels: string[];
    categories: string[];
    academies: string[];
    statuses: string[];
    phases: string[];
  };
  currentFilters?: ParticipantFilterOptions;
}

const ParticipantFilterModal: React.FC<ParticipantFilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  availableFilters,
  currentFilters
}) => {
  const [selectedLevels, setSelectedLevels] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAcademies, setSelectedAcademies] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [selectedPhases, setSelectedPhases] = useState<string[]>([]);
  
  // Estados para búsqueda
  const [levelSearch, setLevelSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [academySearch, setAcademySearch] = useState("");

  // Inicializar con filtros actuales cuando el modal se abre
  useEffect(() => {
    if (isOpen && currentFilters) {
      setSelectedLevels(currentFilters.levels || []);
      setSelectedCategories(currentFilters.categories || []);
      setSelectedAcademies(currentFilters.academies || []);
      setSelectedStatuses(currentFilters.statuses || []);
      setSelectedPhases(currentFilters.phases || []);
      setLevelSearch("");
      setCategorySearch("");
      setAcademySearch("");
    }
  }, [isOpen, currentFilters]);

  const handleApplyFilters = () => {
    onApplyFilters({
      levels: selectedLevels,
      categories: selectedCategories,
      academies: selectedAcademies,
      statuses: selectedStatuses,
      phases: selectedPhases,
    });
    onClose();
  };

  const clearAllFilters = () => {
    setSelectedLevels([]);
    setSelectedCategories([]);
    setSelectedAcademies([]);
    setSelectedStatuses([]);
    setSelectedPhases([]);
  };

  const removeFilter = (type: 'level' | 'category' | 'academy' | 'status' | 'phase', value: string) => {
    switch (type) {
      case 'level':
        setSelectedLevels(prev => prev.filter(l => l !== value));
        break;
      case 'category':
        setSelectedCategories(prev => prev.filter(c => c !== value));
        break;
      case 'academy':
        setSelectedAcademies(prev => prev.filter(a => a !== value));
        break;
      case 'status':
        setSelectedStatuses(prev => prev.filter(s => s !== value));
        break;
      case 'phase':
        setSelectedPhases(prev => prev.filter(p => p !== value));
        break;
    }
  };

  const toggleLevel = (level: string) => {
    setSelectedLevels(prev => 
      prev.includes(level) ? prev.filter(l => l !== level) : [...prev, level]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]
    );
  };

  const toggleAcademy = (academy: string) => {
    setSelectedAcademies(prev => 
      prev.includes(academy) ? prev.filter(a => a !== academy) : [...prev, academy]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev => 
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const togglePhase = (phase: string) => {
    setSelectedPhases(prev => 
      prev.includes(phase) ? prev.filter(p => p !== phase) : [...prev, phase]
    );
  };

  // Filtrar opciones basado en búsqueda
  const filteredLevels = availableFilters.levels.filter(level =>
    level.toLowerCase().includes(levelSearch.toLowerCase())
  );

  const filteredCategories = availableFilters.categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredAcademies = availableFilters.academies.filter(academy =>
    academy.toLowerCase().includes(academySearch.toLowerCase())
  );

  // Contar total de filtros activos
  const totalActiveFilters = selectedLevels.length + selectedCategories.length + 
    selectedAcademies.length + selectedStatuses.length + selectedPhases.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      {/* Modal Container */}
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[85vh] flex flex-col">
        
        {/* HEADER - FIJO */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white rounded-t-2xl">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Filtros de Participantes</h2>
                <p className="text-purple-100 text-sm">
                  {totalActiveFilters > 0 
                    ? `${totalActiveFilters} filtro${totalActiveFilters !== 1 ? 's' : ''} activo${totalActiveFilters !== 1 ? 's' : ''}`
                    : 'Sin filtros aplicados'
                  }
                </p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-red-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* FILTROS ACTIVOS - FIJO (Solo si hay filtros) */}
        {totalActiveFilters > 0 && (
          <div className="p-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-gray-700">Filtros Activos</h3>
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-1 text-xs text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-full transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Limpiar todo
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedLevels.map(level => (
                <span key={level} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  {level}
                  <button onClick={() => removeFilter('level', level)} className="hover:bg-purple-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCategories.map(category => (
                <span key={category} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {category}
                  <button onClick={() => removeFilter('category', category)} className="hover:bg-green-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedAcademies.map(academy => (
                <span key={academy} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {academy}
                  <button onClick={() => removeFilter('academy', academy)} className="hover:bg-blue-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedStatuses.map(status => (
                <span key={status} className="inline-flex items-center gap-1 bg-orange-100 text-orange-800 text-xs font-medium px-2 py-1 rounded-full">
                  {status}
                  <button onClick={() => removeFilter('status', status)} className="hover:bg-orange-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedPhases.map(phase => (
                <span key={phase} className="inline-flex items-center gap-1 bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  {phase}
                  <button onClick={() => removeFilter('phase', phase)} className="hover:bg-indigo-200 rounded-full p-0.5">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* CONTENIDO - SCROLLEABLE */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Modalidades */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Modalidades</h3>
                <span className="text-sm text-gray-500">({filteredLevels.length})</span>
              </div>
              
              {availableFilters.levels.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar modalidades..."
                    value={levelSearch}
                    onChange={(e) => setLevelSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredLevels.map(level => (
                  <label 
                    key={level} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedLevels.includes(level)
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLevels.includes(level)}
                      onChange={() => toggleLevel(level)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedLevels.includes(level)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedLevels.includes(level) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{level}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Categorías */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-green-500 to-green-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Categorías</h3>
                <span className="text-sm text-gray-500">({filteredCategories.length})</span>
              </div>
              
              {availableFilters.categories.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar categorías..."
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredCategories.map(category => (
                  <label 
                    key={category} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedCategories.includes(category)
                        ? 'border-green-500 bg-green-50 text-green-800'
                        : 'border-gray-200 hover:border-green-300 hover:bg-green-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedCategories.includes(category)}
                      onChange={() => toggleCategory(category)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedCategories.includes(category)
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedCategories.includes(category) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{category}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Academias */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Academias</h3>
                <span className="text-sm text-gray-500">({filteredAcademies.length})</span>
              </div>
              
              {availableFilters.academies.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar academias..."
                    value={academySearch}
                    onChange={(e) => setAcademySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {filteredAcademies.map(academy => (
                  <label 
                    key={academy} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedAcademies.includes(academy)
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedAcademies.includes(academy)}
                      onChange={() => toggleAcademy(academy)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedAcademies.includes(academy)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedAcademies.includes(academy) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{academy}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Estados */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-orange-500 to-orange-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Estados</h3>
                <span className="text-sm text-gray-500">({availableFilters.statuses.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableFilters.statuses.map(status => (
                  <label 
                    key={status} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedStatuses.includes(status)
                        ? 'border-orange-500 bg-orange-50 text-orange-800'
                        : 'border-gray-200 hover:border-orange-300 hover:bg-orange-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedStatuses.includes(status)}
                      onChange={() => toggleStatus(status)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedStatuses.includes(status)
                        ? 'border-orange-500 bg-orange-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedStatuses.includes(status) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium capitalize">{status.replace('_', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Fases */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-indigo-500 to-indigo-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Fases</h3>
                <span className="text-sm text-gray-500">({availableFilters.phases.length})</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {availableFilters.phases.map(phase => (
                  <label 
                    key={phase} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedPhases.includes(phase)
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-800'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedPhases.includes(phase)}
                      onChange={() => togglePhase(phase)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedPhases.includes(phase)
                        ? 'border-indigo-500 bg-indigo-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedPhases.includes(phase) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium capitalize">{phase}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER - FIJO */}
        <div className="border-t border-gray-200 p-4 bg-white rounded-b-2xl">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <Filter className="w-4 h-4" />
              Aplicar Filtros {totalActiveFilters > 0 && `(${totalActiveFilters})`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantFilterModal;