"use client"

import type React from "react"
import { useState } from "react"
import type { CustomEvent } from "@/app/types/eventType"
import { SettingsIcon, Layers, CalendarClock, ChevronRight } from "lucide-react"

// Importando los módulos de configuración
import General from "./settingsModules/General"
import Schedule from "./settingsModules/Schedule"
import Modality from "./settingsModules/Modality"

interface SettingsProps {
  event: CustomEvent
}

const Settings: React.FC<SettingsProps> = ({ event }) => {
  const [activeSection, setActiveSection] = useState("general")

  // Configuración base con secciones fijas
  const baseConfigSections = [
    { id: "general", title: "Configuración General", icon: SettingsIcon },
    { id: "cronograma", title: "Cronograma", icon: CalendarClock },
  ]

  // Crear secciones dinámicas basadas en los niveles del evento
  const levelSections = Object.entries(event.dance.levels)
    .map(([levelId, _]) => ({
      id: levelId,
      title: levelId.charAt(0).toUpperCase() + levelId.slice(1), // Capitalizar el título
      icon: Layers
    }))

  // Debug para ver qué niveles hay
  console.log("Niveles del evento:", event.dance.levels)
  console.log("Secciones de nivel generadas:", levelSections)

  // Combinar secciones base con secciones de niveles
  const configSections = [...baseConfigSections, ...levelSections]

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <General eventId={event.id} />
      case "cronograma":
        return <Schedule event={event} />
      default:
        // Para cualquier sección de nivel, usar el componente Modality genérico
        if (event.dance.levels[activeSection]) {
          return (
            <Modality 
              event={event}
              modalityId={activeSection}
              modalityTitle={activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            />
          )
        }
        return (
          <div className="text-center py-8">
            <p className="text-gray-600">Sección no encontrada</p>
          </div>
        )
    }
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Configuraciones del Evento</h1>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            {configSections.map((section) => (
              <button
                key={section.id}
                className={`w-full text-left px-4 py-3 flex items-center justify-between transition-colors ${
                  activeSection === section.id
                    ? "bg-blue-50 text-blue-600 border-l-4 border-blue-600"
                    : "hover:bg-gray-50"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="flex items-center">
                  <section.icon className="h-5 w-5 mr-3" />
                  <span>{section.title}</span>
                </div>
                {activeSection === section.id && <ChevronRight className="h-5 w-5" />}
              </button>
            ))}
          </div>
        </div>
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings