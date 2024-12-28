import CalendarIcon from "@/app/ui/icons/calendar";
import ClockIcon from "@/app/ui/icons/clock";
import PlaceIcon from "@/app/ui/icons/place";
import { Evento } from "@/app/ui/evento/eventoType";
import Image from "next/image";

const EventoInformacion = ({ evento, openModal }: { evento: Evento, openModal: () => void }) => {

    const formattedDate = new Date(evento.fecha.seconds * 1000).toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
    });

    const formattedTime = new Date(evento.fecha.seconds * 1000).toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="w-full flex flex-col items-center justify-start pt-[15px] sm:pt-[40px] pb-[20px] min-h-[350px]">
            <div className="w-[90%] md:w-[60%] lg:w-[90%] grid grid-cols-1 lg:grid-cols-2 gap-10 mb-20">
                <article className="order-2 lg:order-1 w-full bg-white p-6 rounded-lg shadow-md flex flex-col gap-6">
                    {/* Descripción del evento */}
                    <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                        {evento.descripcion}
                    </p>

                    {/* Información del evento: Fecha */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <CalendarIcon className="text-rojo w-6 h-6" />
                        <span className="text-sm md:text-base">{formattedDate}</span>
                    </div>

                    {/* Información del evento: Lugar */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <PlaceIcon className="text-blue-600 w-6 h-6" />
                        <span className="text-sm md:text-base">{evento.lugar}</span>
                        {evento.ubicacion && (
                            <button onClick={openModal} className="text-rojo text-sm md:text-base">
                                Ver mapa
                            </button>
                        )}
                    </div>

                    {/* Información del evento: Hora */}
                    <div className="flex items-center space-x-3 text-gray-600">
                        <ClockIcon className="text-green-600 w-6 h-6" />
                        <span className="text-sm md:text-base">{formattedTime}</span>
                    </div>
                </article>

                {/* Imagen del evento */}
                <div className="order-1 lg:order-2 w-full flex items-start justify-center h-[100%]">
                    {evento.imagen && (
                        <Image src={evento.imagen} alt={evento.nombre} width={900} height={600} className="object-cover rounded-lg shadow-lg" />
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventoInformacion;
