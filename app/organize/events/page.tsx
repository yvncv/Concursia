"use client";
import React, { useState, useEffect } from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2, Plus, CheckCircle, Search, Filter, Calendar, X } from "lucide-react";
import useUser from "@/app/hooks/useUser";
import EventModal from "@/app/organize/events/modals/EventModal";
import DeleteEventModal from "@/app/organize/events/modals/DeleteEventModal";
import { useEventCreation } from "@/app/hooks/useEventCreation";
import { CustomEvent, LevelData } from "@/app/types/eventType";
import { Timestamp } from "firebase/firestore";
import { EventFormData } from "@/app/types/eventType";
import Link from "next/link";

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();
  const {
    createEvent,
    updateEvent,
    loading: creatingEvent,
    error: createError,
  } = useEventCreation();
  const { user, loadingUser } = useUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CustomEvent | null>(null);
  const [activeTab, setActiveTab] = useState("general");

  // Estados para búsqueda y filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filteredEvents, setFilteredEvents] = useState<CustomEvent[]>([]);
  const [eventTypes, setEventTypes] = useState<string[]>([]);

  const [eventData, setEventData] = useState<EventFormData>({
    general: {
      name: "",
      description: "",
      status: "",
    },
    dates: {
      startDate: Timestamp.now(),
      endDate: Timestamp.now()
    },
    details: {
      capacity: "",
      eventType: "",
    },
    location: {
      latitude: "",
      longitude: "",
      department: "",
      district: "",
      placeName: "",
      province: "",
      street: "",
    },
    dance: {
      levels: {},
    },
    images: {
      smallImage: '',
      bannerImage: '',
      smallImagePreview: '',
      bannerImagePreview: ''
    },
    settings: {
      inscription: {
        groupEnabled: false,
        individualEnabled: false,
        onSiteEnabled: false,
      },
      registration: {
        grupalCSV: false,
        individualWeb: false,
        sameDay: false
      },
      pullCouple: {
        enabled: false,
        criteria: "Category",
        difference: 0
      }
    }
  });

  // Efecto para filtrar los eventos basados en los criterios de búsqueda y filtrado
  useEffect(() => {
    if (!user || loadingEvents) return;

    // Filtrar primero por academia
    let filtered = events.filter((event) => event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId) || event.staff?.some(s => s.userId === user?.id)); // en firebase el type está desactualizado

    // Extraer los tipos de eventos únicos para el selector de filtros
    const types = [...new Set(filtered.map(e => e.eventType))];
    setEventTypes(types);

    // Aplicar búsqueda por texto
    if (searchTerm.trim() !== "") {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        event =>
          event.name.toLowerCase().includes(term) ||
          event.description.toLowerCase().includes(term)
      );
    }

    // Aplicar filtro por estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    // Aplicar filtro por tipo
    if (typeFilter !== "all") {
      filtered = filtered.filter(event => event.eventType === typeFilter);
    }

    // Aplicar filtro por fecha de inicio
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(event => {
        const eventStart = event.startDate.toDate();
        return eventStart >= startDate;
      });
    }

    // Aplicar filtro por fecha de fin
    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(event => {
        const eventEnd = event.endDate.toDate();
        return eventEnd <= endDate;
      });
    }

    setFilteredEvents(filtered);
  }, [events, user, searchTerm, statusFilter, typeFilter, startDateFilter, endDateFilter, loadingEvents]);

  const updateEventData = <K extends keyof EventFormData>(section: K, data: Partial<EventFormData[K]>) => {
    setEventData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data },
    }));
  };

  const loadingMessage = loadingUser ? "Cargando datos..." : loadingEvents ? "Cargando eventos..." : null;

  // Función para resetear todos los filtros
  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setTypeFilter("all");
    setStartDateFilter("");
    setEndDateFilter("");
  };

  if (loadingMessage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="bg-white/80 backdrop-blur-sm p-6 sm:p-8 rounded-xl shadow-lg max-w-sm w-full">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-red-600" />
            <span className="animate-pulse text-red-600 text-base sm:text-lg font-medium">
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
        startDate: eventData.dates.startDate,
        endDate: eventData.dates.endDate,
      },
    };

    const { success, message } = selectedEvent
      ? await updateEvent(eventToSave, user, selectedEvent.id)
      : await createEvent(eventToSave, user);

    if (success) {
      alert(
        selectedEvent
          ? "Evento actualizado exitosamente"
          : "Evento creado exitosamente"
      );
      setIsCreateModalOpen(false);
      setSelectedEvent(null);
    } else {
      alert(`Error: ${message}`);
    }
  };

  const handleEvent = (event: CustomEvent, cmd: string) => {
    // Convertir la estructura de niveles de Firebase a la estructura de la aplicación
    const levelsWithSelected = Object.entries(event.dance.levels).reduce((acc, [key, value]) => {
      acc[key] = {
        ...value,
        selected: true,
        price: Number(value.price),
        categories: value.categories || []
      };
      return acc;
    }, {} as { [key: string]: LevelData });

    setSelectedEvent(event);
    setEventData({
      general: {
        name: event.name,
        description: event.description,
        status: event.status,
      },
      dates: {
        startDate: event.startDate,
        endDate: event.endDate,
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
      },
      images: {
        smallImage: event.smallImage,
        bannerImage: event.bannerImage,
        smallImagePreview: event.smallImage,
        bannerImagePreview: event.bannerImage,
      },
      settings: event.settings || {
        inscription: {
          groupEnabled: false,
          individualEnabled: false,
          onSiteEnabled: false,
        },
        registration: {
          grupalCSV: false,
          individualWeb: false,
          sameDay: false
        },
        pullCouple: {
          enabled: false,
          criteria: "Category",
          difference: 0
        }
      }
    });

    if (cmd == "edit") {
      setIsCreateModalOpen(true);
      setIsViewModalOpen(false);
    } else if (cmd == "view") {
      setIsCreateModalOpen(false);
      setIsViewModalOpen(true);
    } else {
      setIsCreateModalOpen(false);
      setIsViewModalOpen(false);
    }
  };

  const handleDeleteEvent = (event: CustomEvent) => {
    setSelectedEvent(event);
    setIsDeleteModalOpen(true);
  };

  return (
    <>
    <div className="p-4 sm:p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-800 dark:text-white">
        Gestión de Eventos
      </h1>

      {/* Sección de búsqueda y filtros */}
      <div className="mb-6">
        <div className="flex flex-col gap-3 sm:gap-4 mb-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar eventos..."
              className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm sm:text-base"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
            >
              <Filter size={18} className="sm:w-5 sm:h-5" />
              <span className="hidden sm:inline">{showFilters ? "Ocultar filtros" : "Mostrar filtros"}</span>
              <span className="sm:hidden">Filtros</span>
            </button>

            {
              (user?.roleId == "organizer") && (
                <button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base"
                >
                  <Plus size={18} className="sm:w-5 sm:h-5" />
                  <span className="hidden sm:inline">Crear Evento</span>
                  <span className="sm:hidden">Crear</span>
                </button>
              )
            }
          </div>
        </div>

        {/* Filtros adicionales (expandibles) */}
        {showFilters && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-4 transition-all">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="all">Todos</option>
                  <option value="active">Activo</option>
                  <option value="inactive">Inactivo</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Tipo de Evento
                </label>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                >
                  <option value="all">Todos</option>
                  {eventTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Desde
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={startDateFilter}
                    onChange={(e) => setStartDateFilter(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Hasta
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="date"
                    value={endDateFilter}
                    onChange={(e) => setEndDateFilter(e.target.value)}
                    className="pl-10 w-full rounded-lg border border-gray-300 p-2 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 lg:col-span-1 xl:col-span-1">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 opacity-0 select-none">
                  Acción
                </label>
                <button
                  onClick={resetFilters}
                  className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm"
                >
                  <X size={16} />
                  Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados de la búsqueda y filtros */}
      <div className="mb-2 text-sm text-gray-600 dark:text-gray-400 px-1">
        Mostrando {filteredEvents.length} evento{filteredEvents.length !== 1 ? 's' : ''}
        {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDateFilter || endDateFilter) && ' con los filtros aplicados'}
      </div>

      {loadingEvents ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Cargando eventos...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 sm:p-8 text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">No se encontraron eventos con los criterios de búsqueda actuales.</p>
          {(searchTerm || statusFilter !== 'all' || typeFilter !== 'all' || startDateFilter || endDateFilter) && (
            <button
              onClick={resetFilters}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <X size={18} />
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <>
          {/* Vista de tabla para pantallas grandes */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
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
                  {filteredEvents.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-center">
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white text-left">
                        <Link
                          href={`/organize/events/${event.id}`}
                          className="hover:text-red-600 transition-colors"
                        >
                          {event.name}
                        </Link>
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
                          className={`px-2 py-1 rounded-full text-xs font-medium ${event.status === "active"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }`}
                        >
                          {event.status === "active" ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-4 py-3 mx-auto">
                        <div className="flex justify-center space-x-2 items-center align-middle">
                          <Link
                            className="text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
                            title="Verificar"
                            href={`/organize/events/${event.id}`}
                          >
                            <CheckCircle className="w-5 h-5" />
                          </Link>
                          <button
                            className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                            title="Visualizar"
                            onClick={() => handleEvent(event, "view")}
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          {
                            (event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId) || event.staff?.find(s => s.userId === user?.id && s.permissions.includes("editevent"))) && (
                              <button
                                className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                                title="Editar"
                                onClick={() => handleEvent(event, "edit")}
                              >
                                <FilePenLine className="w-5 h-5" />
                              </button>
                            )
                          }
                          {
                            (event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId) || event.staff?.find(s => s.userId === user?.id && s.permissions.includes("deleteevent"))) && (
                              <button
                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Eliminar"
                                onClick={() => handleDeleteEvent(event)}
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            )
                          }
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vista de tarjetas para pantallas medianas y pequeñas */}
          <div className="lg:hidden space-y-4">
            {filteredEvents.map((event) => (
              <div key={event.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 sm:p-6">
                <div className="flex flex-col space-y-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0">
                      <Link
                        href={`/organize/events/${event.id}`}
                        className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white hover:text-red-600 transition-colors block truncate"
                      >
                        {event.name}
                      </Link>
                      <p className="text-sm text-gray-500 dark:text-gray-300 mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    </div>
                    <span
                      className={`ml-3 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${event.status === "active"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                        }`}
                    >
                      {event.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Inicio:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {new Date(event.startDate.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-700 dark:text-gray-300">Fin:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {new Date(event.endDate.toDate()).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <span className="font-medium text-gray-700 dark:text-gray-300">Tipo:</span>
                      <span className="ml-2 text-gray-600 dark:text-gray-400">
                        {event.eventType}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2 border-t dark:border-gray-700 justify-center">
                    <Link
                      className="flex items-center gap-1 px-3 py-2 text-pink-500 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 hover:bg-pink-50 dark:hover:bg-pink-900/20 rounded-lg transition-colors text-sm"
                      title="Verificar"
                      href={`/organize/events/${event.id}`}
                    >
                      <CheckCircle className="w-4 h-4" />
                      <span className="hidden sm:inline">Verificar</span>
                    </Link>
                    <button
                      className="flex items-center gap-1 px-3 py-2 text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors text-sm"
                      title="Visualizar"
                      onClick={() => handleEvent(event, "view")}
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">Ver</span>
                    </button>
                    {
                      (event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId) || event.staff?.find(s => s.userId === user?.id && s.permissions.includes("editevent"))) && (
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 rounded-lg transition-colors text-sm"
                          title="Editar"
                          onClick={() => handleEvent(event, "edit")}
                        >
                          <FilePenLine className="w-4 h-4" />
                          <span className="hidden sm:inline">Editar</span>
                        </button>
                      )
                    }
                    {
                      (event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId) || event.staff?.find(s => s.userId === user?.id && s.permissions.includes("deleteevent"))) && (
                        <button
                          className="flex items-center gap-1 px-3 py-2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm"
                          title="Eliminar"
                          onClick={() => handleDeleteEvent(event)}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span className="hidden sm:inline">Eliminar</span>
                        </button>
                      )
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
      <EventModal
        isOpen={isCreateModalOpen || isViewModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setIsViewModalOpen(false);
          setSelectedEvent(null);
        }}
        onSave={handleSaveEvent}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        eventData={eventData}
        updateEventData={updateEventData}
        isEdit={!!selectedEvent && !isViewModalOpen}
        isOnlyRead={isViewModalOpen}
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
    </>
  );
};

export default Events;
