// EventComponent.tsx
import { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Calendar, Clock, MapPin, Star, Users } from "lucide-react";
import useUser from "@/app/hooks/useUser";
import useEventParticipants from "@/app/hooks/useEventParticipants";
import { CustomEvent } from "../../types/eventType";
import { FloatingIndicators } from "./components/eventIndicators";

interface EventComponentProps {
  event: CustomEvent;
  onShowParticipants?: (participants: any[], academyName: string, eventName: string) => void;
}

export default function EventComponent({ event, onShowParticipants }: EventComponentProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const elementRef = useRef<HTMLDivElement | null>(null);
  const { user: currentUser } = useUser();
  const { participants, loadingParticipants } = useEventParticipants(event.id);

  // Calcular participantes de la academia del usuario
  const academyParticipants = useMemo(() => {
    if (!currentUser?.marinera?.academyId || !participants || loadingParticipants) {
      return [];
    }
    
    return participants.filter(participant => 
      participant.academiesId?.includes(currentUser.marinera.academyId!)
    );
  }, [participants, currentUser?.marinera?.academyId, loadingParticipants]);

  const academyParticipantCount = academyParticipants.length;

  // Verificar si el usuario pertenece a una academia y si hay participantes de su academia
  const userAcademyId = currentUser?.marinera?.academyId;
  const userAcademyName = currentUser?.marinera?.academyName;
  const showAcademyParticipants = userAcademyId && academyParticipantCount > 0;

  // Función para manejar la apertura del modal
  const handleShowParticipants = () => {
    if (onShowParticipants && userAcademyName) {
      onShowParticipants(academyParticipants, userAcademyName, event.name);
    }
  };

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
      className={`relative flex flex-col bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden 
        w-full max-w-[165px] sm:max-w-[190px] md:max-w-[220px] lg:max-w-[240px] xl:max-w-[260px] mx-auto 
        transition-all duration-500 ease-out hover:shadow-3xl hover:scale-[1.05] group 
        border border-white/20 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}
      style={{ minHeight: '320px' }}
    >
      {/* Header con imagen mejorada */}
      <div className="relative w-full h-32 sm:h-36 md:h-40 lg:h-44 xl:h-48 overflow-hidden rounded-t-3xl flex-shrink-0">
        {/* Fondo borroso con gradiente */}
        {event.smallImage && (
          <div className="absolute inset-0 z-0">
            <Image
              src={event.smallImage}
              className="w-full h-full object-cover blur-md scale-110 transition-all duration-700 ease-out group-hover:scale-125"
              alt={`Fondo de ${event.name}`}
              fill
              priority={false}
              loader={({ src }) => src}
            />
            {/* Gradiente overlay vibrante */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/30 via-red-500/20 to-purple-500/30 z-10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent z-10" />
          </div>
        )}

        {/* Imagen principal con marco flotante */}
        <div className="relative w-full h-full z-20 flex items-center justify-center pb-2 sm:pb-3">
          {event.smallImage && (
            <div className="w-[85%] h-[75%] relative group/image">
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl backdrop-blur-sm border border-white/40 shadow-2xl" />
              <Image
                src={event.smallImage}
                className={`w-full h-full object-cover rounded-2xl shadow-2xl transition-all duration-700 group-hover/image:scale-105 ${isImageLoaded ? 'opacity-100' : 'opacity-0'
                  }`}
                alt={event.name}
                fill
                priority={false}
                loader={({ src }) => src}
                onLoad={() => setIsImageLoaded(true)}
              />
              {/* Shimmer effect */}
              {!isImageLoaded && (
                <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-white/40 to-white/20 animate-pulse rounded-2xl" />
              )}

              {/* Overlay de brillo en hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/0 via-white/10 to-white/0 opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 rounded-2xl" />
            </div>
          )}
        </div>

        {/* Indicadores flotantes usando el componente separado */}
        <FloatingIndicators
          isLive={event.status === "live"}
          academyParticipantCount={academyParticipantCount}
          showAcademyParticipants={showAcademyParticipants}
          academyParticipants={academyParticipants}
          academyName={userAcademyName || ''}
          eventName={event.name}
          onShowParticipants={handleShowParticipants}
        />

        {/* Badge de tipo de evento mejorado */}
        <div className="absolute bottom-0 left-0 right-0 z-25">
          <div className="bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white py-1 sm:py-1.5 px-2 text-center relative overflow-hidden">
            <span className="relative font-bold text-[10px] sm:text-xs tracking-wider uppercase drop-shadow-sm">
              {event.eventType}
            </span>
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
          </div>
        </div>
      </div>

      {/* Contenido principal compacto */}
      <div className={`flex-1 p-2 sm:p-3 space-y-2 sm:space-y-3 bg-gradient-to-br from-white to-gray-50/50 transition-all duration-700 ease-out flex flex-col ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
        }`}
      >
        {/* Título con gradiente */}
        <div>
          <h5 className="text-xs sm:text-sm md:text-base font-bold bg-gradient-to-r from-red-600 via-orange-500 to-red-600 bg-clip-text text-transparent leading-tight line-clamp-2">
            {event.name}
          </h5>
          <div className="w-6 sm:w-8 h-0.5 bg-gradient-to-r from-red-500 via-orange-400 to-red-400 rounded-full mt-1" />
        </div>

        {/* Información detallada compacta */}
        <div className="space-y-1.5 sm:space-y-2 flex-1">
          {/* Fecha */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-red-50 to-orange-50 rounded-xl border border-red-100/80 hover:shadow-md transition-all duration-300">
            <div className="p-1 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-sm">
              <Calendar className="text-red-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span className="text-gray-700 font-medium text-[10px] sm:text-xs flex-1 truncate">
              {formatDate(event.startDate.toDate())}
            </span>
          </div>

          {/* Hora */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-xl border border-emerald-100/80 hover:shadow-md transition-all duration-300">
            <div className="p-1 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg shadow-sm">
              <Clock className="text-emerald-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span className="text-gray-700 font-medium text-[10px] sm:text-xs truncate flex-1">
              {formattedStartTime}
            </span>
          </div>

          {/* Ubicación */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl border border-purple-100/80 hover:shadow-md transition-all duration-300">
            <div className="p-1 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg shadow-sm">
              <MapPin className="text-purple-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span className="text-gray-700 font-medium text-[10px] sm:text-xs truncate flex-1">
              {event.location.placeName}
            </span>
          </div>

          {/* Academia */}
          <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-red-50 to-violet-50 rounded-xl border border-red-100/80 hover:shadow-md transition-all duration-300">
            <div className="p-1 bg-gradient-to-br from-red-100 to-red-200 rounded-lg shadow-sm">
              <BadgeCheck className="text-red-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
            </div>
            <span className="text-gray-700 font-medium text-[10px] sm:text-xs truncate flex-1">
              {event.academyName}
            </span>
          </div>

          {/* Participantes de tu academia (solo si hay) */}
          {showAcademyParticipants && (
            <div className="flex items-center gap-1.5 sm:gap-2 p-1.5 sm:p-2 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-100/80 hover:shadow-md transition-all duration-300">
              <div className="p-1 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg shadow-sm">
                <Users className="text-blue-600 w-2.5 h-2.5 sm:w-3 sm:h-3" />
              </div>
              <span className="text-gray-700 font-medium text-[10px] sm:text-xs truncate flex-1">
                {academyParticipantCount} de {userAcademyName}
              </span>
            </div>
          )}
        </div>

        {/* Botón CTA mejorado */}
        <div className="mt-auto">
          <Link
            href={`/event/${event.id}`}
            className="group/btn relative block w-full text-center bg-gradient-to-r from-red-500 via-orange-500 to-red-500 text-white py-1.5 sm:py-2 rounded-xl font-bold text-[10px] sm:text-xs transition-all duration-300 hover:shadow-xl hover:scale-105 active:scale-95 overflow-hidden"
          >
            <div className="relative flex items-center justify-center gap-1 z-10">
              <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 group-hover/btn:rotate-12 transition-transform duration-300" />
              <span className="tracking-wide drop-shadow-sm">Ver más</span>
            </div>

            {/* Efecto de brillo en hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover/btn:opacity-100 transition-opacity duration-500 -skew-x-12 translate-x-[-100%] group-hover/btn:translate-x-[100%]" />

            {/* Borde superior decorativo */}
            <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400" />
          </Link>
        </div>
      </div>

      {/* Efectos de hover sutiles sin cambio de color */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/2 via-transparent to-white/2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl" />
    </div>
  );
}