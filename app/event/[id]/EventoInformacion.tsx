'use client';

import CalendarIcon from "@/app/ui/icons/calendar";
import PlaceIcon from "@/app/ui/icons/marker";
import { Event } from "@/app/types/eventType";
import Image from "next/image";
import IdIcon from "@/app/ui/icons/id";
import MapIcon from "@/app/ui/icons/map";

const EventoInformacion = ({ event, openModal, onInscribir }: { event: Event, openModal: () => void, onInscribir: () => void }) => {
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
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-[3fr_2fr] gap-10 mb-20">
                <article className="order-1 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    {/* Nombre del evento */}
                    <h1 className="text-2xl font-bold text-gray-800">{event.eventType}: {event.name}</h1>

                    <div className="flex items-center justify-beetwen space-x-3 text-gray-600">
                        <CalendarIcon className="text-green-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Inicio: {formattedStartDate} - {formattedStartTime}</span>
                        <CalendarIcon className="text-rojo w-6 h-6" />
                        <span className="text-sm md:text-base">Fin: {formattedEndDate} - {formattedEndTime}</span>
                    </div>

                    {/* Descripción del evento */}
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        {event.description}
                    </p>

                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        <strong>Categorias:</strong>
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 text-base md:text-lg leading-relaxed">
                        <li>Baby</li>
                        <li>Pre-Infante</li>
                        <li>Infante</li>
                        <li>Infantil</li>
                    </ul>


                    {/* Información del evento: Lugar */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <PlaceIcon className="text-blue-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Nombre del lugar: {event.location.placeName}</span>
                    </div>

                    {/* Información del evento: Coordenadas y mapa */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <MapIcon className="text-orange-600 w-6 h-6" />
                        {event.location.coordinates ? (
                            <button onClick={openModal} className="text-sm md:text-base rounded-lg hover:text-rojo underline underline-offset-4 text-start">
                                <span className="text-sm md:text-base">Dirección: {event.location.street}, {event.location.district}, {event.location.province}, {event.location.department}</span>
                            </button>
                        )
                            : (
                                <span className="text-sm md:text-base">Dirección: {event.location.street}, {event.location.district}, {event.location.province}, {event.location.department}</span>
                            )}
                    </div>

                    <div className="flex items-center space-x-3 text-gray-600">
                        <IdIcon className="text-purple-600 w-6 h-6" />
                        <span className="text-sm md:text-base">Academia: {event.academyName}</span>
                    </div>
                </article>

                <div className="order-2 lg:order-2 w-full bg-[#FFF6F6] p-6 rounded-lg shadow-md h-fit">
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        <strong>Precios:</strong>
                    </p>
                    <ul className="list-disc pl-6 text-gray-700 text-base md:text-lg leading-relaxed">
                        <li>Seriado: S/.15</li>
                        <li>Individual: S/.15</li>
                        <li>Novel Novel: S/.50</li>
                        <li>Novel Abierto A: S/.50</li>
                        <li>Novel Abierto B: S/.50</li>
                        <li>Nacional: S/.60</li>
                    </ul>
                    <button
                        onClick={onInscribir}
                        className="mt-3 w-2/5 ml-auto block text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-2 px-4 rounded-lg text-sm md:text-base font-medium transition-all duration-300 hover:shadow-md hover:from-red-600 hover:to-red-700 active:scale-[0.98]" >
                        Inscribir
                    </button>
                </div>
            </div>
        </div>
    );
};

export default EventoInformacion;
