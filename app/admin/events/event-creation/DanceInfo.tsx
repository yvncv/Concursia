"use client";

import React from 'react';
import { DanceData } from '@/app/types/eventType';

interface DanceInfoProps {
  data: DanceData;
  updateData: (data: DanceData) => void;
  isOnlyRead: boolean;
}

export default function DanceInfo({ data, updateData, isOnlyRead }: DanceInfoProps) {
  const categories = ["Baby", "Pre-Infante", "Infante", "Infantil", "Junior", "Juvenil", "Adulto", "Senior", "Master", "Oro"];
  const levels: Array<{ name: string; couple: boolean }> = [
    { name: "Seriado", couple: false },
    { name: "Individual", couple: false },
    { name: "Novel Novel", couple: true },
    { name: "Novel Abierto", couple: true },
    { name: "Novel Abierto A", couple: true },
    { name: "Novel Abierto B", couple: true },
    { name: "Nacional", couple: true }
  ];

  // Obtiene el primer nivel seleccionado
  const currentLevelId = Object.keys(data.levels).find(l => data.levels[l].selected);

  const handleLevelChange = (levelName: string): void => {
    let updated = { ...data.levels };
    const isSelecting = !data.levels[levelName]?.selected;

    // lógica especial para "Novel Abierto"
    if (levelName === "Novel Abierto" && isSelecting) {
      updated["Novel Abierto A"].selected = false;
      updated["Novel Abierto B"].selected = false;
    }
    if ((levelName === "Novel Abierto A" || levelName === "Novel Abierto B") && isSelecting) {
      updated["Novel Abierto"].selected = false;
      updated[levelName].selected = true;
    }

    // resto de niveles
    updated[levelName] = {
      selected: isSelecting,
      price: data.levels[levelName]?.price || 0,
      couple: levels.find(l => l.name === levelName)?.couple || false,
      categories: data.levels[levelName]?.categories || []
    };

    // si no queda ninguno, limpia todos
    if (!Object.values(updated).some(l => l.selected)) {
      updated = {};
    }

    updateData({ ...data, levels: updated });
  };

  const handlePriceChange = (level: string, price: number): void => {
    updateData({
      ...data,
      levels: {
        ...data.levels,
        [level]: { ...data.levels[level], price }
      }
    });
  };

  const handleCategoryChange = (category: string): void => {
    if (!currentLevelId) return;
    const lvl = data.levels[currentLevelId];
    const updatedCategories = lvl.categories.includes(category)
      ? lvl.categories.filter(c => c !== category)
      : [...lvl.categories, category];

    updateData({
      ...data,
      levels: {
        ...data.levels,
        [currentLevelId]: {
          ...lvl,
          categories: updatedCategories
        }
      }
    });
  };

  return (
    <div className="p-4">
      <div className="flex gap-20">
        {/* Niveles */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar los niveles</h3>
          <div className="space-y-3">
            {levels.map(({ name, couple }) => (
              <div key={name} className="flex items-center gap-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.levels[name]?.selected || false}
                    onChange={() => handleLevelChange(name)}
                    disabled={isOnlyRead}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2">{name}{couple && " (Pareja)"}</span>
                </label>
                {data.levels[name]?.selected && (
                  <div className="flex items-center gap-2">
                    <span>S/.</span>
                    <input
                      type="number"
                      value={data.levels[name]?.price}
                      onChange={(e) => handlePriceChange(name, +e.target.value)}
                      disabled={isOnlyRead}
                      className="w-20 px-2 py-1 border rounded"
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Categorías para el nivel seleccionado */}
        <div>
          <h3 className="text-lg font-medium text-gray-700 mb-4">Seleccionar las categorías</h3>
          {!currentLevelId ? (
            <p className="text-gray-500">Seleccione primero un nivel.</p>
          ) : (
            <div className="space-y-2">
              {categories.map(cat => (
                <label key={cat} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={data.levels[currentLevelId].categories.includes(cat)}
                    onChange={() => handleCategoryChange(cat)}
                    disabled={isOnlyRead}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <span className="ml-2">{cat}</span>
                </label>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
