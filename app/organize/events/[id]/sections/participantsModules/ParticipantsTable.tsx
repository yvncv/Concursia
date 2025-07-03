import React from "react";
import { Eye, Tag, UserCircle } from "lucide-react";
import { Participant } from "@/app/types/participantType";
import { User } from "@/app/types/userType";
import { Ticket } from "@/app/types/ticketType";
import { decryptValue } from '@/app/utils/encryption';

interface ParticipantRow {
  participant: Participant;
  users: User[];
  ticket?: Ticket | null;
}

interface ParticipantsTableProps {
  participants: ParticipantRow[];
  onViewParticipant: (participant: ParticipantRow) => void;
}

const ParticipantsTable: React.FC<ParticipantsTableProps> = ({
  participants,
  onViewParticipant,
}) => {
  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pagado: 'bg-green-100 text-green-800',
      ingresado: 'bg-blue-100 text-blue-800',
      en_tunel: 'bg-yellow-100 text-yellow-800',
      bailando: 'bg-purple-100 text-purple-800',
      evaluado: 'bg-indigo-100 text-indigo-800',
      clasificado: 'bg-emerald-100 text-emerald-800',
      eliminado: 'bg-red-100 text-red-800',
      ganador: 'bg-orange-100 text-orange-800',
      active: 'bg-green-100 text-green-800',
      eliminated: 'bg-red-100 text-red-800',
      default: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || statusColors.default}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ')}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Código
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Participante(s)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modalidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {participants.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                  <div className="flex flex-col items-center gap-2">
                    <UserCircle className="w-12 h-12 text-gray-300" />
                    <p className="text-lg font-medium">No se encontraron participantes</p>
                    <p className="text-sm">Intenta ajustar los filtros de búsqueda</p>
                  </div>
                </td>
              </tr>
            ) : (
              participants.map((row) => (
                <tr key={row.participant.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Tag className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="font-mono text-sm font-medium">
                        {row.participant.code || '-'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="space-y-2">
                      {row.users.map((user, index) => (
                        <div key={user?.id} className="flex items-center gap-3">
                          {user?.profileImage && user?.profileImage !== '' ? (
                            <img
                              src={user?.profileImage as string}
                              alt={user?.firstName}
                              className="w-8 h-8 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = '';
                                (e.target as HTMLImageElement).className = 'hidden';
                              }}
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <UserCircle className="w-5 h-5 text-gray-500" />
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${user?.gender === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {user?.firstName} {user?.lastName}
                              </p>
                              <p className="text-xs text-gray-500 font-mono">
                                {decryptValue(user?.dni)}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-gray-900">
                      {row.participant.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-700">
                      {row.participant.level}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(row.participant.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => onViewParticipant(row)}
                      className="text-blue-600 hover:text-blue-900 hover:bg-blue-50 p-2 rounded-lg transition-all duration-200"
                      title="Ver detalles"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ParticipantsTable;