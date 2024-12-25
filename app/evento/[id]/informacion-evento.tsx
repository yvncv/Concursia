import React from "react";
import { Evento } from "../../ui/evento/eventoType";
import CalendarIcon from "@/app/ui/icons/calendar";
import ClockIcon from "@/app/ui/icons/clock";
import PlaceIcon from "@/app/ui/icons/place";
import Image from "next/image";

type InformacionEventoProps = {
  evento: Evento;
  formattedDate: string;
  formattedTime: string;
  capitalize: (text: string) => string;
  openModal: (evento: Evento) => void;
};

const InformacionEvento = ({
  evento,
  formattedDate,
  formattedTime,
  capitalize,
  openModal
}: InformacionEventoProps) => {
  return (
    <div className="mt-6">
      {/* Contenedor principal con Flexbox */}
      <div className="flex flex-col lg:flex-row space-x-6 text-2xl">
        {/* Información del evento */}
        <div className="lg:w-1/2 flex flex-col space-y-4 mx-auto">
          <p className="">{evento.descripcion}</p>
          <div className="space-y-2 flex flex-col">
            <div className="flex mt-4 items-center space-x-2 text-gray-600">
              <CalendarIcon className="text-red-600 w-5 h-5" />
              <span>
                <strong>Fecha:</strong> {capitalize(formattedDate)}
              </span>
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <PlaceIcon className="text-blue-600 w-5 h-5" />
              {evento.ubicacion && (
                <>
                  <span><strong>Lugar:</strong> {evento.lugar}.</span>
                  <span onClick={() => openModal(evento)} className="text-red-500 bold cursor-pointer">Click aquí para ver el mapa.</span>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <ClockIcon className="text-green-600 w-5 h-5" />
              <span><strong>Hora:</strong> {formattedTime}</span>
            </div>
            <div className="mt-4 text-gray-600">
              <strong>Tipo de Evento:</strong> {evento.tipoEvento}.
            </div>
          </div>
        </div>

        <div className="relative lg:w-1/2 mt-6 lg:mt-0 sm:start-0 mb-6 overflow-hidden border border-red-500">
          {/* Imagen desenfocada para los costados */}
          <div className="absolute inset-0 -z-10">
            {evento.imagen && (
              <Image
              src={evento.imagen}
              className="w-full h-full object-contain"
              alt={evento.nombre}
              width={900}
              height={200}
              priority={false}
              />
            )}
          </div>
          {/* Imagen principal */}
          {evento.imagen && (
            <Image
            src={evento.imagen}
            className="w-full h-full object-contain"
            alt={evento.nombre}
            width={900}
            height={200}
            priority={false}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default InformacionEvento;
