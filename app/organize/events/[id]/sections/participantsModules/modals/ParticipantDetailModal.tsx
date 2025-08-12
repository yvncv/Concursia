import React from "react";
import { XCircle } from "lucide-react";
import InfoUser from '@/app/ui/info-user/InfoUser';
import { Participant } from "@/app/types/participantType";
import { User } from "@/app/types/userType";
import { Ticket } from "@/app/types/ticketType";

interface ParticipantRow {
  participant: Participant;
  users: User[];
  ticket?: Ticket | null;
}

interface ParticipantDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  participantRow: ParticipantRow | null;
}

const ParticipantDetailModal: React.FC<ParticipantDetailModalProps> = ({
  isOpen,
  onClose,
  participantRow,
}) => {
  if (!isOpen || !participantRow) return null;

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
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || statusColors.default}`}>
        {status.charAt(0).toUpperCase() + status.slice(1).replaceAll('_', ' ')}
      </span>
    );
  };

  const getPhaseBadge = (phase: string) => {
    const phaseColors: Record<string, string> = {
      initial: 'bg-blue-100 text-blue-800',
      semifinals: 'bg-purple-100 text-purple-800',
      finals: 'bg-yellow-100 text-yellow-800',
      default: 'bg-gray-100 text-gray-800'
    };

    const phaseNames: Record<string, string> = {
      initial: 'Inicial',
      semifinals: 'Semifinales',
      finals: 'Finales'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${phaseColors[phase] || phaseColors.default}`}>
        {phaseNames[phase] || phase}
      </span>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[95vh] overflow-hidden">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Detalles del Participante</h2>
              <p className="text-purple-100 mt-1">
                Código: {participantRow.participant.code || 'Sin código asignado'}
              </p>
            </div>
            <button 
              onClick={onClose} 
              className="text-white hover:text-red-200 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-2 transition-all duration-200"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Contenido scrolleable */}
        <div className="overflow-y-auto max-h-[calc(95vh-120px)]">
          <div className="p-6 space-y-6">

            {/* Información básica */}
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl p-5 border border-gray-200">
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-purple-500 to-purple-600 rounded-full"></div>
                Información General
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Código</p>
                  <p className="font-mono text-lg font-bold text-gray-800">
                    {participantRow.participant.code || 'Sin código'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Categoría</p>
                  <p className="font-semibold text-gray-800">{participantRow.participant.category}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Modalidad</p>
                  <p className="font-semibold text-gray-800">{participantRow.participant.level}</p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Estado</p>
                  <div className="mt-1">
                    {getStatusBadge(participantRow.participant.status)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Fase</p>
                  <div className="mt-1">
                    {getPhaseBadge(participantRow.participant.phase)}
                  </div>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200">
                  <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Fecha de Registro</p>
                  <p className="font-semibold text-gray-800">
                    {participantRow.participant.createdAt.toDate().toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            {/* Información de usuarios */}
            <div className="bg-white rounded-xl border border-gray-200">
              <InfoUser users={participantRow.users} title={'Participante(s)'} />
            </div>

            {/* Información del ticket */}
            {participantRow.ticket && (
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                  Información del Ticket
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">ID del Ticket</p>
                    <p className="font-mono text-sm font-bold text-blue-800">
                      #{participantRow.ticket.id.slice(0, 8)}
                    </p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Estado del Ticket</p>
                    <p className="font-semibold text-blue-800">{participantRow.ticket.status}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Tipo de Inscripción</p>
                    <p className="font-semibold text-blue-800">{participantRow.ticket.inscriptionType}</p>
                  </div>
                  <div className="bg-white rounded-lg p-3 border border-blue-200">
                    <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Monto Pagado</p>
                    <p className="font-bold text-lg text-blue-800">
                      S/ {participantRow.ticket.totalAmount.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Puntajes */}
            {participantRow.participant.scoreIds && participantRow.participant.scoreIds.length > 0 && (
              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-5 border border-yellow-200">
                <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                  <div className="w-2 h-6 bg-gradient-to-b from-yellow-500 to-yellow-600 rounded-full"></div>
                  Puntajes
                </h3>
                <div className="bg-white rounded-lg p-4 border border-yellow-200">
                  <p className="text-gray-700 flex items-center gap-2">
                    <span className="text-2xl font-bold text-yellow-600">
                      {participantRow.participant.scoreIds.length}
                    </span>
                    <span>puntaje{participantRow.participant.scoreIds.length !== 1 ? 's' : ''} registrado{participantRow.participant.scoreIds.length !== 1 ? 's' : ''}.</span>
                  </p>
                </div>
              </div>
            )}

            {/* Sin puntajes */}
            {(!participantRow.participant.scoreIds || participantRow.participant.scoreIds.length === 0) && (
              <div className="bg-gray-50 rounded-xl p-5 border border-gray-200 text-center">
                <p className="text-gray-500">Este participante aún no tiene puntajes registrados.</p>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetailModal;