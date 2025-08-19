import React from "react";
import { User } from "lucide-react";
import { Timestamp } from "firebase/firestore";

// Definición de tipos
interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: Timestamp;
  gender: string;
  phoneNumber?: string[];
  profileImage?: string;
  [key: string]: any;
}

interface ParticipantCardProps {
  participant: Participant;
  calcularEdad: (birthDate: Timestamp) => string | number;
  type: "participante" | "pareja";
  getParticipantCategory: (participante: { birthDate: Date }) => string;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ 
  participant, 
  calcularEdad, 
  type, 
  getParticipantCategory
}) => {
  if (!participant) return null;

  // Helper para convertir Timestamp a Date
  const convertToDate = (dateValue: any): Date => {
    if (!dateValue) return new Date();
    
    if (dateValue instanceof Timestamp) {
      return dateValue.toDate();
    }
    
    if (dateValue.toDate && typeof dateValue.toDate === 'function') {
      return dateValue.toDate();
    }
    
    if (dateValue instanceof Date) {
      return dateValue;
    }
    
    return new Date(dateValue);
  };

  // Obtener categoría dinámica
  const participantCategory = getParticipantCategory({ 
    birthDate: convertToDate(participant.birthDate) 
  });

  // Configuración de colores según el tipo
  const isParticipante = type === "participante";
  const bgColor = isParticipante ? "bg-blue-50" : "bg-purple-50";
  const borderColor = isParticipante ? "border-blue-200" : "border-purple-200";
  const titleColor = isParticipante ? "text-blue-700" : "text-purple-700";
  const indicatorColor = isParticipante ? "bg-blue-500" : "bg-purple-500";
  const accentColor = isParticipante ? "text-blue-600" : "text-purple-600";

  return (
    <div className={`rounded-lg ${bgColor} border ${borderColor} p-4 shadow-sm transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-start gap-4">
        {/* Foto del usuario */}
        <div className="flex-shrink-0">
          {participant.profileImage ? (
            <img 
              src={participant.profileImage} 
              alt={`${participant.firstName} ${participant.lastName}`}
              className="w-16 h-16 rounded-full object-cover border-2 border-white shadow-sm"
            />
          ) : (
            <div className={`w-16 h-16 rounded-full ${bgColor} border-2 border-white shadow-sm flex items-center justify-center`}>
              <User className={`w-8 h-8 ${accentColor}`} />
            </div>
          )}
        </div>

        {/* Información esencial */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <h4 className={`font-semibold ${titleColor} text-sm`}>
              {isParticipante ? "Participante" : "Pareja"}
            </h4>
            <div className={`w-3 h-3 rounded-full ${indicatorColor}`}></div>
          </div>

          {/* Nombre */}
          <h5 className="text-lg font-bold text-gray-900 mb-3">
            {participant.firstName} {participant.lastName}
          </h5>

          {/* Información en grid compacto */}
          <div className="grid grid-cols-3 gap-3 text-sm">
            {/* Categoría */}
            <div>
              <span className="text-xs text-gray-600 block mb-1">Categoría</span>
              <span className="font-medium text-gray-900">{participantCategory}</span>
            </div>
            
            {/* Edad */}
            <div>
              <span className="text-xs text-gray-600 block mb-1">Edad</span>
              <span className="font-medium text-gray-900">
                {calcularEdad(participant.birthDate)} años
              </span>
            </div>

            {/* Género */}
            <div>
              <span className="text-xs text-gray-600 block mb-1">Género</span>
              <span className="font-medium text-gray-900">
                {participant.gender}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;