"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { doc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/app/firebase/config"
import type { CustomEvent, ScheduleItem } from "@/app/types/eventType"
import { CompetitionPhase } from "@/app/types/eventType"
import { 
  GripVertical, 
  Save, 
  Clock, 
  AlertCircle, 
  Calendar, 
  Timer, 
  Flag,
  Award,
  Users,
  Filter,
  Check,
  ChevronDown,
  ChevronUp
} from "lucide-react"

interface ScheduleProps {
  event: CustomEvent
}

// Función para obtener el color basado en la fase
const getPhaseColor = (phase: string) => {
  switch (phase) {
    case CompetitionPhase.ELIMINATORIA:
      return {
        bg: "bg-orange-100",
        text: "text-orange-800",
        border: "border-orange-200"
      }
    case CompetitionPhase.SEMIFINAL:
      return {
        bg: "bg-purple-100",
        text: "text-purple-800",
        border: "border-purple-200"
      }
    case CompetitionPhase.FINAL:
      return {
        bg: "bg-green-100",
        text: "text-green-800",
        border: "border-green-200"
      }
    default:
      return {
        bg: "bg-gray-100",
        text: "text-gray-800",
        border: "border-gray-200"
      }
  }
}

// Componente para renderizar el icono de la fase
const PhaseIcon = ({ phase }: { phase: string }) => {
  switch (phase) {
    case CompetitionPhase.ELIMINATORIA:
      return <Users className="h-4 w-4" />
    case CompetitionPhase.SEMIFINAL:
      return <Flag className="h-4 w-4" />
    case CompetitionPhase.FINAL:
      return <Award className="h-4 w-4" />
    default:
      return <Clock className="h-4 w-4" />
  }
}

const Schedule: React.FC<ScheduleProps> = ({ event }) => {
  const [scheduleItems, setScheduleItems] = useState<ScheduleItem[]>([])
  const [filteredItems, setFilteredItems] = useState<ScheduleItem[]>([])
  const [draggedItem, setDraggedItem] = useState<number | null>(null)
  const [draggedOverItem, setDraggedOverItem] = useState<number | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [filters, setFilters] = useState({
    levelId: "all",
    phase: "all",
    searchTerm: ""
  })
  const [expandedFilters, setExpandedFilters] = useState(false)

  // Cargar los items del cronograma desde el evento
  useEffect(() => {
    console.log("Cargando datos del evento:", event)
    
    if (event.settings?.schedule?.items && Array.isArray(event.settings.schedule.items)) {
      console.log("Items del schedule encontrados:", event.settings.schedule.items)
      
      // Ordenar los items por el campo order
      const sortedItems = [...event.settings.schedule.items].sort((a, b) => a.order - b.order)
      setScheduleItems(sortedItems)
      setFilteredItems(sortedItems)
    } else {
      console.log("No se encontraron items en el schedule o no es un array")
      setScheduleItems([])
      setFilteredItems([])
    }
  }, [event])

  // Filtrar los items cuando cambien los filtros
  useEffect(() => {
    let results = [...scheduleItems]
    
    // Filtrar por nivel (modalidad)
    if (filters.levelId !== "all") {
      results = results.filter(item => item.levelId === filters.levelId)
    }
    
    // Filtrar por fase
    if (filters.phase !== "all") {
      results = results.filter(item => item.phase === filters.phase)
    }
    
    // Filtrar por término de búsqueda
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      results = results.filter(item => 
        item.levelId.toLowerCase().includes(searchLower) || 
        item.category.toLowerCase().includes(searchLower)
      )
    }
    
    setFilteredItems(results)
  }, [filters, scheduleItems])

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

    // Obtener el índice real del item en el array original
    const draggedItemData = filteredItems[draggedItem]
    const originalDraggedIndex = scheduleItems.findIndex(item => item.id === draggedItemData.id)
    const originalDropIndex = scheduleItems.findIndex(item => item.id === filteredItems[dropIndex].id)
    
    // Crear una copia del array original
    const newItems = [...scheduleItems]
    
    // Remover el item arrastrado
    newItems.splice(originalDraggedIndex, 1)
    
    // Insertar en la nueva posición
    if (originalDraggedIndex < originalDropIndex) {
      newItems.splice(originalDropIndex - 1, 0, draggedItemData)
    } else {
      newItems.splice(originalDropIndex, 0, draggedItemData)
    }
    
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
    if (!event.id) {
      console.error("No se puede guardar: ID de evento no disponible")
      return
    }
    
    setIsSaving(true)
    
    try {
      const eventRef = doc(db, "eventos", event.id)
      
      await updateDoc(eventRef, {
        "settings.schedule.items": scheduleItems,
        "settings.schedule.lastUpdated": Timestamp.now(),
        "updatedAt": Timestamp.now()
      })
      
      console.log("Cronograma guardado exitosamente")
      setHasChanges(false)
    } catch (error) {
      console.error("Error al guardar el cronograma:", error)
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setIsSaving(false)
    }
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
    return filteredItems.reduce((total, item) => total + (item.estimatedTime || 0), 0)
  }

  // Función para obtener el nombre descriptivo de una fase
  const getPhaseLabel = (phase: string): string => {
    switch (phase) {
      case CompetitionPhase.ELIMINATORIA:
        return "Eliminatorias"
      case CompetitionPhase.SEMIFINAL:
        return "Semifinal"
      case CompetitionPhase.FINAL:
        return "Final"
      default:
        return phase
    }
  }

  // Función para obtener niveles únicos para el filtro
  const getUniqueLevels = (): { id: string, name: string }[] => {
    const uniqueLevels = new Map<string, string>()
    
    scheduleItems.forEach(item => {
      uniqueLevels.set(item.levelId, item.levelId.charAt(0).toUpperCase() + item.levelId.slice(1))
    })
    
    return Array.from(uniqueLevels).map(([id, name]) => ({ id, name }))
  }

  // No hay items configurados
  if (scheduleItems.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600 text-lg mb-2">No hay items en el cronograma</p>
        <p className="text-gray-500 text-sm mb-4">
          El cronograma se genera automáticamente basado en las modalidades y categorías configuradas.
          Utilice la herramienta de actualización para generar los items.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-3 justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 mb-1">
            Cronograma del Evento
          </h2>
          <p className="text-gray-600">
            Arrastra y suelta para reorganizar el orden de las presentaciones
          </p>
        </div>
        <div className="bg-blue-50 px-4 py-3 rounded-lg border border-blue-100 flex items-center">
          <Clock className="h-5 w-5 text-blue-600 mr-2" />
          <div>
            <div className="text-sm text-blue-700">Tiempo total estimado</div>
            <div className="text-xl font-bold text-blue-800">{formatTime(calculateTotalTime())}</div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <button 
            className="flex items-center justify-between w-full text-left"
            onClick={() => setExpandedFilters(!expandedFilters)}
          >
            <div className="flex items-center">
              <Filter className="h-5 w-5 text-gray-500 mr-2" />
              <span className="font-medium text-gray-700">Filtros</span>
              {(filters.levelId !== "all" || filters.phase !== "all" || filters.searchTerm) && (
                <span className="ml-2 px-1.5 py-0.5 text-xs rounded-full bg-blue-100 text-blue-800">
                  Activo
                </span>
              )}
            </div>
            {expandedFilters ? (
              <ChevronUp className="h-5 w-5 text-gray-500" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-500" />
            )}
          </button>
        </div>
        
        {expandedFilters && (
          <div className="p-4 bg-gray-50">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Modalidad</label>
                <select
                  value={filters.levelId}
                  onChange={(e) => setFilters({...filters, levelId: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Todas las modalidades</option>
                  {getUniqueLevels().map((level) => (
                    <option key={level.id} value={level.id}>
                      {level.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fase</label>
                <select
                  value={filters.phase}
                  onChange={(e) => setFilters({...filters, phase: e.target.value})}
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="all">Todas las fases</option>
                  <option value={CompetitionPhase.ELIMINATORIA}>Eliminatorias</option>
                  <option value={CompetitionPhase.SEMIFINAL}>Semifinal</option>
                  <option value={CompetitionPhase.FINAL}>Final</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Buscar</label>
                <input
                  type="text"
                  value={filters.searchTerm}
                  onChange={(e) => setFilters({...filters, searchTerm: e.target.value})}
                  placeholder="Buscar por nombre..."
                  className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div className="mt-3 flex justify-between">
              <div className="text-sm text-gray-600">
                Mostrando {filteredItems.length} de {scheduleItems.length} items
              </div>
              {(filters.levelId !== "all" || filters.phase !== "all" || filters.searchTerm) && (
                <button
                  onClick={() => setFilters({ levelId: "all", phase: "all", searchTerm: "" })}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Limpiar filtros
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="max-h-[600px] overflow-y-auto pr-2 space-y-2">
        {filteredItems.map((item, index) => {
          const phaseColors = getPhaseColor(item.phase)
          
          return (
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
                    ? "opacity-50 scale-95 rotate-1" 
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
                        <div className="flex items-center flex-wrap gap-2">
                          <span className="font-medium text-gray-900">
                            {item.levelId.charAt(0).toUpperCase() + item.levelId.slice(1)}
                          </span>
                          
                          <span className="text-gray-500">•</span>
                          
                          <span className="text-gray-700">
                            {item.category}
                          </span>
                          
                          <span 
                            className={`${phaseColors.bg} ${phaseColors.text} px-2 py-0.5 rounded-md text-sm font-medium flex items-center`}
                          >
                            <PhaseIcon phase={item.phase} />
                            <span className="ml-1">{getPhaseLabel(item.phase)}</span>
                          </span>
                        </div>
                        <div className="text-sm text-gray-500 mt-1">
                          <Timer className="h-3 w-3 inline mr-1" />
                          {item.estimatedTime ? `${item.estimatedTime} minutos` : "Tiempo no definido"}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-sm text-gray-500 font-medium">
                      {formatTime(
                        filteredItems.slice(0, index).reduce((sum, item) => sum + (item.estimatedTime || 0), 0)
                      )} desde el inicio
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
        
        {/* Indicador final de drop */}
        {draggedOverItem === filteredItems.length && (
          <div className="h-1 bg-blue-400 rounded-full my-2 animate-pulse" />
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-blue-900">Presentaciones</h3>
            <span className="text-2xl font-bold text-blue-600">{filteredItems.length}</span>
          </div>
          <p className="text-sm text-blue-700">Total de actos programados</p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-green-900">Modalidades</h3>
            <span className="text-2xl font-bold text-green-600">
              {[...new Set(filteredItems.map(item => item.levelId))].length}
            </span>
          </div>
          <p className="text-sm text-green-700">Niveles incluidos</p>
        </div>
        
        <div className="bg-amber-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-amber-900">Categorías</h3>
            <span className="text-2xl font-bold text-amber-600">
              {[...new Set(filteredItems.map(item => `${item.levelId}-${item.category}`))].length}
            </span>
          </div>
          <p className="text-sm text-amber-700">Categorías distintas</p>
        </div>
        
        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-medium text-purple-900">Duración</h3>
            <span className="text-2xl font-bold text-purple-600">{formatTime(calculateTotalTime())}</span>
          </div>
          <p className="text-sm text-purple-700">Tiempo total estimado</p>
        </div>
      </div>

      {/* Botones de acción - Movidos al final como en el componente General */}
      {hasChanges && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              onClick={() => {
                // Reset changes - cargar de nuevo los items desde el evento
                if (event.settings?.schedule?.items) {
                  const sortedItems = [...event.settings.schedule.items].sort((a, b) => a.order - b.order);
                  setScheduleItems(sortedItems);
                  setFilteredItems(sortedItems);
                }
                setHasChanges(false);
              }}
              className="px-6 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors duration-150"
              disabled={isSaving}
            >
              Descartar cambios
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-150 disabled:bg-blue-400"
              disabled={isSaving}
            >
              {isSaving ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Guardando...
                </span>
              ) : "Guardar cambios"}
            </button>
          </div>
          <p className="text-sm text-yellow-600 mt-3 text-right">
            ⚠️ Tienes cambios sin guardar
          </p>
        </div>
      )}
    </div>
  )
}

export default Schedule