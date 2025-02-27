"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2 } from "lucide-react";
import { CustomEvent } from "@/app/types/eventType";
import EventModal from "./modals/ReadEventModal";
import EditEventModal from "./modals/EditEventModal";
import DeleteEventModal from "./modals/DeleteEventModal";

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [selectedEventToEdit, setSelectedEventToEdit] = useState<CustomEvent | null>(null);
  const [selectedEventToDelete, setSelectedEventToDelete] = useState<CustomEvent | null>(null);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Gestión de Eventos
      </h1>

      {loadingEvents ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Cargando eventos...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
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
              {events.map((event) => (
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
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        event.status === "active"
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

      {selectedEvent && (
        <EventModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
      )}
      {selectedEventToEdit && (
        <EditEventModal event={selectedEventToEdit} onClose={() => setSelectedEventToEdit(null)} />
      )}
      {selectedEventToDelete && (
        <DeleteEventModal event={selectedEventToDelete} onClose={() => setSelectedEventToDelete(null)} />
      )}
    </div>
  );
};

export default Events;
