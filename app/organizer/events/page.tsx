"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus, CircleX, Save } from "lucide-react";
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
  const { createEvent, loading: creatingEvent, error: createError } = useEventCreation();
  const { user, loadingUser } = useUser();
  const { academy, loadingAcademy } = useAcademy(user?.academyId);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [eventData, setEventData] = useState<EventFormData>({
    general: {
      name: '',
      description: ''
    },
    dates: {
      startDate: '',
      endDate: ''
    },
    details: {
      capacity: '',
      eventType: ''
    },
    location: {
      latitude: '',
      longitude: '',
      department: '',
      district: '',
      placeName: '',
      province: '',
      street: ''
    },
    dance: {
      levels: {},
      categories: []
    },
    images: {
      smallImage: '',
      bannerImage: '',
      smallImagePreview: '',
      bannerImagePreview: ''
    }
  });

  const updateEventData = (section: 'general' | 'dates' | 'details' | 'location' | 'dance' | 'images', data: any) => {
    setEventData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        ...data
      }
    }));
  };

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

  const handleCreateEvent = async () => {
    if (!user) {
      alert("Usuario no autenticado");
      return;
    }

    const { success, message } = await createEvent(eventData, user);

    if (success) {
      alert("Evento creado exitosamente");
      setIsCreateModalOpen(false);  // Cierra el modal
    } else {
      alert(`Error: ${message}`);
    }
  };

  const tabs = [
    { id: "general", label: "General" },
    { id: "dates", label: "Días" },
    { id: "details", label: "Detalles" },
    { id: "location", label: "Ubicación" },
    { id: "dance", label: "Categoría/Niveles" },
    { id: "images", label: "Imágenes" },
  ];

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
          <div className="bg-white rounded-lg p-6 w-full max-w-3xl max-h-[75vh] overflow-y-auto m-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Crear nuevo evento</h2>
              <button onClick={() => setIsCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                <CircleX size={40} className="text-red-500 hover:text-red-600 transition-colors" />
              </button>
            </div>

            <div className="mb-4 overflow-x-auto">
              <div className="flex border-b w-max">
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
              {activeTab === "general" &&
                <GeneralInfo
                  data={eventData.general}
                  updateData={(data) => updateEventData('general', data)}
                />}
              {activeTab === "dates" &&
                <EventDates
                  data={eventData.dates}
                  updateData={(data) => updateEventData('dates', data)}
                />}
              {activeTab === "details" &&
                <EventDetails
                  data={eventData.details}
                  updateData={(data) => updateEventData('details', data)}
                />}
              {activeTab === "location" &&
                <EventLocation
                  data={eventData.location}
                  updateData={(data) => updateEventData('location', data)}
                />}
              {activeTab === "dance" &&
                <DanceInfo
                  data={eventData.dance}
                  updateData={(data) => updateEventData('dance', data)}
                />
              }
              {activeTab === "images" &&
                <EventImages
                  data={eventData.images}
                  updateData={(data) => updateEventData('images', data)}
                />
              }
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleCreateEvent}
                className="px-4 py-2 flex items-center justify-between gap-2 bg-green-600 text-white rounded hover:bg-green-700"
              >
                <Save size={20} />
                Guardar Evento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Events;