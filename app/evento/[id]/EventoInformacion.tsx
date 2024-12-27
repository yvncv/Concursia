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
        <>
            {/* Información del evento (mitad del espacio en pantallas grandes) */}
            <div className="mt-6 w-3/4 mx-auto">
                <div className="flex flex-col lg:flex-row">
                    <div className="lg:w-1/2">
                        <p>{evento.descripcion}</p>
                        <div className="space-y-2 mt-4">
                            <div className="flex items-center">
                                <CalendarIcon className="text-red-600 w-5 h-5 mr-2" />
                                <span>{formattedDate}</span>
                            </div>
                            <div className="flex items-center">
                                <PlaceIcon className="text-blue-600 w-5 h-5 mr-2" />
                                <span>{evento.lugar}</span>
                                {evento.ubicacion && (
                                    <button onClick={openModal} className="ml-2 text-red-500">
                                        Ver mapa
                                    </button>
                                )}
                            </div>
                            <div className="flex items-center">
                                <ClockIcon className="text-green-600 w-5 h-5 mr-2" />
                                <span>{formattedTime}</span>
                            </div>
                        </div>
                    </div>
                    <div className="lg:w-1/2 mt-6 lg:mt-0">
                        {evento.imagen && (
                            <Image src={evento.imagen} alt={evento.nombre} width={900} height={600} className="object-cover rounded-lg" />
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default EventoInformacion;
