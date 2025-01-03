'use client';

import CalendarIcon from "@/app/ui/icons/calendar";
import PlaceIcon from "@/app/ui/icons/marker";
import { Event } from "@/app/types/eventType";
import Image from "next/image";
import IdIcon from "@/app/ui/icons/id";
import MapIcon from "@/app/ui/icons/map";

const EventoInformacion = ({ event, openModal }: { event: Event, openModal: () => void }) => {
    // Función para capitalizar la primera letra de una cadena
    function capitalizeFirstLetter(text: string): string {
        return text.charAt(0).toUpperCase() + text.slice(1);
    }

    // Verificar que startDate y endDate no sean undefined antes de formatear
    const formattedStartDate = event.startDate && event.startDate.seconds
        ? capitalizeFirstLetter(
            new Date(event.startDate.seconds * 1000).toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
            })
        ) : "";

    const formattedStartTime = event.startDate && event.startDate.seconds
        ? new Date(event.startDate.seconds * 1000).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : "";

    const formattedEndDate = event.endDate && event.endDate.seconds
        ? capitalizeFirstLetter(
            new Date(event.endDate.seconds * 1000).toLocaleDateString("es-PE", {
                weekday: "long",
                day: "numeric",
                month: "long",
            })
        ) : "";

    const formattedEndTime = event.endDate && event.endDate.seconds
        ? new Date(event.endDate.seconds * 1000).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
        })
        : "";

    return (
        <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                <article className="order-2 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    {/* Nombre del evento */}
                    <h1 className="text-2xl font-bold text-gray-800">{event.type}: {event.name}</h1>

                    {/* Descripción del evento */}
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        {event.description}
                    </p>

                    {/* Información del evento: Fecha de inicio */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <CalendarIcon className="text-green-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Inicio: {formattedStartDate} - {formattedStartTime}</span>
                    </div>

                    {/* Información del evento: Fecha de fin */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <CalendarIcon className="text-rojo w-6 h-6" />
                        <span className="text-sm md:text-base">Fin: {formattedEndDate} - {formattedEndTime}</span>
                    </div>

                    {/* Información del evento: Lugar */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <PlaceIcon className="text-blue-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Nombre del lugar: {event.location.placeName}</span>
                    </div>

                    {/* Información del evento: Coordenadas y mapa */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <MapIcon className="text-orange-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Dirección: {event.location.street}, {event.location.district}, {event.location.province}, {event.location.department}</span>
                        {event.location.coordinates && (
                            <button onClick={openModal} className="text-rojo text-sm md:text-base border border-transparent border-b-rojo">
                                Ver mapa
                            </button>
                        )}
                    </div>

                    {/* ID del evento */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <IdIcon className="text-purple-600 w-6 h-6" />
                        <span className="text-sm md:text-base">ID del evento: {event.id}</span>
                    </div>

                    {/* Información adicional */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <span className="text-sm md:text-base">Academia ID: {event.academyId}</span>
                    </div>
                </article>

                {/* Imagen del evento */}
                <div className="order-1 lg:order-2 w-full flex items-start justify-center h-[100%]">
                    {event.bannerImage && (
                        <Image
                            src={event.bannerImage}
                            alt={event.name}
                            width={900}
                            height={600}
                            className="object-cover rounded-lg shadow-lg"
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoInformacion;
