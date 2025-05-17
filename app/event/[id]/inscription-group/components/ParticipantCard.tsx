import React from "react";
import { User, Mail, Calendar, Award, UserCheck } from "lucide-react";
import { Timestamp } from "firebase/firestore";

interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  dni: string;
  birthDate: Timestamp;
  gender: string;
  category: string;
  [key: string]: any;
}

interface ParticipantCardProps {
  participant: Participant;
  calcularEdad: (birthDate: Timestamp) => string | number;
  type: "participante" | "pareja";
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, calcularEdad, type }) => {
  if (!participant) return null;

  const isParticipante = type === "participante";
  const cardTitle = isParticipante ? "Participante" : "Pareja";

  const bgColor = isParticipante ? "bg-blue-50" : "bg-purple-50";
  const borderColor = isParticipante ? "border-blue-200" : "border-purple-200";
  const titleColor = isParticipante ? "text-blue-700" : "text-purple-700";
  const iconColor = isParticipante ? "text-blue-600" : "text-purple-600";

  return (
    <div className={`rounded-md ${bgColor} border ${borderColor} p-3 shadow-sm text-sm`}>
      <h4 className={`font-semibold ${titleColor} mb-2 flex items-center`}>
        {cardTitle}
      </h4>

      <div className="space-y-1">
        <p className="flex items-center text-gray-700">
          <User className={`w-3.5 h-3.5 mr-1 ${iconColor}`} />
          {participant.firstName} {participant.lastName}
        </p>
        <p className="flex items-center text-gray-700">
          <Award className={`w-3.5 h-3.5 mr-1 ${iconColor}`} />
          {participant.category || "No asignada"}
        </p>
        <p className="flex items-center text-gray-700">
          <Calendar className={`w-3.5 h-3.5 mr-1 ${iconColor}`} />
          {calcularEdad(participant.birthDate)} años
        </p>
        <p className="flex items-center text-gray-700">
          <Mail className={`w-3.5 h-3.5 mr-1 ${iconColor}`} />
          DNI: {participant.dni}
        </p>
      </div>
    </div>
  );
};

export default ParticipantCard;
