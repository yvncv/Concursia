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

    // Orden específico de modalidades (mismo que en InscriptionForm)
    const ordenModalidades = [
        "Seriado",
        "Individual", 
        "Novel Novel", 
        "Noveles", 
        "Novel Abierto",
        "Novel Abierto A",
        "Novel Abierto B", 
        "Nacional"
    ];

    // Función para ordenar modalidades según el orden definido
    const getOrderedLevels = (): Array<[string, any]> => {
        if (!event?.dance?.levels) return [];
        
        const modalidadesDisponibles = Object.keys(event.dance.levels);
        const modalidadesOrdenadas = ordenModalidades.filter(modalidad => 
            modalidadesDisponibles.includes(modalidad)
        );
        
        return modalidadesOrdenadas.map(modalidad => [modalidad, event.dance.levels[modalidad]] as [string, any]);
    };

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
        <div className="w-full flex flex-col items-center justify-start">
            <div className="grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-6">
                <article className="order-1 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md border border-gray-200 flex flex-col gap-5">
                    {/* Nombre del evento */}
                    <div className="bg-red-600 p-4 rounded-lg">
                        <h1 className="text-2xl md:text-2xl font-bold text-white">
                            {event.eventType}: {event.name}
                        </h1>
                    </div>

                    {/* Descripción del evento */}
                    <section className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 text-base leading-relaxed">
                            {event.description}
                        </p>
                    </section>

                    {/* Fechas */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="bg-red-600 p-1.5 rounded-full">
                                    <Calendar className="text-white w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Inicio</p>
                                    <p className="text-sm font-semibold text-gray-800">{formattedStartDate}</p>
                                    <p className="text-sm text-gray-600">{formattedStartTime}</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 border border-gray-200 p-3 rounded-lg">
                            <div className="flex items-center space-x-3">
                                <div className="bg-red-600 p-1.5 rounded-full">
                                    <Calendar className="text-white w-4 h-4" />
                                </div>
                                <div>
                                    <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Fin</p>
                                    <p className="text-sm font-semibold text-gray-800">{formattedEndDate}</p>
                                    <p className="text-sm text-gray-600">{formattedEndTime}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Ubicación */}
                    <section className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-3">
                            <div className="bg-red-700 p-1.5 rounded-full">
                                <MapPin className="text-white w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-base">Ubicación</h3>
                        </div>
                        <div className="">
                            <p className="text-gray-700 font-medium text-sm mb-1">{event.location.placeName}</p>
                            <div className="flex items-center space-x-2">
                                {event.location.coordinates ? (
                                    <button
                                        onClick={openModal}
                                        className="text-sm text-red-700 hover:text-red-800 underline font-medium text-start"
                                    >
                                        {event.location.street}, {event.location.district}, {event.location.province}, {event.location.department}
                                    </button>
                                ) : (
                                    <span className="text-sm text-gray-600 text-start">
                                        {event.location.street}, {event.location.district}, {event.location.province}, {event.location.department}
                                    </span>
                                )}
                            </div>
                        </div>
                    </section>

                    {/* Sección de Categorías por Nivel */}
                    <section className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-red-500 p-1.5 rounded-full">
                                <ChartBarStacked className="text-white w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-base">
                                Categorías por Modalidad
                            </h3>
                        </div>

                        <div className="">
                            {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                                <div className="space-y-3">
                                    {getOrderedLevels().map(([levelName, levelData]: [string, any]) => (
                                        <div key={levelName} className="bg-white border border-gray-200 rounded-lg p-3">
                                            <h4 className="font-medium text-gray-800 text-sm mb-2">
                                                {capitalizeFirstLetter(levelName)}
                                            </h4>
                                            <div className="flex flex-wrap gap-2">
                                                {levelData.categories && levelData.categories.length > 0 ? (
                                                    levelData.categories.map((category: string, catIndex: number) => {
                                                        // Colores inspirados en la marinera y bandera peruana
                                                        const getCategoryColor = (index: number) => {
                                                            const colors = [
                                                                'bg-red-600',      // Rojo de la bandera peruana
                                                                'bg-white border-2 border-red-600 text-red-600', // Blanco con borde rojo
                                                                'bg-red-700',      // Rojo más intenso
                                                                'bg-red-500',      // Rojo más claro
                                                                'bg-gray-700',     // Color tierra/carbón de la marinera
                                                                'bg-amber-600',    // Dorado/oro de los adornos
                                                                'bg-red-800'       // Rojo oscuro elegante
                                                            ];
                                                            return colors[index % colors.length];
                                                        };

                                                        const colorClass = getCategoryColor(catIndex);
                                                        const isWhite = colorClass.includes('bg-white');

                                                        return (
                                                            <span
                                                                key={`${levelName}-${category}`}
                                                                className={`px-3 py-1 rounded-full text-xs font-medium ${colorClass} ${isWhite ? '' : 'text-white'
                                                                    }`}
                                                            >
                                                                {capitalizeFirstLetter(category)}
                                                            </span>
                                                        );
                                                    })
                                                ) : (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                                                        Sin categorías definidas
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="bg-white border border-gray-200 rounded-lg p-3 text-center">
                                    <span className="text-gray-500 text-sm">Sin niveles ni categorías establecidas</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Información adicional */}
                    <section className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-amber-600 p-1.5 rounded-full">
                                <AlertCircle className="text-white w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-base">
                                Información Adicional
                            </h3>
                        </div>

                        <div className="">
                            {loading ? (
                                <div className="flex items-center space-x-3 bg-white p-3 rounded-lg">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-amber-600"></div>
                                    <span className="text-gray-600 text-sm">Cargando información adicional...</span>
                                </div>
                            ) : error ? (
                                <div className="bg-red-50 border border-red-200 p-3 rounded-lg">
                                    <span className="text-red-600 text-sm">Error al cargar información: {error}</span>
                                </div>
                            ) : event.settings && typeof event.settings === 'object' ? (
                                (event.settings.inscription?.groupEnabled ||
                                    event.settings.inscription?.individualEnabled ||
                                    event.settings.inscription?.onSiteEnabled ||
                                    event.settings.pullCouple?.enabled) ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {event.settings.inscription?.groupEnabled && (
                                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg">
                                                <span className="text-sm font-medium">Inscripción Grupal</span>
                                            </div>
                                        )}
                                        {event.settings.inscription?.individualEnabled && (
                                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg">
                                                <span className="text-sm font-medium">Inscripción Individual Web</span>
                                            </div>
                                        )}
                                        {event.settings.inscription?.onSiteEnabled && (
                                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg">
                                                <span className="text-sm font-medium">Inscripción el Mismo Día</span>
                                            </div>
                                        )}
                                        {event.settings.pullCouple?.enabled && (
                                            <div className="bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-lg md:col-span-2">
                                                <span className="text-sm font-medium">
                                                    Se puede jalar pareja con diferencia máxima de {event.settings.pullCouple.difference}{" "}
                                                    {event.settings.pullCouple.criteria === "Age" ? "años" : "categorías"}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                        <span className="text-gray-500 text-sm">No se encontraron configuraciones</span>
                                    </div>
                                )
                            ) : (
                                <div className="bg-white border border-gray-200 p-3 rounded-lg text-center">
                                    <span className="text-gray-500 text-sm">No se encontraron configuraciones</span>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Academia */}
                    <section className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-3">
                            <div className="bg-gray-700 p-1.5 rounded-full">
                                <BadgeCheck className="text-white w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Academia</p>
                                <p className="text-base font-semibold text-gray-800">{event.academyName}</p>
                            </div>
                        </div>
                    </section>
                </article>

                <div className="order-2 h-full flex flex-col space-y-5 justify-between">
                    {/* Sección de Precios */}
                    <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-red-800 p-1.5 rounded-full">
                                <Coins className="text-white w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-base">Inscripción</h3>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-3">Precios por modalidad:</p>
                            <div className="space-y-2">
                                {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                                    getOrderedLevels().map(([levelName, levelData]: [string, any], index: number) => {
                                        const getPriceColor = (index: number) => {
                                            const colors = [
                                                'bg-red-600',
                                                'bg-red-700',
                                                'bg-red-500',
                                                'bg-red-800'
                                            ];
                                            return colors[index % colors.length];
                                        };

                                        return (
                                            <div
                                                key={levelName}
                                                className={`${getPriceColor(index)} text-white p-3 rounded-lg font-medium text-center text-sm`}
                                            >
                                                <span className="block mb-1">
                                                    {levelName.charAt(0).toUpperCase() + levelName.slice(1)}
                                                </span>
                                                <span className="text-base">S/. {levelData.price}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg text-center">
                                        <span className="text-gray-500 text-sm">Sin niveles definidos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Botones de acción */}
                        <div className="space-y-3">
                            {!isOrganizer && (
                                <button
                                    onClick={onInscribir}
                                    disabled={!individualEnabled}
                                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${individualEnabled
                                            ? "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                >
                                    {individualEnabled ? <UserPlus className="w-4 h-4" /> : null}
                                    {individualEnabled ? "Inscribirse" : "Inscripción web no disponible"}
                                </button>
                            )}

                            {user?.roleId === "organizer" && !isOrganizer && (
                                <button
                                    onClick={onInscribirAlumnos}
                                    disabled={!groupEnabled}
                                    className={`w-full py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 flex items-center justify-center gap-2
                    ${groupEnabled
                                            ? "bg-red-600 text-white hover:bg-red-700 shadow-sm hover:shadow-md"
                                            : "bg-gray-200 text-gray-400 cursor-not-allowed"}`}
                                >
                                    {groupEnabled ? <Users className="w-4 h-4" /> : null}
                                    {groupEnabled ? "Inscribir alumnos" : "Inscripción grupal no disponible"}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Sección de Espectador */}
                    {/* <div className="bg-white p-5 rounded-lg shadow-md border border-gray-200">
                        <div className="flex items-center space-x-3 mb-4">
                            <div className="bg-amber-600 p-1.5 rounded-full">
                                <Ticket className="text-white w-4 h-4" />
                            </div>
                            <h3 className="font-semibold text-gray-800 text-base">Espectador</h3>
                        </div>

                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-600 mb-3">Precios por entrada:</p>
                            <div className="space-y-2">
                                {event?.dance?.levels && Object.keys(event.dance.levels).length > 0 ? (
                                    Object.entries(event.dance.levels).map(([levelName, levelData], index) => {
                                        const getTicketColor = (index: number) => {
                                            const colors = [
                                                'bg-amber-600',
                                                'bg-amber-700',
                                                'bg-amber-500',
                                                'bg-amber-800'
                                            ];
                                            return colors[index % colors.length];
                                        };

                                        return (
                                            <div
                                                key={levelName}
                                                className={`${getTicketColor(index)} text-white p-3 rounded-lg font-medium text-center text-sm`}
                                            >
                                                <span className="block mb-1">
                                                    {levelName.charAt(0).toUpperCase() + levelName.slice(1)}
                                                </span>
                                                <span className="text-base">S/. {levelData.price}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="bg-gray-100 border border-gray-200 p-3 rounded-lg text-center">
                                        <span className="text-gray-500 text-sm">Sin niveles definidos</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                onClick={openPurchaseModal}
                                className="w-full bg-amber-600 text-white py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-300 shadow-sm hover:shadow-md hover:bg-amber-700 flex items-center justify-center gap-2"
                            >
                                <ShoppingCart className="w-4 h-4" />
                                Comprar mi entrada
                            </button>
                        </div>
                    </div> */}

                    {/* Sección del Mapa */}
                    <div className="rounded-lg overflow-hidden flex-grow hidden md:block shadow-md border border-gray-200">
                        <div className="p-3 bg-gray-50 border-b border-gray-200">
                            <div className="flex items-center gap-2">
                                <div className="bg-red-700 p-1.5 rounded-full">
                                    <MapPin className="text-white w-4 h-4" />
                                </div>
                                <h3 className="text-sm font-semibold text-gray-800">Ubicación del evento</h3>
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