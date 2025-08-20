// eventIndicators.tsx
import { Radio, Users, Wifi } from "lucide-react";
import { useState } from "react";

// Componente independiente para el indicador de EN VIVO
interface LiveIndicatorProps {
  isLive: boolean;
}

export function LiveIndicator({ isLive }: LiveIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div 
      className={`relative group transition-all duration-500 ease-in-out transform ${
        isLive 
          ? 'opacity-100 scale-100 translate-x-0' 
          : 'opacity-0 scale-95 translate-x-4 pointer-events-none'
      }`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Tooltip - Solo visible en pantallas medianas y grandes */}
      <div className={`hidden md:block absolute -top-10 lg:-top-12 right-0 bg-black/90 text-white text-xs px-2 py-1 lg:px-3 lg:py-1.5 rounded-md lg:rounded-lg backdrop-blur-md whitespace-nowrap z-50 transition-all duration-200 ease-in-out ${
        showTooltip 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 translate-y-2'
      }`}>
        Evento en vivo
        <div className="absolute top-full right-2 w-0 h-0 border-l-2 border-r-2 border-t-2 lg:border-l-4 lg:border-r-4 lg:border-t-4 border-transparent border-t-black/90"></div>
      </div>

      {/* Contenedor principal */}
      <div className="relative bg-gradient-to-r from-red-500 to-red-600 text-white px-1.5 py-0.5 xs:px-2 xs:py-0.5 sm:px-2.5 sm:py-1 lg:px-3 lg:py-1.5 rounded-full shadow-md sm:shadow-lg border border-white/30 sm:border-2 sm:border-white/20 backdrop-blur-sm sm:backdrop-blur-md transform transition-transform duration-200 hover:scale-105">
        {/* Animación de pulso de fondo */}
        <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-20"></div>

        {/* Contenido */}
        <div className="relative flex items-center gap-0.5 xs:gap-1 lg:gap-1.5">
          {/* Punto animado */}
          <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
          
          {/* Texto */}
          <span className="text-xs xs:text-xs sm:text-xs md:text-sm font-bold tracking-wide animate-pulse">
            <span className="hidden xs:inline">EN VIVO</span>
            <span className="xs:hidden">EN VIVO</span>
          </span>
          
          {/* Icono - Solo visible en pantallas pequeñas y medianas */}
          <Wifi className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 md:hidden animate-bounce" />
          <Radio className="hidden md:block w-3 h-3 lg:w-4 lg:h-4 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// Componente actualizado del contador sin el modal interno
interface AcademyParticipantsCounterProps {
  count: number;
  visible: boolean;
  onShowParticipants?: () => void;
}

export function AcademyParticipantsCounter({ 
  count, 
  visible, 
  onShowParticipants 
}: AcademyParticipantsCounterProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Evitar que se propague al Link del componente padre
    e.stopPropagation();
    if (onShowParticipants) {
      onShowParticipants();
    }
  };

  const shouldShow = visible && count > 0;

  return (
    <div 
      className={`transition-all duration-500 ease-in-out transform ${
        shouldShow 
          ? 'opacity-100 scale-100 translate-x-0' 
          : 'opacity-0 scale-95 -translate-x-4 pointer-events-none'
      }`}
    >
      <button
        onClick={handleClick}
        className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-1.5 py-0.5 xs:px-2 xs:py-0.5 sm:px-2.5 sm:py-1 rounded-full shadow-lg border border-white/30 backdrop-blur-sm hover:scale-110 transition-all duration-200 active:scale-95 hover:shadow-xl hover:from-blue-600 hover:to-cyan-600"
      >
        <div className="flex items-center gap-0.5 xs:gap-1">
          <Users className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 transition-transform duration-200 group-hover:animate-pulse" />
          <span className="text-xs xs:text-xs sm:text-xs font-bold transition-all duration-200">
            {count}
          </span>
        </div>
      </button>
    </div>
  );
}

// Componente contenedor para los indicadores flotantes
interface FloatingIndicatorsProps {
  isLive: boolean;
  academyParticipantCount: number;
  showAcademyParticipants: boolean;
  academyParticipants: any[];
  academyName: string;
  eventName: string;
  onShowParticipants?: () => void;
}

export function FloatingIndicators({ 
  isLive, 
  academyParticipantCount, 
  showAcademyParticipants,
  onShowParticipants
}: FloatingIndicatorsProps) {
  return (
    <div className="absolute top-1 left-1 right-1 xs:top-1.5 xs:left-1.5 xs:right-1.5 sm:top-2 sm:left-2 sm:right-2 lg:top-3 lg:left-3 lg:right-3 z-30 flex justify-between items-start">
      {/* Indicador de participantes de la academia - Izquierda */}
      <div className="flex justify-start">
        <AcademyParticipantsCounter 
          count={academyParticipantCount}
          visible={showAcademyParticipants}
          onShowParticipants={onShowParticipants}
        />
      </div>

      {/* Indicador de en vivo - Derecha */}
      <div className="flex justify-end">
        <LiveIndicator isLive={isLive} />
      </div>
    </div>
  );
}