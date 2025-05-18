import React, { useState, useEffect } from "react";
import { CircleX } from "lucide-react";

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
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApplyFilters,
  availableFilters
}) => {
  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedAcademies, setSelectedAcademies] = useState<string[]>([]);

  // Reset selections when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedModalities([]);
      setSelectedCategories([]);
      setSelectedAcademies([]);
    }
  }, [isOpen]);

  const handleApplyFilters = () => {
    onApplyFilters({
      modalities: selectedModalities,
      categories: selectedCategories,
      academies: selectedAcademies
    });
    onClose();
  };

  const handleModalClick = (e: React.MouseEvent) => {
    // Prevent clicks on the modal content from closing the modal
    e.stopPropagation();
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

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md"
        onClick={handleModalClick}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Filtrar Tickets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-red-600">
            <CircleX size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Modalidades */}
          <div>
            <h3 className="font-semibold mb-2">Modalidades</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableFilters.modalities.map(modality => (
                <div key={modality} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`modality-${modality}`}
                    checked={selectedModalities.includes(modality)}
                    onChange={() => toggleModality(modality)}
                    className="mr-2"
                  />
                  <label htmlFor={`modality-${modality}`}>{modality}</label>
                </div>
              ))}
              {availableFilters.modalities.length === 0 && (
                <p className="text-gray-500 italic">No hay modalidades disponibles</p>
              )}
            </div>
          </div>

          {/* Categorías */}
          <div>
            <h3 className="font-semibold mb-2">Categorías</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableFilters.categories.map(category => (
                <div key={category} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`category-${category}`}
                    checked={selectedCategories.includes(category)}
                    onChange={() => toggleCategory(category)}
                    className="mr-2"
                  />
                  <label htmlFor={`category-${category}`}>{category}</label>
                </div>
              ))}
              {availableFilters.categories.length === 0 && (
                <p className="text-gray-500 italic">No hay categorías disponibles</p>
              )}
            </div>
          </div>

          {/* Academias */}
          <div>
            <h3 className="font-semibold mb-2">Academias</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableFilters.academies.map(academy => (
                <div key={academy} className="flex items-center">
                  <input
                    type="checkbox"
                    id={`academy-${academy}`}
                    checked={selectedAcademies.includes(academy)}
                    onChange={() => toggleAcademy(academy)}
                    className="mr-2"
                  />
                  <label htmlFor={`academy-${academy}`}>{academy}</label>
                </div>
              ))}
              {availableFilters.academies.length === 0 && (
                <p className="text-gray-500 italic">No hay academias disponibles</p>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleApplyFilters}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Aplicar Filtros
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterModal;