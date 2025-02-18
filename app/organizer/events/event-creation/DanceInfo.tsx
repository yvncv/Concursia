import React from 'react';
import { DanceData } from '@/app/types/eventType';

interface DanceInfoProps {
  data: DanceData;
  updateData: (data: DanceData) => void;
  isOnlyRead: boolean; // 🔹 Agregado para solo lectura
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

    if (levelName === "Novel Abierto" && isSelecting) {
      updatedLevels = {
        ...updatedLevels,
        "Novel Abierto A": { ...updatedLevels["Novel Abierto A"], selected: false },
        "Novel Abierto B": { ...updatedLevels["Novel Abierto B"], selected: false }
      };
    } else if (levelName === "Novel Abierto A" || levelName === "Novel Abierto B") {
      updatedLevels = {
        ...updatedLevels,
        "Novel Abierto": { ...updatedLevels["Novel Abierto"], selected: false },
        "Novel Abierto A": {
          ...updatedLevels["Novel Abierto A"],
          selected: isSelecting
        },
        "Novel Abierto B": {
          ...updatedLevels["Novel Abierto B"],
          selected: isSelecting
        }
      };
    }

    if (levelName !== "Novel Abierto A" && levelName !== "Novel Abierto B") {
      const level = levels.find(l => l.name === levelName);
      updatedLevels[levelName] = {
        selected: isSelecting,
        price: data.levels[levelName]?.price || '',
        couple: level?.couple || false
      };
    }

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

  const handleCategoryChange = (category: string): void => {
    const updatedCategories = data.categories.includes(category)
      ? data.categories.filter(c => c !== category)
      : [...data.categories, category];

    updateData({
      ...data,
      categories: updatedCategories
    });
  };

  return (
    <div className="p-4">
      <div className="flex gap-20">
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar las categorías</h3>
          <div className="space-y-2">
            {categories.map((category) => (
              <div key={category} className="flex items-center">
                <input
                  type="checkbox"
                  id={`category-${category}`}
                  checked={data.categories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                  disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
                  className={`h-4 w-4 text-blue-600 border-gray-300 rounded 
                    ${isOnlyRead ? 'cursor-not-allowed opacity-50' : 'focus:ring-blue-500'}`}
                />
                <label htmlFor={`category-${category}`} className="ml-2 text-sm text-gray-900">
                  {category}
                </label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar los niveles</h3>
          <div className="space-y-3">
            {levels.map(({ name, couple }) => (
              <div key={name} className="flex items-center gap-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`level-${name}`}
                    checked={data.levels[name]?.selected || false}
                    onChange={() => handleLevelChange(name)}
                    disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
                    className={`h-4 w-4 text-blue-600 border-gray-300 rounded 
                      ${isOnlyRead ? 'cursor-not-allowed opacity-50' : 'focus:ring-blue-500'}`}
                  />
                  <label htmlFor={`level-${name}`} className="ml-2 text-sm text-gray-900">
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
                      disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
                      placeholder="Precio"
                      className={`px-2 py-1 w-24 rounded border text-sm
                        ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'border-gray-300'}`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}