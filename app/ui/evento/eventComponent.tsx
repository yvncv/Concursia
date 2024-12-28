'use client';

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CalendarIcon from "../icons/calendar";
import ClockIcon from "../icons/clock";
import PlaceIcon from "../icons/place";
import { Evento } from "./eventoType";

export default function EventComponent({ event }: { event: Evento }) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Store the current element reference in a variable
    const element = elementRef.current;

    // Make sure the ref is defined before observing it
    if (element) {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        },
        { threshold: 0.1 }
      );

      observer.observe(element);

      // Cleanup function
      return () => {
        observer.unobserve(element); // Unobserve the element when the component unmounts or changes
      };
    }
  }, []);

  return (
    <div
      ref={elementRef}
      className={`relative flex flex-col rounded-[5px] shadow overflow-hidden cursor-pointer transition-all ${isVisible ? 'animate-fadeIn' : 'opacity-0'}`}
      key={event.id}
      style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }} // Ancho consistente
    >
      <div className="relative w-full h-[90px] sm:h-48 md:h-56 overflow-hidden flex justify-center items-center">
        {/* Imagen desenfocada de fondo */}
        {event.imagen && (
          <div className="absolute inset-0 -z-10">
            <Image
              src={event.imagen}
              className="h-full object-cover blur-sm scale-110"
              alt={`Blur background of ${event.nombre}`}
              width={900}
              height={200}
              priority={false}
            />
          </div>
        )}
        {/* Imagen principal */}
        {event.imagen && (
          <Image
            src={event.imagen}
            className="object-cover"
            alt={event.nombre}
            width={900}
            height={200}
            priority={false}
          />
        )}
      </div>
      <div className="justify-center flex items-center text-white bg-red-700 py-1">
        {event.tipoEvento}
      </div>
      <div className="p-4 pt-1">
        <h5 className="text-start text-s-mmc text-[15px] md:text-[20px] font-bold truncate text-rojo">
          {event.nombre}
        </h5>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500 truncate">
          <CalendarIcon className="text-red-600 w-[15px]" />
          <span>{event.fecha.toDate().toLocaleDateString()}</span>
        </div>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500 truncate">
          <PlaceIcon className="text-blue-600 w-[15px]" />
          <span>{event.lugar}</span>
        </div>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500 truncate">
          <ClockIcon className="text-green-600 w-[15px]" />
          <span>{event.fecha.toDate().toLocaleTimeString()}</span>
        </div>
        <p className="text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500 truncate line-clamp-1">
          {event.descripcion}
        </p>
        <Link
          href={`/evento/${event.id}`}
          className="text-[13.5px] md:text-[15.5px] block mt-4 text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
        >
          Más información
        </Link>
      </div>
    </div>
  );
}
