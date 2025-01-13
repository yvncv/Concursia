import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import CalendarIcon from "../icons/calendar";
import ClockIcon from "../icons/clock";
import PlaceIcon from "../icons/marker";
import { Event } from "../../types/eventType";

export default function EventComponent({ event }: { event: Event }) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  // Función para capitalizar la primera letra de una cadena
  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  useEffect(() => {
    const element = elementRef.current;

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

      return () => {
        observer.unobserve(element);
      };
    }
  }, []);

  return ( 
    <div
      ref={elementRef}
      className={`bg-white relative flex flex-col rounded-[5px] shadow overflow-hidden cursor-pointer transition-all ${isVisible ? 'animate-fadeIn' : 'opacity-0'} hover:shadow-lg hover:scale-[1.02]`}
      key={event.id}
      style={{ width: "100%", maxWidth: "300px", margin: "0 auto" }}
    >
      <div className="relative w-full h-[90px] sm:h-48 md:h-56 overflow-hidden flex justify-center items-center">
        {/* Imagen desenfocada de fondo */}
        {event.smallImage && (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={event.smallImage}
                className="h-full object-cover blur-sm scale-110 transition-transform duration-500 ease-in-out group-hover:scale-125"
                alt={`Blur background of ${event.name}`}
                width={900}
                height={200}
                priority={false}
              />
            </div>
            <Image
              src={event.smallImage}
              className="object-cover"
              alt={event.smallImage}
              width={900}
              height={200}
              priority={false}
            />
          </>
        ) 
      }
      </div>
      <div className="justify-center flex items-center text-white bg-red-700 py-1">
        {event.eventType}
      </div>
      <div className="p-4 pt-1">
        <h5 className="text-start text-s-mmc text-[15px] md:text-[20px] font-bold truncate text-rojo">
          {event.name}
        </h5>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500">
          <CalendarIcon className="text-red-600 w-[15px]" />
          <span className="line-clamp-1 truncate">{capitalizeFirstLetter(event.startDate.toDate().toLocaleDateString("es-PE", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }))}</span>
        </div>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500">
          <PlaceIcon className="text-blue-600 w-[15px]" />
          <span className="line-clamp-1 truncate">{event.location.placeName}</span>
        </div>
        <div className="flex flex-row space-x-1 items-center align-center text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500">
          <ClockIcon className="text-green-600 w-[15px]" />
          <span className="line-clamp-1 truncate">{event.startDate.toDate().toLocaleTimeString()}</span>
        </div>
        <p className="text-[13.5px] flex-1 md:text-[15.5px] text-start text-gray-500 truncate line-clamp-2">
          {event.description}
        </p>
        <Link
          href={`/event/${event.id}`}
          className="text-[13.5px] md:text-[15.5px] block mt-4 text-center bg-gradient-to-r from-red-500 to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
        >
          Más información
        </Link>
      </div>
    </div>
  );
}
