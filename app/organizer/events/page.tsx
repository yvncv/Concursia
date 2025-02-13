"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus } from "lucide-react";
import useUser from "@/app/firebase/functions";
import GeneralInfo from "./event-creation/GeneralInfo"
import EventDates from "./event-creation/EventDates"
import EventDetails from "./event-creation/EventDetails"
import EventLocation from "./event-creation/EventLocation"
import DanceInfo from "./event-creation/DanceInfo"
import EventModal from "./modals/ReadEventModal";
import EditEventModal from "./modals/EditEventModal";
import DeleteEventModal from "./modals/DeleteEventModal";
import { Event } from "@/app/types/eventType";
import useAcademy from "@/app/hooks/useAcademy";

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const { user, loadingUser } = useUser();
  const { academy, loadingAcademy } = useAcademy(user?.academyId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<Event | null>(null);
  const [selectedEventToDelete, setSelectedEventToDelete] = useState<Event | null>(null);

  // Loading states
  const loadingMessage =
    loadingUser ? "Cargando datos..." : loadingEvents ? "Cargando eventos..." : loadingAcademy ? "Cargando eventos..." : null;

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
  const filteredEvents = events?.filter(
    (event) => event.academyId === user?.academyId
  ) || [];

  const tabs = [
    { id: "general", label: "General" },
    { id: "dates", label: "Dates" },
    { id: "details", label: "Details" },
    { id: "location", label: "Location" },
    { id: "dance", label: "Dance" },
  ]

  return (
    <>
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">Gestión de Eventos de la Academia {academy?.name}</h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors mb-6"
        >
          <Plus size={20} />
          Crear Evento
        </button>
        {error ? (
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-lg text-center">
              <p className="text-red-600 text-lg font-medium">Error: {error}</p>
            </div>
          </div>
        ) : filteredEvents.length === 0 ? (
          <p className="text-gray-500">No hay eventos disponibles para esta academia.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <table className="w-full border-collapse">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  {["Nombre", "Descripción", "Fecha Inicio", "Fecha Fin", "Tipo", "Estado", "Acciones"].map((header) => (
                    <th
                      key={header}
                      className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y dark:divide-gray-700">
                {filteredEvents.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {event.name}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      {event.description.length > 50
                        ? `${event.description.substring(0, 50)}...`
                        : event.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(event.startDate.toDate()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      {new Date(event.endDate.toDate()).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                      {event.eventType}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === "active"
                          ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                          }`}
                      >
                        {event.status === "active" ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center space-x-2">
                        <button
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                          title="Visualizar"
                          onClick={() => setSelectedEvent(event)}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        <button
                          className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                          title="Editar"
                          onClick={() => setSelectedEventToEdit(event)}
                        >
                          <FilePenLine className="w-5 h-5" />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                          title="Eliminar"
                          onClick={() => setSelectedEventToDelete(event)}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {selectedEventToEdit && (
        <EditEventModal event={selectedEventToEdit} onClose={() => setSelectedEventToEdit(null)} />
      )}
      {selectedEventToDelete && (
        <DeleteEventModal event={selectedEventToDelete} onClose={() => setSelectedEventToDelete(null)} />
      )}

      {/* Modal de Crear Evento */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Create New Event</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mb-4">
              <div className="flex border-b">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-4 py-2 ${activeTab === tab.id ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500"
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
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Save Event
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;