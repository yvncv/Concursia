import React, { useState, useEffect } from "react";
import { X, Filter, Trash2, Check, Search } from "lucide-react";

export interface FilterOptions {
  modalities: string[];
  categories: string[];
  academies: string[];
}

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyFilters: (filterOptions: FilterOptions) => void;
  availableFilters: {
    modalities: string[];
    categories: string[];
    academies: string[];
  };
  currentFilters?: FilterOptions;
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  availableFilters,
  currentFilters
}) => {
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAcademies, setSelectedAcademies] = useState<string[]>([]);
  
  // Estados para búsqueda
  const [modalitySearch, setModalitySearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");
  const [academySearch, setAcademySearch] = useState("");

  // Inicializar con filtros actuales cuando el modal se abre
  useEffect(() => {
    if (isOpen && currentFilters) {
      setSelectedModalities(currentFilters.modalities || []);
      setSelectedCategories(currentFilters.categories || []);
      setSelectedAcademies(currentFilters.academies || []);
      setModalitySearch("");
      setCategorySearch("");
      setAcademySearch("");
    }
  }, [isOpen, currentFilters]);

  const handleApplyFilters = () => {
    onApplyFilters({
      modalities: selectedModalities,
      categories: selectedCategories,
      academies: selectedAcademies
    });
    onClose();
  };

  const clearAllFilters = () => {
    setSelectedModalities([]);
    setSelectedCategories([]);
    setSelectedAcademies([]);
  };

  const removeFilter = (type: 'modality' | 'category' | 'academy', value: string) => {
    switch (type) {
      case 'modality':
        setSelectedModalities(prev => prev.filter(m => m !== value));
        break;
      case 'category':
        setSelectedCategories(prev => prev.filter(c => c !== value));
        break;
      case 'academy':
        setSelectedAcademies(prev => prev.filter(a => a !== value));
        break;
    }
  };

  const toggleModality = (modality: string) => {
    setSelectedModalities(prev => 
      prev.includes(modality)
        ? prev.filter(m => m !== modality)
        : [...prev, modality]
    );
  };

  const toggleCategory = (category: string) => {
    setSelectedCategories(prev => 
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleAcademy = (academy: string) => {
    setSelectedAcademies(prev => 
      prev.includes(academy)
        ? prev.filter(a => a !== academy)
        : [...prev, academy]
    );
  };

  // Filtrar opciones basado en búsqueda
  const filteredModalities = availableFilters.modalities.filter(modality =>
    modality.toLowerCase().includes(modalitySearch.toLowerCase())
  );

  const filteredCategories = availableFilters.categories.filter(category =>
    category.toLowerCase().includes(categorySearch.toLowerCase())
  );

  const filteredAcademies = availableFilters.academies.filter(academy =>
    academy.toLowerCase().includes(academySearch.toLowerCase())
  );

  // Contar total de filtros activos
  const totalActiveFilters = selectedModalities.length + selectedCategories.length + selectedAcademies.length;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white bg-opacity-20 rounded-full">
                <Filter className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Filtros Avanzados</h2>
                <p className="text-blue-100 text-sm">
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

        {/* Filtros activos */}
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
              {selectedModalities.map(modality => (
                <span key={modality} className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full">
                  {modality}
                  <button 
                    onClick={() => removeFilter('modality', modality)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedCategories.map(category => (
                <span key={category} className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  {category}
                  <button 
                    onClick={() => removeFilter('category', category)}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
              {selectedAcademies.map(academy => (
                <span key={academy} className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                  {academy}
                  <button 
                    onClick={() => removeFilter('academy', academy)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            
            {/* Modalidades */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                <h3 className="text-lg font-bold text-gray-800">Modalidades</h3>
                <span className="text-sm text-gray-500">({filteredModalities.length})</span>
              </div>
              
              {availableFilters.modalities.length > 5 && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Buscar modalidades..."
                    value={modalitySearch}
                    onChange={(e) => setModalitySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                {filteredModalities.map(modality => (
                  <label 
                    key={modality} 
                    className={`flex items-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                      selectedModalities.includes(modality)
                        ? 'border-purple-500 bg-purple-50 text-purple-800'
                        : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedModalities.includes(modality)}
                      onChange={() => toggleModality(modality)}
                      className="sr-only"
                    />
                    <div className={`w-4 h-4 rounded border-2 mr-3 flex items-center justify-center ${
                      selectedModalities.includes(modality)
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedModalities.includes(modality) && (
                        <Check className="w-3 h-3 text-white" />
                      )}
                    </div>
                    <span className="font-medium">{modality}</span>
                  </label>
                ))}
                {filteredModalities.length === 0 && modalitySearch && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No se encontraron modalidades</p>
                )}
                {availableFilters.modalities.length === 0 && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No hay modalidades disponibles</p>
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                {filteredCategories.length === 0 && categorySearch && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No se encontraron categorías</p>
                )}
                {availableFilters.categories.length === 0 && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No hay categorías disponibles</p>
                )}
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-48 overflow-y-auto">
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
                {filteredAcademies.length === 0 && academySearch && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No se encontraron academias</p>
                )}
                {availableFilters.academies.length === 0 && (
                  <p className="text-gray-500 italic col-span-2 text-center py-4">No hay academias disponibles</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-all duration-200"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
            <button
              onClick={handleApplyFilters}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl"
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

export default FilterModal;