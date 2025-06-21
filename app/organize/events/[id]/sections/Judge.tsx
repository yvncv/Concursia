"use client"

import type React from "react"
import type { CustomEvent } from "@/app/types/eventType"

interface SettingsProps {
  event: CustomEvent
}

const Judge: React.FC<SettingsProps> = ({ event }) => {

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Calificación del Evento</h1>
      <div className="grid md:grid-cols-3 gap-6">
       
      </div>
    </div>
  )
}

export default Judge