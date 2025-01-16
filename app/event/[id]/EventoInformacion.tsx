'use client';

import { Event } from "@/app/types/eventType";
import Image from "next/image";
import { Calendar, MapPin, Map, BadgeCheck } from "lucide-react";

const EventoInformacion = ({ event, openModal }: { event: Event; openModal: () => void }) => {
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

    return (
        <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                <article className="order-2 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    <h1 className="text-2xl font-bold text-gray-800">{event.eventType}: {event.name}</h1>
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">{event.description}</p>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <Calendar className={`${iconClass} text-green-600`} />
                        <span className="text-sm md:text-base">
                            Inicio: {formattedStartDate} - {formattedStartTime}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <Calendar className={`${iconClass} text-red-600`} />
                        <span className="text-sm md:text-base">
                            Fin: {formattedEndDate} - {formattedEndTime}
                        </span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <MapPin className={`${iconClass} text-blue-600`} />
                        <span className="text-sm md:text-base">Nombre del lugar: {event.location.placeName}.</span>
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <Map className={`${iconClass} text-orange-600`} />
                        {event.location.coordinates ? (
                            <button
                                onClick={openModal}
                                className="text-sm md:text-base hover:text-red-600 underline underline-offset-4 ml-2 text-start"
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
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <BadgeCheck className={`${iconClass} text-purple-600`} />
                        <span className="text-sm md:text-base">Academia: {event.academyName}.</span>
                    </div>
                </article>

                <div className="order-1 lg:order-2 w-full flex items-start justify-center h-[100%]">
                    {event.bannerImage ? (
                        <Image
                            src={event.bannerImage}
                            alt={event.name}
                            width={900}
                            height={600}
                            className="object-cover rounded-lg shadow-lg"
                        />
                    ) : (
                        <div className="w-full h-[600px] bg-gray-200 rounded-lg flex items-center justify-center text-gray-500">
                            Imagen no disponible
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoInformacion;
