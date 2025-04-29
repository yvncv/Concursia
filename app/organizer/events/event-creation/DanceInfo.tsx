import React from 'react';
import { DanceData } from '@/app/types/eventType';

interface DanceInfoProps {
  data: DanceData;
  updateData: (data: DanceData) => void;
  isOnlyRead: boolean;
}

export default function DanceInfo({ data, updateData, isOnlyRead }: DanceInfoProps) {
  const categories: string[] = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];
  const levels: Array<{ name: string; couple: boolean }> = [
    { name: "Seriado", couple: false },
    { name: "Individual", couple: false },
    { name: "Novel Novel", couple: true },
    { name: "Novel Abierto", couple: true },
    { name: "Novel Abierto A", couple: true },
    { name: "Novel Abierto B", couple: true },
    { name: "Nacional", couple: true }
  ];

  const handleLevelChange = (levelName: string): void => {
    let updatedLevels = { ...data.levels };
    const isSelecting = !data.levels[levelName]?.selected;

    // Si estamos seleccionando "Novel Abierto", deshabilitamos "Novel Abierto A" y "Novel Abierto B"
    if (levelName === "Novel Abierto" && isSelecting) {
      updatedLevels = {
        ...updatedLevels,
        "Novel Abierto A": { 
          ...updatedLevels["Novel Abierto A"] || {}, 
          selected: false, 
          categories: updatedLevels["Novel Abierto A"]?.categories || [],
          price: updatedLevels["Novel Abierto A"]?.price || '',
          couple: true
        },
        "Novel Abierto B": { 
          ...updatedLevels["Novel Abierto B"] || {}, 
          selected: false, 
          categories: updatedLevels["Novel Abierto B"]?.categories || [],
          price: updatedLevels["Novel Abierto B"]?.price || '',
          couple: true
        }
      };
    } 
    // Si estamos seleccionando "Novel Abierto A" o "Novel Abierto B", deshabilitamos "Novel Abierto"
    else if ((levelName === "Novel Abierto A" || levelName === "Novel Abierto B") && isSelecting) {
      updatedLevels = {
        ...updatedLevels,
        "Novel Abierto": { 
          ...updatedLevels["Novel Abierto"] || {}, 
          selected: false, 
          categories: updatedLevels["Novel Abierto"]?.categories || [],
          price: updatedLevels["Novel Abierto"]?.price || '',
          couple: true
        }
      };
    }

    // Actualizar el estado del nivel que se está cambiando
    const level = levels.find(l => l.name === levelName);
    updatedLevels[levelName] = {
      selected: isSelecting,
      price: data.levels[levelName]?.price || '',
      couple: level?.couple || false,
      categories: data.levels[levelName]?.categories || []
    };

    // Verificar si no hay ningún nivel seleccionado
    const noLevelsSelected = Object.values(updatedLevels).every(level => !level.selected);
    if (noLevelsSelected) {
      updatedLevels = {};
    }

    updateData({
      ...data,
      levels: updatedLevels
    });
  };

  const handlePriceChange = (level: string, price: string): void => {
    const updatedLevels = {
      ...data.levels,
      [level]: {
        ...data.levels[level],
        price
      }
    };

    updateData({
      ...data,
      levels: updatedLevels
    });
  };

  const handleCategoryChange = (level: string, category: string): void => {
    const currentCategories = data.levels[level]?.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    const updatedLevels = {
      ...data.levels,
      [level]: {
        ...data.levels[level],
        categories: updatedCategories
      }
    };

    updateData({
      ...data,
      levels: updatedLevels
    });
  };

  return (
    <div className="p-4">
      <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar los niveles</h3>
      <div className="space-y-6">
        {levels.map(({ name, couple }) => (
          <div key={name} className="border p-4 rounded-lg">
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id={`level-${name}`}
                  checked={data.levels[name]?.selected || false}
                  onChange={() => handleLevelChange(name)}
                  disabled={isOnlyRead}
                  className={`h-4 w-4 text-blue-600 border-gray-300 rounded 
                    ${isOnlyRead ? 'cursor-not-allowed opacity-50' : 'focus:ring-blue-500'}`}
                />
                <label htmlFor={`level-${name}`} className="ml-2 text-sm font-medium text-gray-900">
                  {name}
                  {couple && <span className="ml-2 text-xs text-gray-500">(Pareja)</span>}
                </label>
              </div>

              {data.levels[name]?.selected && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">S/.</span>
                  <input
                    type="number"
                    value={data.levels[name]?.price}
                    onChange={(e) => handlePriceChange(name, e.target.value)}
                    disabled={isOnlyRead}
                    placeholder="Precio"
                    className={`px-2 py-1 w-24 rounded border text-sm
                      ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'border-gray-300'}`}
                  />
                </div>
              )}
            </div>

            {data.levels[name]?.selected && (
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Categorías para {name}:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                  {categories.map((category) => (
                    <div key={`${name}-${category}`} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`category-${name}-${category}`}
                        checked={data.levels[name]?.categories?.includes(category) || false}
                        onChange={() => handleCategoryChange(name, category)}
                        disabled={isOnlyRead}
                        className={`h-4 w-4 text-blue-600 border-gray-300 rounded 
                          ${isOnlyRead ? 'cursor-not-allowed opacity-50' : 'focus:ring-blue-500'}`}
                      />
                      <label htmlFor={`category-${name}-${category}`} className="ml-2 text-sm text-gray-900">
                        {category}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}