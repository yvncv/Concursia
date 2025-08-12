import React, { useEffect, useState, useRef } from 'react';
import useAcademies from '@/app/hooks/useAcademies';
import useAcademy from '@/app/hooks/useAcademy';

interface AcademySelectorProps {
  onAcademySelect: (academyId: string, academyName: string) => void;
  initialAcademyId?: string;
  initialAcademyName?: string;
  placeholder?: string;
  label?: string;
  theme?: 'light' | 'dark';
  disabled?: boolean;
  required?: boolean;
}

const AcademySelector: React.FC<AcademySelectorProps> = ({ 
  onAcademySelect, 
  initialAcademyId = '', 
  initialAcademyName = 'Libre',
  placeholder = "Buscar academia...",
  label = "Academia",
  theme = 'dark',
  disabled = false,
  required = false
}) => {
  const { academies, loadingAcademies, errorAcademies } = useAcademies();
  const { academy, loadingAcademy } = useAcademy(initialAcademyId);
  const [selectedAcademyName, setSelectedAcademyName] = useState<string>(initialAcademyName || 'Libre');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isNewAcademy, setIsNewAcademy] = useState<boolean>(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const hasManualSelection = useRef(false);

  // Configuración de temas
  const themeConfig = {
    light: {
      label: 'text-gray-700',
      input: 'bg-white border-gray-300 text-gray-900 placeholder:text-gray-500 focus:ring-blue-500 focus:border-blue-500',
      loading: 'bg-gray-100 text-gray-600 border-gray-200',
      error: 'bg-red-50 border-red-200 text-red-600',
      dropdown: 'bg-white border-gray-300 shadow-lg',
      dropdownItem: 'hover:bg-gray-100 text-gray-900',
      button: 'bg-gray-600 hover:bg-gray-700 text-white',
      newAcademyBg: 'bg-blue-50 border-blue-200',
      newAcademyText: 'text-gray-800',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700',
      cancelBtn: 'bg-gray-600 hover:bg-gray-700',
      selectedBadge: 'bg-blue-500 text-white'
    },
    dark: {
      label: 'text-white',
      input: 'bg-gray-200 border-gray-300 text-gray-900 placeholder:text-gray-600 focus:ring-red-400 focus:bg-white',
      loading: 'bg-gray-200 text-gray-600 border-gray-300',
      error: 'bg-red-100 border-red-300 text-red-600',
      dropdown: 'bg-white border-gray-300 shadow-lg',
      dropdownItem: 'hover:bg-gray-100 text-gray-900',
      button: 'bg-gray-700 hover:bg-gray-800 text-white',
      newAcademyBg: 'bg-red-100 border-red-300',
      newAcademyText: 'text-gray-800',
      confirmBtn: 'bg-red-600 hover:bg-red-700',
      cancelBtn: 'bg-gray-600 hover:bg-gray-700',
      selectedBadge: 'bg-red-500 text-white'
    }
  };

  const styles = themeConfig[theme];

  useEffect(() => {
    if (academy && academy.name) {
      setSelectedAcademyName(academy.name);
    } else if (initialAcademyName) {
      setSelectedAcademyName(initialAcademyName);
    }
  }, [academy, initialAcademyName]);

  useEffect(() => {
    if (!hasManualSelection.current) {
      if (initialAcademyId === '') {
        onAcademySelect('', initialAcademyName || 'Libre');
      } else if (initialAcademyId) {
        const academyName = academy?.name || initialAcademyName || 'Libre';
        onAcademySelect(initialAcademyId, academyName);
      }
    }
  }, [initialAcademyId, initialAcademyName, academy, onAcademySelect]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled) return;
    
    const query = e.target.value;
    setSearchQuery(query);
    setShowDropdown(true);

    if (query.trim() === '') {
      return;
    }
  };

  const handleAcademySelect = (academyId: string, academyName: string) => {
    if (disabled) return;
    
    console.log("Academia seleccionada manualmente:", academyId);
    hasManualSelection.current = true;
    setSelectedAcademyName(academyName);
    setSearchQuery('');
    setIsNewAcademy(false);
    setShowDropdown(false);
    onAcademySelect(academyId, academyName);
  };

  const handleSaveNewAcademy = (academyName: string) => {
    if (disabled) return;
    
    const formattedAcademyName = searchQuery
      .replace(/\s+/g, ' ')
      .replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());

    hasManualSelection.current = true;
    setSelectedAcademyName(formattedAcademyName);
    setSearchQuery('');
    setIsNewAcademy(false);
    setShowDropdown(false);
    onAcademySelect('', formattedAcademyName);
  };

  const handleResetAcademy = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    
    e.preventDefault();
    hasManualSelection.current = true;
    setSelectedAcademyName('Libre');
    setSearchQuery('');
    setIsNewAcademy(false);
    setShowDropdown(false);
    onAcademySelect('', 'Libre');
  };

  const handleNewAcademy = (bool: boolean) => {
    if (disabled) return;
    
    setIsNewAcademy(bool);
    setShowDropdown(false);
    if (!bool) handleResetAcademy(new MouseEvent('click') as any);
  };

  const filteredAcademies = academies.filter(academy =>
    academy.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="w-full">
      <label htmlFor="academyId" className={`block text-sm font-medium mb-2 ${styles.label}`}>
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      
      {loadingAcademies || loadingAcademy ? (
        <div className={`mt-1 flex items-center justify-center px-4 py-4 rounded-2xl ${styles.loading} border`}>
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Cargando academias...
        </div>
      ) : errorAcademies ? (
        <div className={`mt-1 px-4 py-4 rounded-2xl ${styles.error} border`}>
          <div className="flex items-center">
            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            Error: {errorAcademies}
          </div>
        </div>
      ) : (
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                id="academyId"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => !disabled && setShowDropdown(true)}
                disabled={disabled}
                className={`w-full pl-10 pr-4 py-4 rounded-2xl border transition-all outline-none ${styles.input} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder={selectedAcademyName || placeholder}
              />
              {selectedAcademyName && !searchQuery && (
                <div className="absolute inset-y-0 right-3 flex items-center">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${styles.selectedBadge}`}>
                    Seleccionada
                  </span>
                </div>
              )}
            </div>

            <button
              onClick={handleResetAcademy}
              disabled={disabled}
              className={`p-4 h-12 w-12 flex items-center justify-center rounded-2xl transition-colors ${styles.button} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              type="button"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {showDropdown && searchQuery && !disabled && (
            <div
              className={`absolute z-[9999] w-full mt-1 border rounded-2xl max-h-60 overflow-y-auto ${styles.dropdown}`}
              onMouseDown={(e) => e.preventDefault()}
            >
              {filteredAcademies.length > 0 ? (
                filteredAcademies.map(academy => (
                  <div
                    key={academy.id}
                    className={`px-4 py-3 cursor-pointer transition-colors ${styles.dropdownItem}`}
                    onClick={() => handleAcademySelect(academy.id, academy.name)}
                  >
                    <div className="font-medium">{academy.name}</div>
                  </div>
                ))
              ) : (
                <div className="p-4">
                  <div className="text-gray-600 mb-3">
                    No se encontró la academia en nuestros registros.
                  </div>
                  <div
                    className="flex items-center text-blue-600 font-medium cursor-pointer"
                    onClick={() => handleNewAcademy(true)}
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <svg className="h-5 w-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Usar "{searchQuery}" como academia
                  </div>
                </div>
              )}
            </div>
          )}

          {isNewAcademy && (
            <div className={`mt-3 p-3 rounded-2xl border ${styles.newAcademyBg}`}>
              <div className={`mb-2 ${styles.newAcademyText}`}>¿Confirmar nueva academia?</div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveNewAcademy(searchQuery)}
                  className={`flex-1 px-4 py-2 text-white rounded-xl transition-colors ${styles.confirmBtn}`}
                  type="button"
                >
                  Confirmar
                </button>
                <button
                  onClick={() => handleNewAcademy(false)}
                  className={`flex-1 px-4 py-2 text-white rounded-xl transition-colors ${styles.cancelBtn}`}
                  type="button"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AcademySelector;