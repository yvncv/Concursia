import React from 'react';
import { DanceData } from '@/app/types/eventType';
import { ModalityLevel } from '@/app/types/levelsType';
import { Users, User, Clock, Zap, Loader2, AlertCircle, Database } from 'lucide-react';
import { useGlobalLevels } from '@/app/hooks/useGlobalLevels';
import { useGlobalCategories } from '@/app/hooks/useGlobalCategories';

interface DanceInfoProps {
  data: DanceData;
  updateData: (data: DanceData) => void;
  isOnlyRead: boolean;
}

export default function DanceInfo({ data, updateData, isOnlyRead }: DanceInfoProps) {
  // 🔥 ÚNICAMENTE Firebase como fuente de datos
  const {
    levels: availableModalities,
    isCouple,
    getPhases,
    isGenderSeparated,
    loading: levelsLoading,
    error: levelsError
  } = useGlobalLevels();

  const {
    categorias: availableCategories,
    loading: categoriesLoading,
    error: categoriesError
  } = useGlobalCategories();

  const isLoading = levelsLoading || categoriesLoading;
  const hasError = levelsError || categoriesError;

  // 🚨 LOADING STATE
  if (isLoading) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          <span className="text-lg font-medium text-gray-900">
            Cargando configuración desde Firebase...
          </span>
        </div>
        <p className="text-gray-600">
          Obteniendo modalidades y categorías del sistema
        </p>
      </div>
    );
  }

  // 🚨 ERROR STATE - SIN PLAN B
  if (hasError) {
    const errorMessage = levelsError?.message || categoriesError?.message;
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 text-red-600">
          <AlertCircle className="h-8 w-8" />
          <span className="text-xl font-medium">
            Error de configuración
          </span>
        </div>
        <p className="text-gray-600 mb-6">
          {errorMessage}
        </p>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-red-800 font-medium mb-2">
            🔧 Para resolver este problema:
          </p>
          <ol className="text-sm text-red-700 text-left list-decimal list-inside space-y-1">
            <li>Abre Firebase Console</li>
            <li>Ve a Firestore Database</li>
            <li>Verifica: <code>globalSettings/levels</code></li>
            <li>Verifica: <code>globalSettings/categories</code></li>
          </ol>
        </div>
      </div>
    );
  }

  // 🚨 SIN MODALIDADES - NO HAY PLAN B
  if (!availableModalities || availableModalities.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 text-orange-600">
          <Database className="h-8 w-8" />
          <span className="text-xl font-medium">
            No hay modalidades configuradas
          </span>
        </div>
        <p className="text-gray-600 mb-6">
          El sistema necesita modalidades configuradas en Firebase para funcionar
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-orange-800 font-medium mb-2">
            📝 Configura modalidades:
          </p>
          <p className="text-sm text-orange-700 font-mono">
            Firebase → globalSettings → levels → modalitiesLevel
          </p>
        </div>
      </div>
    );
  }

  // 🚨 SIN CATEGORÍAS - NO HAY PLAN B
  if (!availableCategories || availableCategories.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="flex items-center justify-center gap-3 mb-4 text-orange-600">
          <Database className="h-8 w-8" />
          <span className="text-xl font-medium">
            No hay categorías configuradas
          </span>
        </div>
        <p className="text-gray-600 mb-6">
          El sistema necesita categorías configuradas en Firebase para funcionar
        </p>
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 max-w-md mx-auto">
          <p className="text-sm text-orange-800 font-medium mb-2">
            📝 Configura categorías:
          </p>
          <p className="text-sm text-orange-700 font-mono">
            Firebase → globalSettings → categories → categoriesByLevel
          </p>
        </div>
      </div>
    );
  }

  // 🎭 Obtener información de modalidad SOLO desde Firebase
  const getModalityInfo = (modalityName: string) => {
    const modalityLevel = modalityName as ModalityLevel;
    return {
      name: modalityName,
      couple: isCouple(modalityLevel),
      phases: getPhases(modalityLevel),
      genderSeparated: isGenderSeparated(modalityLevel)
    };
  };

  // 🔧 Reglas de conflicto (esto podría moverse también a Firebase)
  const getConflictingModalities = (modalityName: string): string[] => {
    if (modalityName === "Novel Abierto") {
      return ["Novel Abierto A", "Novel Abierto B"];
    }
    if (modalityName === "Novel Abierto A" || modalityName === "Novel Abierto B") {
      return ["Novel Abierto"];
    }
    return [];
  };

  const handleModalityChange = (modalityName: string): void => {
    let updatedLevels = { ...data.levels };
    const isSelecting = !data.levels[modalityName]?.selected;
    const modalityInfo = getModalityInfo(modalityName);

    if (isSelecting) {
      const conflictingModalities = getConflictingModalities(modalityName);
      conflictingModalities.forEach(conflictingModality => {
        if (updatedLevels[conflictingModality]) {
          updatedLevels[conflictingModality] = {
            ...updatedLevels[conflictingModality],
            selected: false,
            categories: updatedLevels[conflictingModality]?.categories || []
          };
        }
      });
    }

    updatedLevels[modalityName] = {
      selected: isSelecting,
      price: data.levels[modalityName]?.price ?? 0,
      couple: modalityInfo.couple,
      categories: data.levels[modalityName]?.categories || []
    };

    const noModalitiesSelected = Object.values(updatedLevels).every(level => !level.selected);
    if (noModalitiesSelected) {
      updatedLevels = {};
    }

    updateData({ ...data, levels: updatedLevels });
  };

  const handlePriceChange = (modalityName: string, price: number): void => {
    const updatedLevels = {
      ...data.levels,
      [modalityName]: {
        ...data.levels[modalityName],
        price
      }
    };

    updateData({ ...data, levels: updatedLevels });
  };

  const handleCategoryChange = (modalityName: string, category: string): void => {
    const currentCategories = data.levels[modalityName]?.categories || [];
    const updatedCategories = currentCategories.includes(category)
      ? currentCategories.filter(c => c !== category)
      : [...currentCategories, category];

    const updatedLevels = {
      ...data.levels,
      [modalityName]: {
        ...data.levels[modalityName],
        categories: updatedCategories
      }
    };

    updateData({ ...data, levels: updatedLevels });
  };

  const getPhaseColor = (phase: string) => {
    switch (phase) {
      case 'Eliminatoria': return 'bg-yellow-100 text-yellow-800';
      case 'Semifinal': return 'bg-orange-100 text-orange-800';
      case 'Final': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // ✅ RENDERIZADO PRINCIPAL - SOLO CON DATOS DE FIREBASE
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-medium text-gray-700">Modalidades disponibles</h3>
        <div className="text-sm">
          <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full">
            ✅ {availableModalities.length} modalidades • {availableCategories.length} categorías
          </span>
        </div>
      </div>

      <div className="space-y-6">
        {availableModalities.map((modalityName) => {
          const modalityInfo = getModalityInfo(modalityName);
          const isSelected = data.levels[modalityName]?.selected || false;
          const conflictingModalities = getConflictingModalities(modalityName);
          const hasConflicts = conflictingModalities.some(cm => data.levels[cm]?.selected);

          return (
            <div
              key={modalityName}
              className={`border rounded-lg transition-all ${isSelected
                  ? 'border-blue-300 bg-blue-50'
                  : hasConflicts
                    ? 'border-red-200 bg-red-50 opacity-60'
                    : 'border-gray-200 bg-white'
                }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`modality-${modalityName}`}
                        checked={isSelected}
                        onChange={() => handleModalityChange(modalityName)}
                        disabled={isOnlyRead || hasConflicts}
                        className={`h-4 w-4 text-blue-600 border-gray-300 rounded ${isOnlyRead || hasConflicts ? 'cursor-not-allowed opacity-50' : 'focus:ring-blue-500'
                          }`}
                      />
                      <label htmlFor={`modality-${modalityName}`} className="ml-2 text-sm font-medium text-gray-900">
                        {modalityName}
                      </label>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {modalityInfo.couple ? (
                        <span className="inline-flex items-center gap-1 bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                          <Users className="w-3 h-3" />
                          En Pareja
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                          <User className="w-3 h-3" />
                          Individual
                        </span>
                      )}

                      {modalityInfo.genderSeparated ? (
                        <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                          Por Género
                        </span>
                      ) : (
                        <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                          Mixto
                        </span>
                      )}

                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <div className="flex gap-1">
                          {modalityInfo.phases.map((phase) => (
                            <span
                              key={phase}
                              className={`text-xs px-1 py-0.5 rounded ${getPhaseColor(phase)}`}
                            >
                              {phase}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">S/.</span>
                      <input
                        type="number"
                        value={data.levels[modalityName]?.price || ''}
                        onChange={(e) => handlePriceChange(modalityName, Number(e.target.value))}
                        disabled={isOnlyRead}
                        placeholder="0"
                        min="0"
                        step="0.01"
                        className={`px-3 py-1 w-28 rounded border text-sm ${isOnlyRead
                            ? 'bg-gray-200 cursor-not-allowed opacity-50'
                            : 'border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500'
                          }`}
                      />
                    </div>
                  )}
                </div>

                {hasConflicts && (
                  <div className="mb-3 p-2 bg-red-100 border border-red-200 rounded text-sm text-red-700">
                    <Zap className="w-4 h-4 inline mr-1" />
                    No se puede seleccionar porque está en conflicto con: {
                      conflictingModalities.filter(cm => data.levels[cm]?.selected).join(', ')
                    }
                  </div>
                )}

                {isSelected && (
                  <div className="mt-4 p-3 bg-white rounded border">
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                      Categorías para {modalityName}:
                      <span className="text-xs text-gray-500">
                        ({data.levels[modalityName]?.categories?.length || 0} seleccionadas)
                      </span>
                    </h4>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                      {availableCategories.map((category) => {
                        const isChecked = data.levels[modalityName]?.categories?.includes(category) || false;
                        return (
                          <label
                            key={`${modalityName}-${category}`}
                            className={`flex items-center p-2 rounded border cursor-pointer transition-colors ${isChecked
                                ? 'bg-blue-50 border-blue-300 text-blue-700'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                              } ${isOnlyRead ? 'cursor-not-allowed opacity-50' : ''}`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleCategoryChange(modalityName, category)}
                              disabled={isOnlyRead}
                              className="sr-only"
                            />
                            <span className="text-sm font-medium">{category}</span>
                          </label>
                        );
                      })}
                    </div>

                    {data.levels[modalityName]?.categories?.length === 0 && (
                      <p className="text-sm text-gray-500 mt-2 italic">
                        Selecciona al menos una categoría para esta modalidad
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {Object.keys(data.levels).some(level => data.levels[level].selected) && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Resumen del evento:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <span className="font-medium">Modalidades seleccionadas:</span> {
                Object.entries(data.levels).filter(([_, levelData]) => levelData.selected).length
              }
            </p>
            <p>
              <span className="font-medium">Total de categorías:</span> {
                Object.values(data.levels).reduce((total, levelData) =>
                  levelData.selected ? total + (levelData.categories?.length || 0) : total, 0
                )
              }
            </p>
            <p>
              <span className="font-medium">Precio promedio:</span> S/ {
                (() => {
                  const selectedLevels = Object.values(data.levels).filter(level => level.selected);
                  if (selectedLevels.length === 0) return '0.00';
                  const avg = selectedLevels.reduce((sum, level) => sum + (level.price || 0), 0) / selectedLevels.length;
                  return avg.toFixed(2);
                })()
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}