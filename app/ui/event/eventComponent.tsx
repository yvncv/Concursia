import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, MapPin } from "lucide-react";
import { CustomEvent } from "../../types/eventType";

export default function EventComponent({ event }: { event: CustomEvent }) {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const formatDate = (date: Date): string => {
    return date
      .toLocaleDateString("es-PE", {
        weekday: "long",
        day: "numeric",
        month: "long",
      })
      .replace(/^\w/, (c) => c.toUpperCase());
  };

  const formatTime = (timestamp: number): string =>
    new Date(timestamp * 1000).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });

  const formattedStartTime = event.startDate?.seconds
    ? formatTime(event.startDate.seconds)
    : "";

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
      className={`text-xs bg-white/95 md:text-bas relative flex flex-col rounded-lg shadow-md overflow-hidden cursor-pointer w-full max-w-[300px] mx-auto hover:shadow-lg hover:scale-[1.02] group`}
    >
      <div className="relative w-full h-[90px] sm:h-48 md:h-56 overflow-hidden flex justify-center items-center">
        {/* Fondo borroso */}
        {event.smallImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={event.smallImage}
              className="w-full h-full object-cover blur-sm scale-110 transition-transform duration-500 ease-in-out group-hover:scale-125"
              alt={`Fondo de ${event.name}`}
              fill
              priority={false}
              loader={({ src }) => src}
            />
            {/* Opcional: Overlay oscuro */}
            <div className="absolute inset-0 bg-black/30 z-10" />
          </div>
        )}

        {/* Imagen principal más pequeña y con fondo visible */}
        <div className="relative w-full h-[90px] sm:h-48 md:h-56 z-5 flex items-center justify-center">
          {event.smallImage && (
            <div className="w-[90%] h-[90%] relative">
              <Image
                src={event.smallImage}
                className="w-full h-full object-cover rounded-md shadow-lg transition-transform duration-500 group-hover:scale-110"
                alt={event.name}
                fill
                priority={false}
                loader={({ src }) => src}
              />
            </div>
          )}
        </div>
      </div>

      <div className="justify-center flex items-center text-white bg-red-600 md:py-1.5 text-sm font-medium">
        {event.eventType}
      </div>

      {/* animación de visibilidad */}
      <div
        className={`p-4 space-y-1 md:space-y-3 transition-opacity duration-500 ease-in-out ${isVisible ? "opacity-100 visible" : "opacity-0 invisible"
          }`}
      >
        <h5 className="text-sm md:text-xl font-bold truncate text-red-600">
          {event.name}
        </h5>

        <p className="text-gray-600 test-sm md:text-md line-clamp-2">{event.description}</p>

        <div className="md:space-y-2 space-y-0">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="text-red-500 w-4 flex-shrink-0" />
            <span className="truncate">
              {formatDate(event.startDate.toDate())}
            </span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="text-green-500 w-4 flex-shrink-0" />
            <span className="truncate">{formattedStartTime}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="text-blue-500 w-4 flex-shrink-0" />
            <span className="truncate">{event.location.placeName}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-600">
            <BadgeCheck className="text-purple-500 w-4 flex-shrink-0" />
            <span className="truncate">{event.academyName}</span>
          </div>
        </div>

        <Link
          href={`/event/${event.id}`}
          className="block w-full mt-auto text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-1 md:py-2 md:px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:from-red-600 hover:to-red-700 active:scale-[0.98]"
        >
          Más información
        </Link>
      </div>
    </div>

  );
}
