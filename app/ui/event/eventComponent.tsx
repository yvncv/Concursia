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

  const formatDate = (date: Date): string => {
    return date.toLocaleDateString("es-PE", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }).replace(/^\w/, (c) => c.toUpperCase());
  };

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
      className={`
        bg-white 
        relative 
        flex 
        flex-col 
        rounded-lg 
        shadow-md 
        overflow-hidden 
        cursor-pointer 
        transition-all 
        duration-300
        w-full 
        max-w-[300px] 
        mx-auto
        ${isVisible ? 'animate-fadeIn' : 'opacity-0'} 
        hover:shadow-lg 
        hover:scale-[1.02]
        group
      `}
    >
      <div className="relative w-full h-[90px] sm:h-48 md:h-56 overflow-hidden flex justify-center items-center">
        {event.smallImage && (
          <>
            <div className="absolute inset-0 -z-10">
              <Image
                src={event.smallImage}
                className="h-full w-full object-cover blur-sm scale-110 transition-transform duration-500 ease-in-out group-hover:scale-125"
                alt={`Fondo de ${event.name}`}
                width={900}
                height={200}
                priority={false}
              />
            </div>
            <Image
              src={event.smallImage}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              alt={event.name}
              width={900}
              height={200}
              priority={false}
            />
          </>
        )}
      </div>

      <div className="justify-center flex items-center text-white bg-red-600 py-1.5 text-sm font-medium">
        {event.eventType}
      </div>

      <div className="p-4 space-y-3">
        <h5 className="text-lg md:text-xl font-bold truncate text-red-600">
          {event.name}
        </h5>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-600">
            <CalendarIcon className="text-red-500 w-4 flex-shrink-0" />
            <span className="text-sm md:text-base truncate">
              {formatDate(event.startDate.toDate())}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <PlaceIcon className="text-blue-500 w-4 flex-shrink-0" />
            <span className="text-sm md:text-base truncate">
              {event.location.placeName}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <ClockIcon className="text-green-500 w-4 flex-shrink-0" />
            <span className="text-sm md:text-base truncate">
              {event.startDate.toDate().toLocaleTimeString()}
            </span>
          </div>

          <p className="text-sm md:text-base text-gray-600 line-clamp-2">
            {event.description}
          </p>
        </div>

        <Link
          href={`/event/${event.id}`}
          className="
            block 
            w-full 
            text-center 
            bg-gradient-to-r 
            from-red-500 
            to-red-600 
            text-white 
            py-2 
            px-4 
            rounded-lg 
            text-sm 
            md:text-base 
            font-medium
            transition-all 
            duration-300
            hover:shadow-md
            hover:from-red-600
            hover:to-red-700
            active:scale-[0.98]
          "
        >
          Más información
        </Link>
      </div>
    </div>
  );
}