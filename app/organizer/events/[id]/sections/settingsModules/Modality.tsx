"use client"

import type React from "react"
import { useState } from "react"
import type { CustomEvent, LevelData } from "@/app/types/eventType"
import { Save, DollarSign, Users, Tag, Heart } from "lucide-react"

interface ModalityProps {
  event: CustomEvent
  modalityId: string
  modalityTitle: string
}

const Modality: React.FC<ModalityProps> = ({ event, modalityId, modalityTitle }) => {
  const currentLevel = event.settings.levels[modalityId]
  const [levelData, setLevelData] = useState<LevelData>(currentLevel || {
    selected: false,
    categories: [],
    price: 0,
    couple: false
  })

  const handleSave = async () => {
    // Aquí implementarías la lógica para guardar los cambios
    console.log("Guardando configuración de", modalityTitle, levelData)
    // Llamada a API o Firebase para actualizar
  }

  const handleCategoryToggle = (category: string) => {
    const newCategories = levelData.categories.includes(category)
      ? levelData.categories.filter(cat => cat !== category)
      : [...levelData.categories, category]
    
    setLevelData({ ...levelData, categories: newCategories })
  }

  // Lista de todas las categorías disponibles
  // Si las categorías vienen del evento, úsalas. Si no, usa las predeterminadas
  const availableCategories = event.settings.categories?.length > 0 
    ? event.settings.categories
    : [
        "Solo Masculino",
        "Solo Femenino", 
        "Parejas",
        "Grupos",
        "Freestyle",
        "Coreográfico"
      ]

  if (!currentLevel) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">No se encontraron datos para esta modalidad</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Configuración de {modalityTitle}
        </h2>
        <p className="text-gray-600">
          Configura los parámetros específicos para la modalidad {modalityTitle}
        </p>
      </div>

      {/* Precio */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <DollarSign className="h-4 w-4 mr-2" />
            Precio
          </div>
        </label>
        <input
          type="number"
          value={levelData.price}
          onChange={(e) => setLevelData({ ...levelData, price: Number(e.target.value) })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="0.00"
          step="0.01"
        />
      </div>

      {/* Categorías */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          <div className="flex items-center">
            <Tag className="h-4 w-4 mr-2" />
            Categorías
          </div>
        </label>
        <div className="space-y-2">
          {availableCategories.map((category) => (
            <label key={category} className="flex items-center space-x-3">
              <input
                type="checkbox"
                checked={levelData.categories.includes(category)}
                onChange={() => handleCategoryToggle(category)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Opción de pareja */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={levelData.couple}
            onChange={(e) => setLevelData({ ...levelData, couple: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center">
            <Heart className="h-4 w-4 mr-2 text-red-500" />
            <span className="text-gray-700">Permite inscripción en pareja</span>
          </div>
        </label>
      </div>

      {/* Estado de la modalidad */}
      <div>
        <label className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={levelData.selected}
            onChange={(e) => setLevelData({ ...levelData, selected: e.target.checked })}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-green-500" />
            <span className="text-gray-700">Modalidad activa</span>
          </div>
        </label>
        <p className="text-sm text-gray-500 mt-1 ml-7">
          Desactivar temporalmente esta modalidad ocultará las opciones de inscripción
        </p>
      </div>

      {/* Resumen */}
      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Resumen de configuración</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Estado: {levelData.selected ? "Activa" : "Inactiva"}</li>
          <li>• Precio: ${levelData.price}</li>
          <li>• Categorías: {levelData.categories.length === 0 ? "Ninguna seleccionada" : levelData.categories.join(", ")}</li>
          <li>• Permite parejas: {levelData.couple ? "Sí" : "No"}</li>
        </ul>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center"
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

export default Modality