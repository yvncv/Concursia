"use client";
import React, { useState } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus } from "lucide-react";
import useUser from "@/app/firebase/functions";
import EventModal from "@/app/organizer/events/modals/EventModal";
import DeleteEventModal from "@/app/organizer/events/modals/DeleteEventModal";
import { useEventCreation } from "@/app/hooks/useEventCreation";
import { CustomEvent } from "@/app/types/eventType";
import {Timestamp} from "firebase/firestore";

interface GeneralData {
  name: string;
  description: string;
}

interface DatesData {
  startDate: Timestamp;
  endDate: Timestamp;
}

interface DetailsData {
  capacity: string;
  eventType: string;
}

interface LocationData {
  latitude: string;
  longitude: string;
  department: string;
  district: string;
  placeName: string;
  province: string;
  street: string;
}

interface DanceData {
  levels: {
    [key: string]: {
      selected: boolean;
      price: string;
      couple: boolean;
    };
  };
  categories: string[];
}

interface ImagesData {
  smallImage: string | File;
  bannerImage: string | File;
  smallImagePreview?: string;
  bannerImagePreview?: string;
}

interface EventFormData {
  general: GeneralData;
  dates: DatesData;
  details: DetailsData;
  location: LocationData;
  dance: DanceData;
  images: ImagesData;
}

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const { createEvent, updateEvent, loading: creatingEvent, error: createError } = useEventCreation();
  const { user, loadingUser } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
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

  const filteredEvents = events.filter(
      (event) => event.academyId === user?.academyId
  );

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

  const handleEditEvent = (event: CustomEvent) => {
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
    setIsCreateModalOpen(true);
  };



  const handleDeleteEvent = (event: CustomEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

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
                            onClick={() => handleEditEvent(event)}
                        >
                          <FilePenLine/>
                        </button>
                        <button
                            className="text-red-500 hover:text-red-700"
                            title="Eliminar"
                            onClick={() => handleDeleteEvent(event)}
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

        <EventModal
            isOpen={isCreateModalOpen}
            onClose={() => {
              setIsCreateModalOpen(false);
              setSelectedEvent(null);
            }}
            onSave={handleSaveEvent}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            eventData={eventData}
            updateEventData={updateEventData}
            isEdit={!!selectedEvent}
        />

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