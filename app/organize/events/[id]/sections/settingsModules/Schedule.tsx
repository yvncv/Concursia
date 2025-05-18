"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CustomEvent } from "@/app/types/eventType"
import { GripVertical, Save, Clock, AlertCircle, Calendar, Timer } from "lucide-react"

interface ScheduleProps {
  event: CustomEvent
}

interface ScheduleItem {
  id: string
  modalityId: string
  modalityName: string
  category: string
  order: number
  estimatedTime: number
}

const Schedule: React.FC<ScheduleProps> = ({ event }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)

  // Generar los items del cronograma basados en las modalidades y categorías
  useEffect(() => {
    const items: ScheduleItem[] = []
    let orderIndex = 0

    console.log("Evento completo:", event)
    console.log("Niveles del evento:", event.dance?.levels)

    if (!event.dance?.levels) {
      console.error("No se encontraron niveles en event.dance")
      return
    }

    // Iterar sobre cada modalidad
    Object.entries(event.dance.levels).forEach(([modalityId, modalityData]) => {
      console.log(`Revisando modalidad ${modalityId}:`, modalityData)
      
      // Verificar si tiene categorías (independientemente de selected)
      if (modalityData.categories && modalityData.categories.length > 0) {
        console.log(`Modalidad ${modalityId} tiene ${modalityData.categories.length} categorías`)
        
        // Crear un item por cada categoría de la modalidad
        modalityData.categories.forEach((category) => {
          items.push({
            id: `${modalityId}-${category}`,
            modalityId,
            modalityName: modalityId.charAt(0).toUpperCase() + modalityId.slice(1),
            category,
            order: orderIndex++,
            estimatedTime: getTimeEstimate(category)
          })
        })
      } else {
        console.log(`Modalidad ${modalityId} no tiene categorías`)
      }
    })

    console.log("Items generados:", items)
    setScheduleItems(items)
  }, [event])

  const getTimeEstimate = (category: string): number => {
    // Estimaciones de tiempo en minutos por categoría
    const estimates: { [key: string]: number } = {
      "Infante": 3,
      "Juvenil": 4,
      "Adulto": 5,
      "Master": 5,
      "Solo Masculino": 4,
      "Solo Femenino": 4,
      "Parejas": 5,
      "Grupos": 7
    }
    return estimates[category] || 4
  }

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedItem(index)
    e.dataTransfer.effectAllowed = "move"
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = "move"
    setDraggedOverItem(index)
  }

  const handleDragLeave = () => {
    setDraggedOverItem(null)
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDraggedOverItem(null)
  }

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedItem === null || draggedItem === dropIndex) {
      setDraggedOverItem(null)
      return
    }

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
    setDraggedOverItem(null)
    setHasChanges(true)
  }

  const handleSave = async () => {
    // Aquí implementarías la lógica para guardar el orden
    console.log("Guardando orden del cronograma:", scheduleItems)
    setHasChanges(false)
    
    // TODO: Guardar en Firebase
    // Podrías guardar esto en event.settings.scheduleOrder o similar
  }

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    if (hours > 0) {
      return `${hours}h ${mins}min`
    }
    return `${mins} min`
  }

  const calculateTotalTime = (): number => {
    return scheduleItems.reduce((total, item) => total + item.estimatedTime, 0)
  }

  if (scheduleItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">No hay modalidades configuradas</p>
        <p className="text-gray-500 text-sm mb-4">
          Para crear el cronograma, primero debes configurar las categorías en cada modalidad
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Cronograma del Evento
          </h2>
          <p className="text-gray-600">
            Arrastra y suelta para reorganizar el orden de las presentaciones
          </p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Tiempo total estimado</div>
          <div className="text-2xl font-bold text-blue-600">{formatTime(calculateTotalTime())}</div>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <p className="text-yellow-800 font-medium">Cambios sin guardar</p>
            <p className="text-yellow-700 text-sm">
              Has realizado cambios en el orden. No olvides guardarlos.
            </p>
          </div>
          <button
            onClick={handleSave}
            className="ml-4 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors"
          >
            <Save className="h-4 w-4 inline mr-1" />
            Guardar ahora
          </button>
        </div>
      )}

      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2">
        {scheduleItems.map((item, index) => (
          <div key={item.id}>
            {/* Indicador de drop */}
            {draggedOverItem === index && draggedItem !== index && (
              <div className="h-1 bg-blue-400 rounded-full my-2 animate-pulse" />
            )}
            
            <div
              draggable
              onDragStart={(e) => handleDragStart(e, index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, index)}
              className={`bg-white border rounded-lg p-4 cursor-move transition-all transform ${
                draggedItem === index 
                  ? "opacity-50 scale-95 rotate-2" 
                  : draggedOverItem === index && draggedItem !== index
                  ? "border-blue-400 shadow-lg"
                  : "hover:shadow-md border-gray-200"
              }`}
            >
              <div className="flex items-center">
                <GripVertical className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                
                <div className="flex-1 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{item.modalityName}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-700">{item.category}</span>
                      </div>
                      <div className="text-sm text-gray-500 mt-0.5">
                        <Timer className="h-3 w-3 inline mr-1" />
                        {item.estimatedTime} minutos
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 font-medium">
                    {formatTime(
                      scheduleItems.slice(0, index).reduce((sum, item) => sum + item.estimatedTime, 0)
                    )} desde el inicio
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {/* Indicador final de drop */}
        {draggedOverItem === scheduleItems.length && (
          <div className="h-1 bg-blue-400 rounded-full my-2 animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">Presentaciones</h3>
            <span className="text-2xl font-bold text-blue-600">{scheduleItems.length}</span>
          </div>
          <p className="text-sm text-blue-700">Total de actos programados</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-green-900">Modalidades</h3>
            <span className="text-2xl font-bold text-green-600">
              {[...new Set(scheduleItems.map(item => item.modalityName))].length}
            </span>
          </div>
          <p className="text-sm text-green-700">Niveles incluidos</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-purple-900">Duración</h3>
            <span className="text-2xl font-bold text-purple-600">{formatTime(calculateTotalTime())}</span>
          </div>
          <p className="text-sm text-purple-700">Tiempo total estimado</p>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`px-6 py-3 rounded-md focus:outline-none focus:ring-2 flex items-center transition-colors ${
            hasChanges
              ? "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          <Save className="h-5 w-5 mr-2" />
          Guardar cambios
        </button>
      </div>
    </div>
  )
}

export default Schedule