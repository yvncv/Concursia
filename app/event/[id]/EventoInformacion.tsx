'use client';

import { CustomEvent } from "@/app/types/eventType";
import { Calendar, MapPin, Map as MapIcon, BadgeCheck, ChartBarStacked, Coins, AlertCircle, UserPlus, Users, ShoppingCart, Ticket } from "lucide-react";
import Map from "@/app/ui/map/mapa";
import TicketPurchaseModal, { useTicketPurchaseModal } from "./purchase-modal/TicketPurchaseModal";

interface EventoInformacionProps {
    event: CustomEvent;
    openModal: () => void;
    onInscribir: () => void;
    onInscribirAlumnos: () => void;
    user: any;  // Usando 'any' para coincidir con tu implementación de useUser
    isEventOrganizer?: boolean;
    loading: boolean;
    error: string | null;
    isIndividualWebEnabled?: boolean;
    isGrupalCSVEnabled?: boolean;
}

const EventoInformacion: React.FC<EventoInformacionProps> = ({
    event,
    openModal,
    onInscribir,
    onInscribirAlumnos,
    user,
    isEventOrganizer,
    loading,
    error,
    isIndividualWebEnabled,
    isGrupalCSVEnabled
}) => {
    const { isPurchaseOpen, openPurchaseModal, closePurchaseModal } = useTicketPurchaseModal();
    // Función para capitalizar la primera letra de una cadena
    const capitalizeFirstLetter = (text: string): string =>
        text.charAt(0).toUpperCase() + text.slice(1);

    // Función utilitaria para formatear fechas
    const formatDate = (timestamp: number, options: Intl.DateTimeFormatOptions): string =>
        capitalizeFirstLetter(
            new Date(timestamp * 1000).toLocaleDateString("es-PE", options)
        );

    const formatTime = (timestamp: number): string =>
        new Date(timestamp * 1000).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        });

    const formattedStartDate = event.startDate?.seconds
        ? formatDate(event.startDate.seconds, { weekday: "long", day: "numeric", month: "long" })
        : "";

    const formattedStartTime = event.startDate?.seconds
        ? formatTime(event.startDate.seconds)
        : "";

    const formattedEndDate = event.endDate?.seconds
        ? formatDate(event.endDate.seconds, { weekday: "long", day: "numeric", month: "long" })
        : "";

    const formattedEndTime = event.endDate?.seconds
        ? formatTime(event.endDate.seconds)
        : "";

    const iconClass = "w-6 h-6";

    // Determinar si el usuario es el organizador del evento
    // Si isEventOrganizer no se proporciona, lo calculamos comparando IDs
    const isOrganizer = isEventOrganizer !== undefined ?
        isEventOrganizer :
        (user?.id && event.organizerId === user?.id || (user?.roleId == "organizer" && event.academyId === user?.marinera?.academyId));

    // Determine if inscription types are enabled based on settings
    // IMPORTANTE: Priorizar los valores recibidos por props, que vienen de useSettings()
    const individualEnabled = isIndividualWebEnabled !== undefined
        ? isIndividualWebEnabled         // Usar valores de props (de useSettings)
        : (event?.settings?.inscription?.individualEnabled || false);

    const groupEnabled = isGrupalCSVEnabled !== undefined
        ? isGrupalCSVEnabled            // Usar valores de props (de useSettings)
        : (event?.settings?.inscription?.groupEnabled || false);

    console.log("DEBUG - Event settings:", {
        eventId: event.id,
        inscriptionFromProps: {
            individualEnabled: isIndividualWebEnabled,
            groupEnabled: isGrupalCSVEnabled
        },
        inscriptionFromEvent: {
            individualEnabled: event?.settings?.inscription?.individualEnabled,
            groupEnabled: event?.settings?.inscription?.groupEnabled
        },
        calculatedValues: {
            individualEnabled,
            groupEnabled,
            isOrganizer,
            userRole: user?.roleId
        }
    });

    return (
        <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 mb-20">
                <article className="order-1 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    {/* Nombre del evento */}
                    <h1 className="text-2xl font-bold text-gray-800">{event.eventType}: {event.name}</h1>

                    {/* Descripción del evento */}
                    <section className="text-gray-700 text-base md:text-lg leading-relaxed">
                        {event.description}
                    </section>

                    <section
                        className="flex flex-col md:flex-row md:items-center md:space-x-6 text-gray-600 space-y-3 md:space-y-0">
                        <div className="flex items-center space-x-3">
                            <Calendar className="text-green-600 w-6 h-6 shrink-0" />
                            <span className="text-sm md:text-base leading-tight">
                                <strong>Inicio:</strong> {formattedStartDate} - {formattedStartTime}
                            </span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <Calendar className="text-rojo w-6 h-6 shrink-0" />
                            <span className="text-sm md:text-base leading-tight">
                                <strong>Fin:</strong> {formattedEndDate} - {formattedEndTime}
                            </span>
                        </div>
                    </section>

                    <section className="flex items-center space-x-3 text-gray-600">
                        <MapPin className={`${iconClass} text-blue-600`} />
                        <span className="text-sm md:text-base">Nombre del lugar: {event.location.placeName}.</span>
                    </section>

                    <section className="flex items-center space-x-3 text-gray-600">
                        <MapIcon className={`${iconClass} text-orange-600`} />
                        {event.location.coordinates ? (
                            <button
                                onClick={openModal}
                                className="text-sm md:text-base text-red-900 hover:text-purple-900 underline underline-offset-4 ml-2 text-start"
                            >
                                Dirección: {event.location.street}, {event.location.district},{" "}
                                {event.location.province}, {event.location.department}.
                            </button>
                        ) : (
                            <span className="text-sm md:text-base">
                                Dirección: {event.location.street}, {event.location.district},{" "}
                                {event.location.province}, {event.location.department}
                            </span>
                        )}
                    </section>

                    {/* Sección de Categorías por Nivel */}
                    <section className="w-full bg-[#fef6ff] p-6 rounded-lg shadow-md h-fit flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                            <ChartBarStacked className="text-purple-600 w-6 h-6" />
                            <span className="text-sm md:text-base font-medium">Categorías por Modalidad:</span>
                        </div>

                        {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                            <div className="space-y-4">
                                {Object.entries(event.dance.levels).map(([levelName, levelData]) => (
                                    <div key={levelName} className="border-b border-purple-100 pb-3 last:border-0">
                                        <h3 className="font-medium text-purple-800 mb-2">
                                            {capitalizeFirstLetter(levelName)}
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {levelData.categories && levelData.categories.length > 0 ? (
                                                levelData.categories.map((category: string) => (
                                                    <span
                                                        key={`${levelName}-${category}`}
                                                        className="px-3 py-1 bg-gradient-to-t from-purple-500 bg-blue-600 text-white rounded-full text-xs md:text-sm font-medium"
                                                    >
                                                        {capitalizeFirstLetter(category)}
                                                    </span>
                                                ))
                                            ) : (
                                                <span className="text-sm text-gray-500">Sin categorías definidas para este nivel.</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <span className="text-sm md:text-base text-gray-500">Sin niveles ni categorías establecidas.</span>
                        )}
                    </section>

                    <section className="w-full bg-[#fef6f2] p-6 rounded-lg shadow-md h-fit flex flex-col space-y-4">
                        <div className="flex items-center space-x-3">
                            <AlertCircle className="text-yellow-600 w-6 h-6" />
                            <span className="text-sm md:text-base">Información adicional:</span>
                        </div>
                        {loading ? (
                            <span className="text-sm md:text-base text-gray-500">Cargando Información adicional...</span>
                        ) : error ? (
                            <span
                                className="text-sm md:text-base text-red-500">Error al cargar Información adicional: {error}</span>
                        ) : event.settings && typeof event.settings === 'object' ? (
                            (event.settings.inscription?.groupEnabled ||
                                event.settings.inscription?.individualEnabled ||
                                event.settings.inscription?.onSiteEnabled ||
                                event.settings.pullCouple?.enabled) ? (
                                <div className="flex flex-wrap gap-2">
                                    {event.settings.inscription?.groupEnabled && (
                                        <span className="px-3 py-1 bg-gradient-to-t from-yellow-500 bg-orange-500 text-white rounded-full text-xs md:text-sm font-medium">Inscripción Grupal</span>
                                    )}
                                    {event.settings.inscription?.individualEnabled && (
                                        <span className="px-3 py-1 bg-gradient-to-t from-yellow-500 bg-orange-500 text-white rounded-full text-xs md:text-sm font-medium">Inscripción Individual Web</span>
                                    )}
                                    {event.settings.inscription?.onSiteEnabled && (
                                        <span className="px-3 py-1 bg-gradient-to-t from-yellow-500 bg-orange-500 text-white rounded-full text-xs md:text-sm font-medium">Inscripción el Mismo Día</span>
                                    )}
                                    {event.settings.pullCouple?.enabled && (
                                        <span className="px-3 py-1 bg-gradient-to-t from-yellow-500 bg-orange-500 text-white rounded-full text-xs md:text-sm font-medium">
                                            Se puede jalar pareja con diferencia máxima de {event.settings.pullCouple.difference}{" "}
                                            {event.settings.pullCouple.criteria === "Age" ? "años." : "categorías."}
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <span className="text-sm text-gray-500">No se encontraron configuraciones.</span>
                            )
                        ) : (
                            <span className="text-sm text-gray-500">No se encontraron configuraciones.</span>
                        )}
                    </section>

                    <section
                        className="flex items-center space-x-3 text-gray-600 p-2 bg-gradient-to-tr from-red-500 to-yellow-600 rounded-full w-auto justify-center">
                        <BadgeCheck className={`${iconClass} text-white`} />
                        <span className="text-sm md:text-base text-white">Academia: {event.academyName}.</span>
                    </section>
                </article>

                <div className="order-2 h-full flex flex-col space-y-6 justify-between">
                    {/* Sección de Precios - Diseño Mejorado */}
                    <div className="w-full bg-gradient-to-br from-white to-[#FFF6F6] p-6 rounded-2xl shadow-lg border border-red-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Inscripción</h3>
                            <Coins className="text-yellow-600 w-6 h-6" />
                        </div>

                        <div className="mb-4">
                            <p className="text-base font-medium text-gray-700 mb-3">Precios por modalidad:</p>
                            <div className="flex flex-wrap gap-2">
                                {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                                    Object.entries(event.dance.levels).map(([levelName, levelData]) => (
                                        <span
                                            key={levelName}
                                            className="px-4 py-1.5 bg-gradient-to-r from-yellow-500 to-red-500 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                                        >
                                            {levelName.charAt(0).toUpperCase() + levelName.slice(1)} - S/. {levelData.price}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">Sin niveles definidos.</span>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="mt-6 flex flex-col gap-3">
                            {/* Botón de inscripción individual */}
                            {!isOrganizer && (
                                <button
                                    onClick={onInscribir}
                                    disabled={!individualEnabled}
                                    className={`w-full py-2.5 px-4 rounded-xl text-base font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${individualEnabled
                                            ? "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 active:scale-98 shadow-md hover:shadow-lg"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                >
                                    {individualEnabled ? <UserPlus className="w-5 h-5" /> : null}
                                    {individualEnabled ? "Inscribir" : "Inscripción web no disponible"}
                                </button>
                            )}

                            {/* Botón de inscripción grupal */}
                            {user?.roleId === "organizer" && !isOrganizer && (
                                <button
                                    onClick={onInscribirAlumnos}
                                    disabled={!groupEnabled}
                                    className={`w-full py-2.5 px-4 rounded-xl text-base font-medium transition-all duration-300 flex items-center justify-center gap-2
                        ${groupEnabled
                                            ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 active:scale-98 shadow-md hover:shadow-lg"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                >
                                    {groupEnabled ? <Users className="w-5 h-5" /> : null}
                                    {groupEnabled ? "Inscribir alumnos" : "Inscripción grupal no disponible"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sección de Espectador - Diseño Mejorado */}
                    <div className="w-full bg-gradient-to-br from-white to-[#FFF6F6] p-6 rounded-2xl shadow-lg border border-red-100">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-gray-800">Espectador</h3>
                            <Ticket className="text-green-600 w-6 h-6" />
                        </div>

                        <div className="mb-4">
                            <p className="text-base font-medium text-gray-700 mb-3">Precios por entrada:</p>
                            <div className="flex flex-wrap gap-2">
                                {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                                    Object.entries(event.dance.levels).map(([levelName, levelData]) => (
                                        <span
                                            key={levelName}
                                            className="px-4 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-full text-sm font-medium shadow-sm hover:shadow-md transition-shadow duration-200"
                                        >
                                            {levelName.charAt(0).toUpperCase() + levelName.slice(1)} - S/. {levelData.price}
                                        </span>
                                    ))
                                ) : (
                                    <span className="text-gray-500">Sin niveles definidos.</span>
                                )}
                            </div>
                        </div>

                        {/* Botón de compra */}
                        <div className="mt-6">
                            <button
                                onClick={openPurchaseModal}
                                className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white py-2.5 px-4 rounded-xl text-base font-medium transition-all duration-300 shadow-md hover:shadow-lg hover:from-green-600 hover:to-green-700 active:scale-98 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                Comprar mi entrada
                            </button>
                        </div>
                    </div>

                    {/* Sección del Mapa */}
                    <div className="rounded-2xl overflow-hidden flex-grow hidden md:block shadow-xl border border-gray-200">
                        <div className="p-4 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <MapPin className="text-red-500 w-5 h-5" />
                                <h3 className="text-base font-medium text-gray-700">Ubicación del evento</h3>
                            </div>
                        </div>
                        <Map
                            latitude={event.location.coordinates.latitude}
                            longitude={event.location.coordinates.longitude}
                        />
                    </div>
                </div>
            </div>
            <TicketPurchaseModal
                isPurchaseOpen={isPurchaseOpen}
                onPurchaseClose={closePurchaseModal}
            />
        </div>
    );
};

export default EventoInformacion;