import React, { useState } from "react";
import { User, X } from "lucide-react";
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
  const [showImageModal, setShowImageModal] = useState(false);

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
  const accentColor = isParticipante ? "text-blue-600" : "text-purple-600";
  const dotColor = isParticipante ? "bg-blue-500" : "bg-purple-500";

  // Función para obtener el texto de género simplificado
  const getGenderText = (gender: string) => {
    const genderLower = gender.toLowerCase();
    
    if (genderLower.includes('masculino') || genderLower.includes('hombre') || genderLower.includes('m')) {
      return "Masculino";
    } else if (genderLower.includes('femenino') || genderLower.includes('mujer') || genderLower.includes('f')) {
      return "Femenino";
    } else {
      return gender; // Devuelve el valor original si no coincide con los casos conocidos
    }
  };

  // Manejar click en imagen
  const handleImageClick = () => {
    if (participant.profileImage) {
      setShowImageModal(true);
    }
  };

  return (
    <>
      <div className={`rounded-lg ${bgColor} border ${borderColor} p-3 shadow-sm transition-all duration-200 hover:shadow-md`}>
        <div className="flex items-center gap-3">
          {/* Avatar compacto con click */}
          <div className="flex-shrink-0">
            {participant.profileImage ? (
              <img 
                src={participant.profileImage} 
                alt={`${participant.firstName} ${participant.lastName}`}
                className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleImageClick}
              />
            ) : (
              <div className={`w-10 h-10 rounded-full ${bgColor} border-2 border-white shadow-sm flex items-center justify-center`}>
                <User className={`w-5 h-5 ${accentColor}`} />
              </div>
            )}
          </div>

          {/* Información en línea */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`}></div>
              <span className={`text-xs font-medium ${accentColor} uppercase tracking-wide`}>
                {isParticipante ? "Participante" : "Pareja"}
              </span>
            </div>
            
            <h5 className="font-bold text-gray-900 text-sm truncate mb-1">
              {participant.firstName} {participant.lastName}
            </h5>
            
            <div className="flex items-center gap-3 text-xs text-gray-600">
              <span>{participantCategory}</span>
              <span>•</span>
              <span>{calcularEdad(participant.birthDate)} años</span>
              <span>•</span>
              <span>{getGenderText(participant.gender)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal para imagen grande */}
      {showImageModal && participant.profileImage && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-2xl max-h-[90vh] bg-white rounded-lg overflow-hidden">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute top-3 right-3 z-10 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <img
              src={participant.profileImage}
              alt={`${participant.firstName} ${participant.lastName}`}
              className="w-full h-full object-contain"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
              <h3 className="text-white font-bold text-lg">
                {participant.firstName} {participant.lastName}
              </h3>
              <p className="text-gray-200 text-sm">
                {participantCategory} • {calcularEdad(participant.birthDate)} años
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ParticipantCard;