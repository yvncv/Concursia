"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus } from "lucide-react";
import useUser from "@/app/firebase/functions";
import EventModal from "@/app/organizer/events/modals/EventModal";
import DeleteEventModal from "@/app/organizer/events/modals/DeleteEventModal";
import { useEventCreation } from "@/app/hooks/useEventCreation";
import { CustomEvent } from "@/app/types/eventType";
import { Timestamp } from "firebase/firestore";
import { EventFormData } from "@/app/types/eventType";
import Link from "next/link";

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const { createEvent, updateEvent, loading: creatingEvent, error: createError } = useEventCreation();
  const { user, loadingUser } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [activeTab, setActiveTab] = useState("general");
  const [eventData, setEventData] = useState<EventFormData>({
    general: {
      name: '',
      description: ''
    },
    dates: {
      startDate: Timestamp.now(), // Inicializa con Timestamp
      endDate: Timestamp.now() // Inicializa con Timestamp
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

  const updateEventData = <K extends keyof EventFormData>(section: K, data: Partial<EventFormData[K]>) => {
    setEventData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const loadingMessage = loadingUser ? "Cargando datos..." : loadingEvents ? "Cargando eventos..." : null;

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

  const handleSaveEvent = async () => {
    if (!user) {
      alert("Usuario no autenticado");
      return;
    }

    const eventToSave = {
      ...eventData,
      dates: {
        startDate: eventData.dates.startDate, // Mantén como Timestamp
        endDate: eventData.dates.endDate, // Mantén como Timestamp
      },
    };

    const { success, message } = selectedEvent
      ? await updateEvent(eventToSave, user, selectedEvent.id)
      : await createEvent(eventToSave, user);

    if (success) {
      alert(selectedEvent ? "Evento actualizado exitosamente" : "Evento creado exitosamente");
      setIsCreateModalOpen(false);
      setSelectedEvent(null);
    } else {
      alert(`Error: ${message}`);
    }
  };

  const handleEvent = (event: CustomEvent, cmd: string) => {
    const levelsWithSelected = Object.entries(event.settings.levels).reduce((acc, [key, value]) => {
      acc[key] = { ...value, selected: true, price: value.price.toString() };
      return acc;
    }, {} as { [key: string]: { selected: boolean; price: string; couple: boolean } });

    setSelectedEvent(event);
    setEventData({
      general: {
        name: event.name,
        description: event.description,
      },
      dates: {
        startDate: event.startDate, // Mantén como Timestamp
        endDate: event.endDate, // Mantén como Timestamp
      },
      details: {
        capacity: event.capacity,
        eventType: event.eventType,
      },
      location: {
        latitude: event.location.coordinates.latitude.toString(),
        longitude: event.location.coordinates.longitude.toString(),
        department: event.location.department,
        district: event.location.district,
        placeName: event.location.placeName,
        province: event.location.province,
        street: event.location.street,
      },
      dance: {
        levels: levelsWithSelected,
        categories: event.settings.categories,
      },
      images: {
        smallImage: event.smallImage,
        bannerImage: event.bannerImage,
        smallImagePreview: event.smallImage,
        bannerImagePreview: event.bannerImage,
      }
    });
    if (cmd == "edit") {
      setIsCreateModalOpen(true)
      setIsViewModalOpen(false)
    } else if (cmd == "view") {
      setIsCreateModalOpen(false)
      setIsViewModalOpen(true)
    } else {
      setIsCreateModalOpen(false)
      setIsViewModalOpen(false)
    }
  };

  const handleDeleteEvent = (event: CustomEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="p-6">
      <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
          Gestión de Eventos
        </h1>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="bg-green-600 hover:bg-green-700 text-white ml-4 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Crear Evento
        </button>
        {loadingEvents ? (
          <div className="flex justify-center items-center h-64">
            <p className="text-gray-600 dark:text-gray-300">Cargando eventos...</p>
          </div>
        ) : error ? (
          <p className="text-red-500 dark:text-red-400">Error: {error}</p>
        ) : events.length === 0 ? (
          <p className="text-gray-500">No hay eventos disponibles para esta academia.</p>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden m-4">
            <div className="overflow-x-auto">
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
                        <Link
                          href={`/organizer/events/${event.id}`}
                          className="hover:text-red-600 transition-colors"
                        >
                          {event.name}
                        </Link>
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
                            onClick={() => handleEvent(event, "view")}  // Make sure this calls the handler correctly
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                            title="Editar"
                            onClick={() => handleEvent(event, "edit")}
                          >
                            <FilePenLine className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                            title="Eliminar"
                            onClick={() => handleDeleteEvent(event)}
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
          </div>
        )}
      </div>


      <EventModal
        isOpen={isCreateModalOpen || isViewModalOpen}  // El modal se abre si cualquiera de estos estados es true
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsViewModalOpen(false);  // Asegúrate de cerrar ambos modales
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventData={eventData}
        updateEventData={updateEventData}
        isEdit={!!selectedEvent && !isViewModalOpen}  // Asegúrate de no permitir la edición cuando esté en solo lectura
        isOnlyRead={isViewModalOpen}  // Solo lectura cuando se está visualizando
      />

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
                    className="px-4 py-3 text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600 text-center"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">
                    {event.name}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300 text-left">
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
                        onClick={() => setSelectedEvent(event)}
                      >
                        <FilePenLine className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                        onClick={() => setSelectedEvent(event)}
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
        <DeleteEventModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          event={selectedEvent}
        />
      )}

      {creatingEvent && <p className="text-gray-600">Creando evento...</p>}
      {createError && <p className="text-red-600">Error: {createError}</p>}
    </div>
  );
};

export default Events;