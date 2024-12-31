import CalendarIcon from "@/app/ui/icons/calendar";
import ClockIcon from "@/app/ui/icons/clock";
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

    // Formateo de la fecha con mayúscula inicial en el día y mes
    const formattedDate = capitalizeFirstLetter(
        new Date(event.fecha.seconds * 1000).toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
        })
    );

    // Formateo de la hora
    const formattedTime = new Date(event.fecha.seconds * 1000).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });


    return (
        <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                <article className="order-2 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    {/* Nombre del event */}
                    <h1 className="text-2xl font-bold text-gray-800">{event.tipoEvento}: {event.nombre}</h1>

                    {/* Descripción del event */}
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        {event.descripcion}
                    </p>

                    {/* Dirección */}
                    {event.direccion && (
                        <p className="text-gray-600">
                            <strong>Dirección:</strong> {event.direccion}
                        </p>
                    )}

                    {/* Información del event: Fecha */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <CalendarIcon className="text-rojo w-6 h-6" />
                        <span className="text-sm md:text-base">{formattedDate}</span>
                    </div>

                    {/* Información del event: Lugar */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <PlaceIcon className="text-blue-600 w-6 h-6" />
                        <span className="text-sm md:text-base">{event.lugar.nombreLugar}</span>
                    </div>

                    {/* Información del event: Lugar */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <MapIcon className="text-orange-600 w-6 h-6" />
                        <span className="text-sm md:text-base">{event.lugar.calle}, {event.lugar.distrito}, {event.lugar.provincia}, {event.lugar.departamento}</span>
                        {event.lugar.coordenadas && (
                            <button onClick={openModal} className="text-rojo text-sm md:text-base border border-transparent border-b-rojo">
                                Ver mapa
                            </button>
                        )}
                    </div>

                    {/* Información del event: Hora */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <ClockIcon className="text-green-600 w-6 h-6" />
                        <span className="text-sm md:text-base">{formattedTime}</span>
                    </div>

                    {/* ID del event */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <IdIcon className="text-purple-600 w-6 h-6" />
                        <span className="text-sm md:text-base">ID del event: {event.id}</span>
                    </div>
                </article>

                {/* Imagen del event */}
                <div className="order-1 lg:order-2 w-full flex items-start justify-center h-[100%]">
                    {event.imagen && (
                        <Image src={event.imagen} alt={event.nombre} width={900} height={600} className="object-cover rounded-lg shadow-lg" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoInformacion;
