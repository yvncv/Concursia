"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus, CircleX, Save } from "lucide-react";
import useUser from "@/app/firebase/functions";
import CreateEvent from "../../academy-events/create-event/page";
import GeneralInfo from "./event-creation/GeneralInfo"
import EventDates from "./event-creation/EventDates"
import EventDetails from "./event-creation/EventDetails"
import EventLocation from "./event-creation/EventLocation"
import DanceInfo from "./event-creation/DanceInfo"

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const { user, loadingUser } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  // Loading states
  const loadingMessage =
    loadingUser ? "Cargando datos..." : loadingEvents ? "Cargando eventos..." : null;

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
            <span className="animate-pulse text-red-600 text-lg font-medium">
              {loadingMessage}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Filtrar eventos por academyId
  const filteredEvents = events.filter(
    (event) => event.academyId === user?.academyId
  );

  const tabs = [
    { id: "general", label: "General" },
    { id: "dates", label: "Días" },
    { id: "details", label: "Detalles" },
    { id: "location", label: "Ubicación" },
    { id: "dance", label: "Categoría/Niveles" },
  ]

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestión de Eventos</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Crear Evento
        </button>
      </div>

      {error ? (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
            <p className="text-red-600 text-lg font-medium">Error: {error}</p>
          </div>
        </div>
      ) : filteredEvents.length === 0 ? (
        <p className="text-gray-500">No hay eventos disponibles para esta academia.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Descripción</th>
                <th className="border border-gray-300 px-4 py-2">Fecha Inicio</th>
                <th className="border border-gray-300 px-4 py-2">Fecha Fin</th>
                <th className="border border-gray-300 px-4 py-2">Tipo</th>
                <th className="border border-gray-300 px-4 py-2">Estado</th>
                <th className="border border-gray-300 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredEvents.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{event.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {event.description.length > 50
                      ? `${event.description.substring(0, 50)}...`
                      : event.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(event.startDate.toDate()).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(event.endDate.toDate()).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{event.eventType}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {event.status === "active" ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      title="Visualizar"
                      onClick={() => console.log("Visualizar", event.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      className="text-yellow-500 hover:text-yellow-700 mr-2"
                      title="Editar"
                      onClick={() => console.log("Editar", event.id)}
                    >
                      <FilePenLine />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                      onClick={() => console.log("Eliminar", event.id)}
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Crear Evento */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Crear nuevo evento</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <CircleX size={40} className="text-red-500 hover:text-red-600 transition-colors" />
              </button>
            </div>

            <div className="mb-4">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-green-600 text-green-600" : "text-gray-500"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-4">
              {activeTab === "general" && <GeneralInfo />}
              {activeTab === "dates" && <EventDates />}
              {activeTab === "details" && <EventDetails />}
              {activeTab === "location" && <EventLocation />}
              {activeTab === "dance" && <DanceInfo />}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 flex items-center justify-between  gap-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save size={20}/>
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;