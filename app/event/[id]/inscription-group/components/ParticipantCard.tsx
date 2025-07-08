import React from "react";
import { User, Award, Calendar, Building2 } from "lucide-react";
import { Timestamp } from "firebase/firestore";
import { decryptValue } from "@/app/utils/security/securityHelpers";

// Definición de tipos
interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: Timestamp;
  gender: string;
  category: string;
  phoneNumber?: string[];
  [key: string]: any;
}

interface ParticipantCardProps {
  participant: Participant;
  calcularEdad: (birthDate: Timestamp) => string | number;
  type: "participante" | "pareja";
  academyName?: string;
  showDni?: boolean;
  compact?: boolean;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  calcularEdad, 
  type, 
  academyName,
  showDni = false,
  compact = false
}) => {
  if (!participant) return null;

  const isParticipante = type === "participante";
  const cardTitle = isParticipante ? "👤 Participante" : "👥 Pareja";

  // Configuración de colores según el tipo
  const colorConfig = {
    participante: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      title: "text-blue-700",
      indicator: "bg-blue-500",
      accent: "text-blue-600"
    },
    pareja: {
      bg: "bg-purple-50",
      border: "border-purple-200", 
      title: "text-purple-700",
      indicator: "bg-purple-500",
      accent: "text-purple-600"
    }
  };

  const colors = colorConfig[type];

  // Versión compacta para cuando hay poco espacio
  if (compact) {
    return (
      <div className={`rounded-lg ${colors.bg} border ${colors.border} p-3 shadow-sm`}>
        <div className="flex items-center justify-between mb-2">
          <h4 className={`font-semibold ${colors.title} text-sm`}>
            {cardTitle}
          </h4>
          <div className={`w-2 h-2 rounded-full ${colors.indicator}`}></div>
        </div>
        
        <div className="space-y-1 text-xs">
          <p className="font-medium text-gray-900">
            {participant.firstName} {participant.lastName}
          </p>
          <p className="text-gray-600">
            {participant.category} • {calcularEdad(participant.birthDate)} años
          </p>
          {academyName && (
            <p className={`${colors.accent} font-medium`}>{academyName}</p>
          )}
        </div>
      </div>
    );
  }

  // Versión completa
  return (
    <div className={`rounded-lg ${colors.bg} border ${colors.border} p-4 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between mb-3">
        <h4 className={`font-semibold ${colors.title} flex items-center`}>
          {cardTitle}
        </h4>
        <div className={`w-3 h-3 rounded-full ${colors.indicator}`}></div>
      </div>

      <div className="space-y-3 text-sm">
        {/* Nombre completo */}
        <div className="bg-white rounded-lg p-3 border">
          <div className="flex items-center mb-1">
            <User className="w-4 h-4 text-gray-600 mr-2" />
            <span className="font-medium text-gray-700">Nombre completo:</span>
          </div>
          <p className="text-gray-900 font-medium">
            {participant.firstName} {participant.lastName}
          </p>
        </div>
        
        {/* Información básica en grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white rounded-lg p-2 border">
            <div className="flex items-center mb-1">
              <Award className="w-3 h-3 text-gray-600 mr-1" />
              <span className="font-medium text-gray-700 text-xs">Categoría:</span>
            </div>
            <p className="text-gray-900 font-medium">{participant.category}</p>
          </div>
          
          <div className="bg-white rounded-lg p-2 border">
            <div className="flex items-center mb-1">
              <Calendar className="w-3 h-3 text-gray-600 mr-1" />
              <span className="font-medium text-gray-700 text-xs">Edad:</span>
            </div>
            <p className="text-gray-900 font-medium">
              {calcularEdad(participant.birthDate)} años
            </p>
          </div>
        </div>

        {/* Género */}
        <div className="bg-white rounded-lg p-2 border">
          <span className="font-medium text-gray-700 text-xs block mb-1">Género:</span>
          <p className="text-gray-900 flex items-center">
            {participant.gender === 'Masculino' ? (
              <>👨 Masculino</>
            ) : (
              <>👩 Femenino</>
            )}
          </p>
        </div>

        {/* Academia */}
        {academyName && (
          <div className="bg-white rounded-lg p-2 border">
            <div className="flex items-center mb-1">
              <Building2 className="w-3 h-3 text-gray-600 mr-1" />
              <span className="font-medium text-gray-700 text-xs">Academia:</span>
            </div>
            <p className={`font-medium ${colors.accent}`}>{academyName}</p>
          </div>
        )}

        {/* DNI (opcional) */}
        {showDni && (
          <div className="bg-white rounded-lg p-2 border">
            <span className="font-medium text-gray-700 text-xs block mb-1">DNI:</span>
            <p className="text-gray-900 font-mono text-sm">
              {decryptValue(participant.dni)}
            </p>
          </div>
        )}

        {/* Teléfono (si está disponible) */}
        {participant.phoneNumber && participant.phoneNumber.length > 0 && (
          <div className="bg-white rounded-lg p-2 border">
            <span className="font-medium text-gray-700 text-xs block mb-1">Teléfono:</span>
            <p className="text-gray-900 font-mono text-sm">
              {participant.phoneNumber[0]}
            </p>
          </div>
        )}
      </div>

      {/* Footer con información adicional */}
      <div className="mt-3 pt-3 border-t border-gray-200">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>ID: {participant.id.slice(0, 8)}...</span>
          <span className={`px-2 py-1 rounded-full ${colors.bg} ${colors.title} font-medium`}>
            {type === "participante" ? "Principal" : "Pareja"}
          </span>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;