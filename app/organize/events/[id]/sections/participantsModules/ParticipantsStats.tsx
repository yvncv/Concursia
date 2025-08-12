import React from "react";
import { Participant } from "@/app/types/participantType";
import {
  Users,
  CheckCircle,
  Trophy,
  XCircle,
} from "lucide-react";

interface ParticipantRow {
  participant: Participant;
  users: any[];
  ticket?: any | null;
}

interface ParticipantsStatsProps {
  participants: ParticipantRow[];
}

const ParticipantsStats: React.FC<ParticipantsStatsProps> = ({ participants }) => {
  const stats = {
    total: participants.length,
    active: participants.filter(p => p.participant.status === 'active').length,
    inCompetition: participants.filter(p => p.participant.phase !== 'initial').length,
    eliminated: participants.filter(p => p.participant.status === 'eliminated').length,
  };

  const statCards = [
    {
      title: "Total Participantes",
      value: stats.total,
      icon: Users,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
      valueColor: "text-gray-900",
    },
    {
      title: "Activos",
      value: stats.active,
      icon: CheckCircle,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
      valueColor: "text-green-600",
    },
    {
      title: "En Competencia",
      value: stats.inCompetition,
      icon: Trophy,
      bgColor: "bg-purple-100",
      textColor: "text-purple-600",
      valueColor: "text-purple-600",
    },
    {
      title: "Eliminados",
      value: stats.eliminated,
      icon: XCircle,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
      valueColor: "text-red-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => (
        <div key={index} className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{stat.title}</p>
              <p className={`text-2xl font-bold ${stat.valueColor}`}>
                {stat.value}
              </p>
            </div>
            <div className={`p-3 ${stat.bgColor} rounded-full`}>
              <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ParticipantsStats;