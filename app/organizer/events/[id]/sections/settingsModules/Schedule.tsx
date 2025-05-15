"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CustomEvent } from "@/app/types/eventType"
import { GripVertical, Save, Clock, AlertCircle } from "lucide-react"

interface ScheduleProps {
  event: CustomEvent
}

interface ScheduleItem {
  id: string
  modalityId: string
  modalityName: string
  category: string
  order: number
}

const Schedule: React.FC<ScheduleProps> = ({ event }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Generar los items del cronograma basados en las modalidades y categorías
  useEffect(() => {
    const items: ScheduleItem[] = []
    let orderIndex = 0

    console.log("Niveles del evento:", event.settings.levels)

    // Iterar sobre cada modalidad
    Object.entries(event.settings.levels).forEach(([modalityId, modalityData]) => {
      // No filtrar por selected, mostrar todas las modalidades que tengan categorías
      if (modalityData.categories && modalityData.categories.length > 0) {
        console.log(`Modalidad ${modalityId}:`, modalityData)
        
        // Crear un item por cada categoría de la modalidad
        modalityData.categories.forEach((category) => {
          items.push({
            id: `${modalityId}-${category}`,
            modalityId,
            modalityName: modalityId,
            category,
            order: orderIndex++
          })
        })
      }
    })

    console.log("Items generados:", items)
    setScheduleItems(items)
  }, [event])

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) return

    const draggedItemData = scheduleItems[draggedItem]
    const newItems = [...scheduleItems]
    
    // Remover el item arrastrado
    newItems.splice(draggedItem, 1)
    
    // Insertar en la nueva posición
    newItems.splice(dropIndex, 0, draggedItemData)
    
    // Actualizar el orden
    const reorderedItems = newItems.map((item, index) => ({
      ...item,
      order: index
    }))
    
    setScheduleItems(reorderedItems)
    setDraggedItem(null)
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Aquí implementarías la lógica para guardar el orden
    console.log("Guardando orden del cronograma:", scheduleItems)
    // Por ahora solo mostramos el orden en consola
    setHasChanges(false)
    
    // Podrías guardar esto en alguna propiedad del evento como `scheduleOrder`
    // o crear una colección separada para el cronograma
  }

  const getTimeEstimate = (category: string): string => {
    // Estimaciones de tiempo por categoría (puedes ajustar según tu evento)
    const estimates: { [key: string]: string } = {
      "Infante": "3 min",
      "Juvenil": "4 min",
      "Adulto": "5 min",
      "Master": "5 min",
      "Solo Masculino": "4 min",
      "Solo Femenino": "4 min",
      "Parejas": "5 min",
      "Grupos": "7 min"
    }
    return estimates[category] || "4 min"
  }

  if (scheduleItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">No hay modalidades configuradas</p>
        <p className="text-gray-500 text-sm mb-4">
          Configura las modalidades y categorías en sus respectivas secciones
        </p>
        <div className="text-left max-w-md mx-auto bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 font-medium mb-2">Información del evento:</p>
          <pre className="text-xs text-gray-500 overflow-auto">
            {JSON.stringify(event.settings.levels, null, 2)}
          </pre>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Cronograma del Evento
        </h2>
        <p className="text-gray-600">
          Arrastra y suelta para reorganizar el orden de las presentaciones
        </p>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5" />
          <div>
            <p className="text-yellow-800 font-medium">Cambios sin guardar</p>
            <p className="text-yellow-700 text-sm">
              Has realizado cambios en el orden. No olvides guardarlos.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {scheduleItems.map((item, index) => (
          <div
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDrop={(e) => handleDrop(e, index)}
            className={`bg-white border rounded-lg p-4 cursor-move transition-all ${
              draggedItem === index 
                ? "opacity-50 border-blue-300" 
                : "hover:shadow-lg border-gray-200"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <GripVertical className="h-5 w-5 text-gray-400" />
                
                <div className="flex items-center space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm font-medium">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium text-gray-900">
                      {item.modalityName} - {item.category}
                    </p>
                    <p className="text-sm text-gray-500">
                      Duración estimada: {getTimeEstimate(item.category)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-gray-600">
                Orden: {item.order + 1}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 p-4 rounded-lg">
        <h3 className="font-medium text-blue-900 mb-2">Resumen del cronograma</h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>• Total de presentaciones: {scheduleItems.length}</p>
          <p>• Tiempo estimado total: {
            scheduleItems.reduce((total, item) => {
              const time = parseInt(getTimeEstimate(item.category)) || 4
              return total + time
            }, 0)
          } minutos</p>
          <p>• Modalidades incluidas: {
            [...new Set(scheduleItems.map(item => item.modalityName))].length
          }</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-4 py-2 rounded-md focus:outline-none focus:ring-2 flex items-center ${
            hasChanges
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Save className="h-4 w-4 mr-2" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

export default Schedule