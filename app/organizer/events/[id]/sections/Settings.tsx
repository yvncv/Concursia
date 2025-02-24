"use client"

import type React from "react"
import { useState } from "react"
import type { CustomEvent } from "@/app/types/eventType"
import { SettingsIcon, Layers, Users, Star, Award, MessageCircle, Sliders, ChevronRight } from "lucide-react"

// Importando los módulos de configuración
import General from "./settingsModules/General"
import Categories from "./settingsModules/Categories"
import Participants from "./settingsModules/Participants"
import Evaluations from "./settingsModules/Evaluations"
import Awards from "./settingsModules/Awards"
import Comments from "./settingsModules/Comments"
import Advanced from "./settingsModules/Advanced"

interface SettingsProps {
  event: CustomEvent
}

const Settings: React.FC<SettingsProps> = ({ event }) => {
  const [activeSection, setActiveSection] = useState("general")

  const configSections = [
    { id: "general", title: "Configuración General", icon: SettingsIcon },
    { id: "categories", title: "Categorías", icon: Layers },
    { id: "participants", title: "Participantes", icon: Users },
    { id: "evaluations", title: "Evaluaciones y Puntajes", icon: Star },
    { id: "awards", title: "Premios y Reconocimientos", icon: Award },
    { id: "comments", title: "Comentarios del Público", icon: MessageCircle },
    { id: "advanced", title: "Configuraciones Avanzadas", icon: Sliders },
  ]

  const renderSection = () => {
    switch (activeSection) {
      case "general":
        return <General event={event} />
      case "categories":
        return <Categories event={event}/>
      case "participants":
        return <Participants eventId={event.id}/>
      case "evaluations":
        return <Evaluations event={event}/>
      case "awards":
        return <Awards event={event}/>
      case "comments":
        return <Comments event={event}/>
      case "advanced":
        return <Advanced event={event}/>
      default:
        return null
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
