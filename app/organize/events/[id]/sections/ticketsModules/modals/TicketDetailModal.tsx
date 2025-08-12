import React from "react";
import { Ticket } from "@/app/types/ticketType";
import { User } from "@/app/types/userType";
import { XCircle, Trophy, School, Users, CheckCircle, Trash2 } from "lucide-react";
import { decryptValue } from "@/app/utils/security/securityHelpers";

interface TicketDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticket: Ticket | null;
  ticketUsers: Record<string, User>;
  academyNames: Record<string, string>;
  onConfirm?: () => void;
  onDelete?: () => void;
}

const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  isOpen,
  onClose,
  ticket,
  ticketUsers,
  academyNames,
  onConfirm,
  onDelete,
}) => {
  if (!isOpen || !ticket) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
        
        {/* Header con gradiente */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 text-white">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Detalles del Ticket</h2>
              <p className="text-blue-100 mt-1">#{ticket.id.slice(0, 8)}</p>
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
            
            {/* Estado y badges */}
            <div className="flex items-center gap-3 mb-6">
              <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                ticket.status === 'Pagado' ? 'bg-green-100 text-green-700 border border-green-200' :
                ticket.status === 'Pendiente' ? 'bg-yellow-100 text-yellow-700 border border-yellow-200' :
                'bg-red-100 text-red-700 border border-red-200'
              }`}>
                {ticket.status}
              </span>
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200">
                {ticket.inscriptionType}
              </span>
            </div>

            {/* Información básica en cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200">
                <p className="text-xs text-gray-500 uppercase tracking-wide font-medium mb-1">Fecha de Registro</p>
                <p className="text-lg font-semibold text-gray-800">{ticket.registrationDate.toDate().toLocaleDateString()}</p>
                <p className="text-sm text-gray-600">{ticket.registrationDate.toDate().toLocaleTimeString()}</p>
              </div>
              
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                <p className="text-xs text-blue-600 uppercase tracking-wide font-medium mb-1">Fecha de Pago</p>
                <p className="text-lg font-semibold text-blue-800">
                  {ticket.paymentDate ? ticket.paymentDate.toDate().toLocaleDateString() : 'Pendiente'}
                </p>
                {ticket.paymentDate && (
                  <p className="text-sm text-blue-600">{ticket.paymentDate.toDate().toLocaleTimeString()}</p>
                )}
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                <p className="text-xs text-green-600 uppercase tracking-wide font-medium mb-1">Total a Pagar</p>
                <p className="text-2xl font-bold text-green-700">S/ {ticket.totalAmount.toFixed(2)}</p>
              </div>
            </div>

            {/* Inscripciones */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-6 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                Inscripciones
                <span className="text-sm font-normal text-gray-500">({ticket.entries.length} inscripción{ticket.entries.length !== 1 ? 'es' : ''})</span>
              </h3>
              
              {/* Estadísticas rápidas */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                  <p className="text-2xl font-bold text-blue-600">{ticket.entries.length}</p>
                  <p className="text-xs text-blue-700 uppercase tracking-wide">Inscripciones</p>
                </div>
                <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                  <p className="text-2xl font-bold text-purple-600">
                    {ticket.entries.reduce((total, entry) => total + entry.usersId.length, 0)}
                  </p>
                  <p className="text-xs text-purple-700 uppercase tracking-wide">Total Participantes</p>
                </div>
                <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                  <p className="text-2xl font-bold text-green-600">S/ {ticket.totalAmount.toFixed(2)}</p>
                  <p className="text-xs text-green-700 uppercase tracking-wide">Monto Total</p>
                </div>
              </div>

              {/* Tabla de inscripciones */}
              <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="text-left p-3 font-semibold text-gray-700">#</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Modalidad</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Categoría</th>
                        <th className="text-left p-3 font-semibold text-gray-700">Academia(s)</th>
                        <th className="text-center p-3 font-semibold text-gray-700">Participantes</th>
                        <th className="text-right p-3 font-semibold text-gray-700">Monto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {ticket.entries.map((entry, i) => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-600">
                            {String(i + 1).padStart(2, '0')}
                          </td>
                          <td className="p-3">
                            <span className="font-medium text-gray-800">{entry.level}</span>
                          </td>
                          <td className="p-3 text-gray-700">{entry.category}</td>
                          <td className="p-3">
                            <div className="max-w-xs">
                              {(() => {
                                if (entry.academiesName && entry.academiesName.length > 0) {
                                  const academyList = entry.academiesName
                                    .filter(name => name && name.trim() !== '')
                                    .join(", ") || "Libre";
                                  return <span className="text-gray-700">{academyList}</span>;
                                }

                                if (entry.academiesId && entry.academiesId.length > 0) {
                                  const academyList = entry.academiesId
                                    .filter(id => id && id.trim() !== '')
                                    .map(id => academyNames[id] || "Academia no encontrada")
                                    .join(", ");
                                  return <span className="text-gray-700">{academyList}</span>;
                                }

                                return <span className="text-gray-500 italic">Libre</span>;
                              })()}
                            </div>
                          </td>
                          <td className="p-3">
                            <div className="space-y-1">
                              {entry.usersId.map((userId) => {
                                const user = ticketUsers[userId];
                                return user ? (
                                  <div key={userId} className="flex items-center gap-2 text-xs">
                                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${user?.gender === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                                    <div className="min-w-0 flex-1">
                                      <p className="font-medium text-gray-800 truncate">{user?.firstName} {user?.lastName}</p>
                                      <p className="text-gray-500">{decryptValue(user?.dni)}</p>
                                    </div>
                                  </div>
                                ) : (
                                  <span key={userId} className="text-xs text-red-500 italic">Usuario no encontrado</span>
                                );
                              })}
                            </div>
                          </td>
                          <td className="p-3 text-right font-semibold text-green-600">
                            S/ {entry.amount ? entry.amount.toFixed(2) : '0.00'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50 border-t border-gray-200">
                      <tr>
                        <td colSpan={5} className="p-3 font-semibold text-gray-700 text-right">
                          Total:
                        </td>
                        <td className="p-3 text-right font-bold text-lg text-green-600">
                          S/ {ticket.totalAmount.toFixed(2)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            {ticket.status === "Pendiente" && (onConfirm || onDelete) && (
              <div className="border-t border-gray-200 pt-6">
                <div className="flex gap-3 justify-end">
                  {onDelete && (
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                      onClick={onDelete}
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar Ticket
                    </button>
                  )}
                  {onConfirm && (
                    <button
                      className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center gap-2"
                      onClick={onConfirm}
                    >
                      <CheckCircle className="w-4 h-4" />
                      Confirmar Pago
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketDetailModal;