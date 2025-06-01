"use client"

import type React from "react"
import { useState, useEffect } from "react"
import type { CustomEvent, LevelConfig } from "@/app/types/eventType"
import { Save, Grid3x3, Hash, Info, Gavel, Layout, AlertCircle, User } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/app/firebase/config"

interface ModalityProps {
  event: CustomEvent
  modalityId: string
  modalityTitle: string
}

const Modality: React.FC<ModalityProps> = ({ event, modalityId, modalityTitle }) => {
  // Estado para la configuración
  const [config, setConfig] = useState<LevelConfig | null>(null)
  const [hasChanges, setHasChanges] = useState(false)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Cargar la configuración existente cuando cambia la modalidad
  useEffect(() => {
    setIsLoading(true)
    try {
      // Obtener la configuración existente de la modalidad seleccionada
      if (event?.dance?.levels?.[modalityId]?.config) {
        setConfig(event.dance.levels[modalityId].config as LevelConfig)
      } else {
        console.warn(`No se encontró configuración para la modalidad ${modalityId}. Esto no debería suceder.`)
      }
    } catch (error) {
      console.error("Error al cargar la configuración:", error)
    } finally {
      setHasChanges(false)
      setSaveError(null)
      setIsLoading(false)
    }
  }, [event, modalityId])

  // Calcular el máximo de pistas permitido basado en el número de bloques
  const getMaxTracksPerBlock = () => {
    if (!config) return 6
    return config.blocks === 1 ? 6 : 4
  }

  // Ajustar pistas si se excede el máximo al cambiar bloques
  useEffect(() => {
    if (config && config.blocks > 1 && config.tracksPerBlock > 4) {
      setConfig({ ...config, tracksPerBlock: 4 })
      setHasChanges(true)
    }
  }, [config?.blocks, config?.tracksPerBlock])

  const handleInputChange = (field: keyof LevelConfig, value: number | string) => {
    if (!config) return

    if (field === 'tracksPerBlock') {
      const numValue = parseInt(value as string) || 1
      const maxAllowed = config.blocks === 1 ? 6 : 4
      const finalValue = Math.min(Math.max(1, numValue), maxAllowed)
      setConfig({ ...config, [field]: finalValue })
    } else {
      setConfig({ ...config, [field]: value })
    }
    setHasChanges(true)
  }

  const handleSave = async () => {
    if (!config) return

    setSaving(true)
    setSaveError(null)

    try {
      console.log("Guardando configuración de", modalityTitle, config)
      
      // Referencia al documento del evento
      const eventRef = doc(db, "eventos", event.id)
      
      // Crear un objeto actualizado para los niveles
      const updatedLevels = { ...event.dance.levels }
      
      // Actualizar la configuración de esta modalidad específica
      updatedLevels[modalityId] = {
        ...updatedLevels[modalityId],
        config: config
      }
      
      // Actualizar el documento en Firestore
      await updateDoc(eventRef, {
        "dance.levels": updatedLevels,
        "updatedAt": new Date() // Actualizar la fecha de última modificación
      })
      
      setHasChanges(false)
      console.log("Configuración guardada exitosamente")
    } catch (error) {
      console.error("Error al guardar:", error)
      setSaveError("Ocurrió un error al guardar la configuración. Intenta nuevamente.")
    } finally {
      setSaving(false)
    }
  }

  const calculateTotalSpaces = () => {
    if (!config) return 0
    return config.blocks * config.tracksPerBlock
  }

  const getJudgesVisualization = (isTopRow: boolean, judgesForThisSection: number) => {
    if (!config) return null
    
    const totalJudges = judgesForThisSection
    const judgesInRow = isTopRow
      ? Math.ceil(totalJudges / 2)
      : Math.floor(totalJudges / 2)

    return Array.from({ length: judgesInRow }, (_, i) => {
      const judgeIndex = isTopRow ? i : Math.ceil(totalJudges / 2) + i
      return (
        <div
          key={`judge-${judgeIndex}`}
          className="w-12 h-12 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center"
          title={`Jurado ${judgeIndex + 1}`}
        >
          <User className="w-6 h-6 text-purple-700" />
        </div>
      )
    })
  }

  const getSpaceVisualization = () => {
    if (!config) return null

    if (config.blocks === 1) {
      // Visualización para un solo bloque con jurados (HORIZONTAL)
      return (
        <div className="w-full max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            {/* Jurados superiores */}
            <div className="flex justify-center gap-3 mb-4">
              {Array.from({ length: Math.ceil(config.judgesCount / 2) }, (_, i) => (
                <div
                  key={`judge-top-${i}`}
                  className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center"
                  title={`Jurado ${i + 1}`}
                >
                  <User className="w-5 h-5 text-purple-700" />
                </div>
              ))}
            </div>

            {/* Pista horizontal */}
            <div className="border-4 border-gray-800 rounded-lg overflow-hidden w-full">
              <div className="flex">
                {Array.from({ length: config.tracksPerBlock }, (_, i) => (
                  <div
                    key={i}
                    className={`h-48 bg-blue-50 flex-1 flex items-center justify-center font-medium text-gray-700 hover:bg-blue-100 transition-colors ${i > 0 ? 'border-l-2 border-gray-800' : ''
                      }`}
                  >
                    PISTA {i + 1}
                  </div>
                ))}
              </div>
            </div>

            {/* Jurados inferiores */}
            <div className="flex justify-center gap-3 mt-4">
              {Array.from({ length: Math.floor(config.judgesCount / 2) }, (_, i) => (
                <div
                  key={`judge-bottom-${i}`}
                  className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center"
                  title={`Jurado ${Math.ceil(config.judgesCount / 2) + i + 1}`}
                >
                  <User className="w-5 h-5 text-purple-700" />
                </div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    // Visualización para múltiples bloques
    const gridCols = {
      1: 'flex justify-center',
      2: 'grid grid-cols-2',
      3: 'grid grid-cols-3',
      4: 'grid grid-cols-4',
    }

    // Usar siempre el número de jurados configurado
    const judgesPerBlock = config.judgesCount

    return (
      <div className="w-full max-w-7xl mx-auto">
        {/* Contenedor de bloques con jurados */}
        <div className={`${gridCols[config.blocks]} gap-4`}>
          {Array.from({ length: config.blocks }, (_, b) => (
            <div key={b} className="flex flex-col items-center">
              {/* Título del bloque */}
              <div className="font-semibold text-gray-700 text-sm mb-2">
                BLOQUE {String.fromCharCode(65 + b)}
              </div>

              {/* Bloque con jurados */}
              <div className="flex items-center justify-center gap-2">
                {/* Jurados a la izquierda */}
                <div className="flex flex-col gap-2">
                  {Array.from({ length: judgesPerBlock }, (_, j) => (
                    <div
                      key={`judge-${b}-${j}`}
                      className="w-10 h-10 rounded-full bg-purple-100 border-2 border-purple-600 flex items-center justify-center"
                      title={`Jurado ${j + 1} - Bloque ${String.fromCharCode(65 + b)}`}
                    >
                      <User className="w-5 h-5 text-purple-700" />
                    </div>
                  ))}
                </div>

                {/* Bloque de pistas */}
                <div className="border-3 border-gray-800 rounded-lg overflow-hidden bg-white min-w-[120px]">
                  {Array.from({ length: config.tracksPerBlock }, (_, trackIndex) => (
                    <div
                      key={`${b}-${trackIndex}`}
                      className={`h-14 bg-blue-50 flex items-center justify-center text-sm font-medium text-gray-700 hover:bg-blue-100 transition-colors ${trackIndex > 0 ? 'border-t-2 border-gray-800' : ''
                        }`}
                    >
                      <span>PISTA {trackIndex + 1}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Mostrar indicador de carga mientras se obtiene la configuración
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 w-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  // Si no hay configuración, mostrar mensaje de error
  if (!config) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center p-6 bg-red-50 border border-red-200 rounded-lg">
          <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-red-800 mb-2">Error de configuración</h3>
          <p className="text-red-700">
            No se encontró la configuración para la modalidad <strong>{modalityTitle}</strong>.
            Por favor, contacta al administrador del sistema.
          </p>
        </div>
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
          Define cómo se dividirá la pista para las presentaciones de esta modalidad
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* División en bloques */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block mb-3">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Layout className="h-4 w-4 mr-2 text-blue-600" />
              División en bloques
            </div>
            <input
              type="number"
              value={config.blocks}
              onChange={(e) => handleInputChange('blocks', Math.min(4, Math.max(1, parseInt(e.target.value) || 1)))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max="4"
            />
            <p className="text-sm text-gray-500 mt-2">
              Divide la pista en secciones grandes <span className="font-medium text-gray-700">(máx. 4 bloques)</span>
            </p>
          </label>
        </div>

        {/* Pistas por bloque */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block mb-3">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Grid3x3 className="h-4 w-4 mr-2 text-green-600" />
              Pistas por bloque
            </div>
            <input
              type="number"
              value={config.tracksPerBlock}
              onChange={(e) => handleInputChange('tracksPerBlock', parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max={getMaxTracksPerBlock()}
            />
            <p className="text-sm text-gray-500 mt-2">
              Espacios dentro de cada bloque
              <span className="font-medium text-gray-700">
                (máx. {getMaxTracksPerBlock()})
              </span>
            </p>
          </label>
        </div>

        {/* Número de jurados */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <label className="block mb-3">
            <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Gavel className="h-4 w-4 mr-2 text-purple-600" />
              {config.blocks === 1 ? "Número de jurados" : "Jurados por bloque"}
            </div>
            <input
              type="number"
              value={config.judgesCount}
              onChange={(e) => handleInputChange('judgesCount', Math.max(1, parseInt(e.target.value) || 1))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1"
              max={config.blocks === 1 ? 8 : config.tracksPerBlock}
            />
            <p className="text-sm text-gray-500 mt-2">
              {config.blocks === 1
                ? `Cantidad de jurados evaluando esta modalidad (máx. 8)`
                : `Jurados evaluando en cada bloque (máx. ${config.tracksPerBlock})`}
            </p>
          </label>
        </div>
      </div>

      {/* Alerta sobre presentación simultánea */}
      {config.blocks > 1 && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex items-start">
          <AlertCircle className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-blue-800 font-medium">Presentación simultánea</p>
            <p className="text-blue-700 text-sm">
              Con {config.blocks} bloques, todos los participantes bailarán al mismo tiempo.
              Se presentarán {calculateTotalSpaces()} participantes simultáneamente.
            </p>
            <p className="text-blue-700 text-sm mt-1">
              Jurados asignados: {config.judgesCount} por bloque
              (Total: {config.blocks * config.judgesCount})
            </p>
          </div>
        </div>
      )}

      {/* Visualización de la distribución */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-4">
          Visualización de la pista
        </h3>
        <div className="flex justify-center mb-4">
          {getSpaceVisualization()}
        </div>
        <p className="text-sm text-gray-600 text-center">
          Vista de cómo se dividirá la pista del coliseo
        </p>
      </div>

      {/* Resumen de configuración */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="font-semibold text-lg text-gray-800 mb-4 flex items-center">
          <Hash className="h-5 w-5 mr-2" />
          Resumen de configuración
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{calculateTotalSpaces()}</div>
            <div className="text-sm text-gray-600">
              Espacios totales
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{config.blocks}</div>
            <div className="text-sm text-gray-600">Bloques</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {config.blocks === 1
                ? config.judgesCount
                : config.blocks * config.judgesCount
              }
            </div>
            <div className="text-sm text-gray-600">Jurados totales</div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-gray-50 rounded">
          <p className="text-sm text-gray-700">
            <strong>Capacidad por tanda:</strong> {calculateTotalSpaces()} participantes
            {config.blocks > 1 && " (bailando simultáneamente)"}
          </p>
          {config.blocks > 1 && (
            <p className="text-sm text-gray-700 mt-1">
              <strong>Distribución de jurados:</strong> {config.judgesCount} por bloque
            </p>
          )}
        </div>
      </div>

      {/* Notas adicionales */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <label className="block">
          <div className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <Info className="h-4 w-4 mr-2 text-indigo-600" />
            Notas adicionales
          </div>
          <textarea
            value={config.notes || ''}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={3}
            placeholder="Observaciones específicas para esta modalidad..."
          />
        </label>
      </div>

      {/* Estado y botón de guardar */}
      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-yellow-800">
            Tienes cambios sin guardar en la configuración de {modalityTitle}
          </p>
        </div>
      )}
      
      {saveError && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
          <p className="text-red-800">{saveError}</p>
        </div>
      )}

      <div className="flex justify-end gap-3">
        {hasChanges && (
          <button
            onClick={() => {
              // Restaurar la configuración original
              if (event.dance.levels[modalityId]?.config) {
                setConfig(event.dance.levels[modalityId].config as LevelConfig)
                setHasChanges(false)
              }
            }}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancelar
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={!hasChanges || saving}
          className={`px-6 py-3 rounded-md flex items-center transition-colors ${hasChanges && !saving
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
        >
          <Save className="h-4 w-4 mr-2" />
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </div>
  )
}

export default Modality