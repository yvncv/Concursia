import React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface GeneralProps {
  event: CustomEvent
}

const General: React.FC<GeneralProps> = ({ event }) => {
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-2">Configuración General</h2>
      <p className="text-gray-600 mb-4">Ajusta la información básica del evento.</p>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Nombre del Evento</label>
        <input
          type="text"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          defaultValue={event.name}
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Descripción</label>
        <textarea
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          rows={3}
          defaultValue={event.description}
        ></textarea>
      </div>
    </div>
  )
}

export default General
