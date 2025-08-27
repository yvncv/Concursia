import React, { useState } from "react";
import {
  Ticket,
  Users,
  Calendar,
  Clock,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle
} from "lucide-react";
import { useAcademyGroupTickets } from "@/app/hooks/tickets/useAcademyGroupTickets";

interface GroupTicketsListProps {
  academyId: string | null | undefined;
}

const GroupTicketsList: React.FC<GroupTicketsListProps> = ({ academyId }) => {
  const [expandedTicket, setExpandedTicket] = useState<string | null>(null);

  // Hook que obtiene tickets reales
  const { tickets, loading, error } = useAcademyGroupTickets(academyId, { realtime: true, limit: 500 });

  const toggleExpanded = (ticketId: string) => {
    setExpandedTicket(expandedTicket === ticketId ? null : ticketId);
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Pagado':
        return 'text-green-600 bg-green-100';
      case 'Cancelado':
        return 'text-red-600 bg-red-100';
      case 'Expirado':
        return 'text-gray-600 bg-gray-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Pendiente':
        return <Clock className="w-4 h-4" />;
      case 'Aprobado':
        return <CheckCircle className="w-4 h-4" />;
      case 'Rechazado':
        return <XCircle className="w-4 h-4" />;
      case 'Expirado':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <AlertCircle className="w-4 h-4" />;
    }
  };

  const formatDate = (date?: Date | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUniqueAcademies = (entries: any[]) => {
    const academies = new Set<string>();
    entries.forEach(entry => {
      (entry.academiesName || []).forEach((name: string) => academies.add(name));
    });
    return Array.from(academies);
  };

  const getTotalParticipants = (entries: any[]) => {
    return entries.reduce((total: number, entry: any) => total + (Array.isArray(entry.usersId) ? entry.usersId.length : 0), 0);
  };

  const getCategoriesCount = (entries: any[]) => {
    const categories = new Map<string, number>();
    entries.forEach(entry => {
      const category = entry.category || 'Sin categoría';
      const count = categories.get(category) || 0;
      const add = Array.isArray(entry.usersId) ? entry.usersId.length : 1;
      categories.set(category, count + add);
    });
    return categories;
  };

  // UI: loading / error
  if (!academyId) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
        <p className="text-gray-600">No se proporcionó academyId. Pasa academyId al componente para listar tickets.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
        <p className="text-gray-600">Cargando tickets...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 border border-red-200 shadow-sm text-center">
        <p className="text-red-600">Error cargando tickets: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Ticket className="w-5 h-5 mr-2 text-blue-600" />
          Tickets Grupales de mi Academia ({tickets.length})
        </h3>
      </div>

      {tickets.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Ticket className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay tickets grupales</p>
          <p className="text-sm text-gray-400 mt-1">
            Los tickets grupales aparecerán aquí una vez creados
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => {
            const isExpanded = expandedTicket === ticket.id;
            const uniqueAcademies = getUniqueAcademies(ticket.entries || []);
            const totalParticipants = getTotalParticipants(ticket.entries || []);
            const categoriesCount = getCategoriesCount(ticket.entries || []);

            return (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
              >
                {/* Header del ticket */}
                <div
                  className="p-4 bg-gray-50 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => toggleExpanded(ticket.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      {/* Status */}
                      <div className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${getStatusColor(ticket.status)}`}>
                        {getStatusIcon(ticket.status)}
                        <span className="ml-1">{ticket.status || "—"}</span>
                      </div>

                      {/* Academia principal */}
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {uniqueAcademies[0] || "Academia"}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Ticket #{(ticket.id || "").toString().slice(-8).toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-6">
                      {/* Resumen rápido */}
                      <div className="text-right text-sm">
                        <div className="flex items-center text-gray-600 mb-1">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{totalParticipants} participantes</span>
                        </div>
                        <div className="flex items-center text-green-600 font-semibold">
                          <DollarSign className="w-4 h-4 mr-1" />
                          <span>S/. {ticket.totalAmount ?? 0}</span>
                        </div>
                      </div>

                      {/* Botón expandir */}
                      <button className="text-gray-400 hover:text-gray-600">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Contenido expandido */}
                {isExpanded && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Información general */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          Información del Ticket
                        </h5>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de registro:</span>
                            <span className="font-medium">{formatDate(ticket.registrationDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Fecha de expiración:</span>
                            <span className="font-medium text-red-600">{formatDate(ticket.expirationDate)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tipo:</span>
                            <span className="font-medium">{ticket.inscriptionType}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">Event ID:</span>
                            <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{ticket.eventId}</span>
                          </div>
                        </div>
                      </div>

                      {/* Resumen por categorías */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3 flex items-center">
                          <Eye className="w-4 h-4 mr-2" />
                          Distribución por Categoría
                        </h5>
                        <div className="space-y-2">
                          {Array.from(categoriesCount.entries()).map(([category, count]) => (
                            <div key={category} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                              <span className="text-sm font-medium">{category}</span>
                              <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                {count} participante{count !== 1 ? 's' : ''}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Detalles de inscripciones */}
                    <div className="mt-6">
                      <h5 className="font-medium text-gray-900 mb-3">
                        Detalle de Inscripciones ({(ticket.entries || []).length})
                      </h5>
                      <div className="overflow-x-auto">
                        <table className="min-w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Nivel</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Categoría</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Academia</th>
                              <th className="px-3 py-2 text-left font-medium text-gray-600">Participantes</th>
                              <th className="px-3 py-2 text-right font-medium text-gray-600">Monto</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-200">
                            {(ticket.entries || []).map((entry, index) => (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-3 py-2 font-medium">{entry.level}</td>
                                <td className="px-3 py-2">
                                  <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                                    {entry.category}
                                  </span>
                                </td>
                                <td className="px-3 py-2 text-purple-600 font-medium">{(entry.academiesName || [])[0]}</td>
                                <td className="px-3 py-2">
                                  <div className="flex items-center">
                                    <Users className="w-3 h-3 mr-1 text-gray-400" />
                                    <span>{(entry.usersId || []).length}</span>
                                  </div>
                                </td>
                                <td className="px-3 py-2 text-right font-semibold text-green-600">
                                  S/. {entry.amount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                          <tfoot className="bg-gray-50">
                            <tr>
                              <td colSpan={4} className="px-3 py-2 text-right font-semibold">
                                Total:
                              </td>
                              <td className="px-3 py-2 text-right font-bold text-green-600 text-lg">
                                S/. {ticket.totalAmount ?? 0}
                              </td>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default GroupTicketsList;
