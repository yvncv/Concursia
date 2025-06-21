import React, { useState, useEffect } from "react";
import { CustomEvent } from "@/app/types/eventType";
import useTicket from "@/app/hooks/useTicket";
import useUsers from "@/app/hooks/useUsers";
import { Ticket, TicketEntry } from "@/app/types/ticketType";
import { User } from "@/app/types/userType";
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  Users,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  ListRestart,
  Trophy,
  School,
  UserCircle,
  CreditCard,
  Calendar,
} from "lucide-react";
import DeleteTicket from "@/app/organize/events/[id]/sections/ticketsModules/deleteTicket";
import ConfirmTicket from "@/app/organize/events/[id]/sections/ticketsModules/confirmTicket";
import FilterModal, { FilterOptions } from "@/app/organize/events/[id]/sections/ticketsModules/modals/FilterModal";
import useAcademies from "@/app/hooks/useAcademies";
import { decryptValue } from "@/app/utils/encryption";

interface TicketsProps {
  event: CustomEvent;
}

interface TicketCardProps {
  ticket: Ticket;
  ticketUsers: Record<string, User>;
  academyNames: Record<string, string>;
  onView: () => void;
  onDelete: () => void;
  onConfirm: () => void;
}

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  const getPageNumbers = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || i >= currentPage - delta && i <= currentPage + delta) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`p-2 rounded-lg transition-colors ${currentPage === 1
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      {getPageNumbers().map((number, index) => (
        <React.Fragment key={index}>
          {number === '...' ? (
            <span className="px-3 py-2 text-gray-500">...</span>
          ) : (
            <button
              onClick={() => onPageChange(number as number)}
              className={`min-w-[40px] h-10 rounded-lg transition-colors ${currentPage === number
                  ? 'bg-blue-600 text-white font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
                }`}
            >
              {number}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`p-2 rounded-lg transition-colors ${currentPage === totalPages
            ? 'text-gray-400 cursor-not-allowed'
            : 'text-gray-700 hover:bg-gray-100'
          }`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

const TicketCard: React.FC<TicketCardProps> = ({
  ticket,
  ticketUsers,
  academyNames,
  onView,
  onDelete,
  onConfirm,
}) => {
  const [expanded, setExpanded] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pagado':
        return 'text-green-600 bg-green-100';
      case 'Pendiente':
        return 'text-yellow-600 bg-yellow-100';
      case 'Anulado':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getInscriptionTypeIcon = (type: string) => {
    switch (type) {
      case 'Individual':
        return <UserCircle className="w-4 h-4" />;
      case 'Grupal':
        return <Users className="w-4 h-4" />;
      case 'Presencial':
        return <UserCircle className="w-4 h-4" />;
      default:
        return <UserCircle className="w-4 h-4" />;
    }
  };

  const renderUserInfo = (userId: string) => {
    const user = ticketUsers[userId];
    if (!user) return <span className="text-gray-500">Usuario no encontrado</span>;

    return (
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${user?.gender === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} />
        <span className="text-sm">{decryptValue(user?.dni)} - {user?.firstName} {user?.lastName}</span>
      </div>
    );
  };

  const renderEntry = (entry: TicketEntry, index: number) => (
    <div key={index} className="bg-gray-50 rounded-lg p-4 mb-3">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Modalidad y Categoría</span>
          </div>
          <p className="text-sm"><span className="font-medium">{entry.level}</span> - {entry.category}</p>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <School className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Academia(s)</span>
          </div>
          <div className="text-sm">
            {(() => {
              // Prioridad 1: academiesName (academias nuevas)
              if (entry.academiesName && entry.academiesName.length > 0) {
                return entry.academiesName
                  .filter(name => name && name.trim() !== '')
                  .map((name, idx) => <div key={idx}>{name}</div>);
              }

              // Prioridad 2: academiesId (academias existentes)
              if (entry.academiesId && entry.academiesId.length > 0) {
                return entry.academiesId
                  .filter(id => id && id.trim() !== '')
                  .map((academyId, idx) => (
                    <div key={idx}>
                      {academyNames[academyId] || "Academia no encontrada"}
                    </div>
                  ));
              }

              // Default: Libre
              return <span className="text-gray-500">Libre</span>;
            })()}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Participante(s)</span>
          </div>
          <div className="space-y-1">
            {entry.usersId.map((userId) => (
              <div key={userId}>
                {renderUserInfo(userId)}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden mb-4">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              {expanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm text-gray-600">#{ticket.id.slice(0, 8)}</span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  {getInscriptionTypeIcon(ticket.inscriptionType)}
                  <span>{ticket.inscriptionType}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>{ticket.registrationDate.toDate().toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <CreditCard className="w-4 h-4" />
                  <span className="font-medium">S/ {ticket.totalAmount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onView}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Ver detalles"
            >
              <Eye className="w-5 h-5" />
            </button>
            {ticket.status === 'Pendiente' && (
              <button
                onClick={onConfirm}
                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                title="Confirmar ticket"
              >
                <CheckCircle className="w-5 h-5" />
              </button>
            )}
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar ticket"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Content */}
      {expanded && (
        <div className="p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Inscripciones:</h3>
          {ticket.entries.map((entry, index) => renderEntry(entry, index))}
        </div>
      )}
    </div>
  );
};

const Tickets: React.FC<TicketsProps> = ({ event }) => {
  const { tickets, loading, error, fetchTickets } = useTicket(event.id);
  const { getUserById } = useUsers();
  const { academies, loadingAcademies, errorAcademies } = useAcademies();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [academyNames, setAcademyNames] = useState<Record<string, string>>({});
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [dniInput, setDniInput] = useState<string>("");
  const [tableLoading, setTableLoading] = useState(false);
  const [ticketUsers, setTicketUsers] = useState<Record<string, Record<string, User>>>({});

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [ticketsPerPage] = useState(10); // You can adjust this number

  const [availableFilters, setAvailableFilters] = useState({
    modalities: [] as string[],
    categories: [] as string[],
    academies: [] as string[]
  });

  useEffect(() => {
    if (tickets.length && academies.length) {
      setFilteredTickets(tickets);

      const academyNameMap: Record<string, string> = {};
      academies.forEach((academy) => {
        academyNameMap[academy.id] = academy.name;
      });

      setAcademyNames(academyNameMap);
      loadAllUsers();
    }
  }, [tickets, academies]);

  // Reset to first page when filtered tickets change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTickets]);

  const loadAllUsers = async () => {
    const usersMap: Record<string, Record<string, User>> = {};

    for (const ticket of tickets) {
      usersMap[ticket.id] = {};

      for (const entry of ticket.entries) {
        for (const userId of entry.usersId) {
          const user = await getUserById(userId);
          if (user) {
            usersMap[ticket.id][userId] = user;
          }
        }
      }
    }

    setTicketUsers(usersMap);
    extractFilterValues(tickets, academyNames, usersMap);
  };

  const extractFilterValues = (
    ticketsList: Ticket[],
    academyNamesMap: Record<string, string>,
    usersMap: Record<string, Record<string, User>>
  ) => {
    const modalities = new Set<string>();
    const categories = new Set<string>();
    const academies = new Set<string>();

    ticketsList.forEach(ticket => {
      ticket.entries.forEach(entry => {
        if (entry.level) modalities.add(entry.level);
        if (entry.category) categories.add(entry.category);

        if (entry.academiesId && entry.academiesId.length > 0) {
          entry.academiesId.forEach(id => {
            if (academyNamesMap[id]) academies.add(academyNamesMap[id]);
          });
        }
      });
    });

    setAvailableFilters({
      modalities: Array.from(modalities),
      categories: Array.from(categories),
      academies: Array.from(academies)
    });
  };

  const openModal = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);

    const usersToFetch: User[] = [];
    for (const entry of ticket.entries) {
      for (const userId of entry.usersId) {
        if (ticketUsers[ticket.id]?.[userId]) {
          usersToFetch.push(ticketUsers[ticket.id][userId]);
        } else {
          const user = await getUserById(userId);
          if (user) usersToFetch.push(user);
        }
      }
    }
    setUsers(usersToFetch);
  };

  const handleSearchEventByDNI = async (dni: string) => {
    const dniRegex = /^[0-9]{8}$/;
    const dniClean = dni.trim();

    if (dniClean && !dniRegex.test(dniClean)) {
      console.error("Ingrese un DNI válido de 8 dígitos");
      return;
    }

    setTableLoading(true);

    if (!dniClean) {
      setFilteredTickets(tickets);
      setTableLoading(false);
      return;
    }

    const results = tickets.filter(ticket => {
      const ticketUserMap = ticketUsers[ticket.id] || {};
      return Object.values(ticketUserMap).some(user =>
        user?.dni.includes(dniClean)
      );
    });

    setFilteredTickets(results);
    setTableLoading(false);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
    setUsers([]);
  };

  const handleDeleteTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmTicket = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsConfirmModalOpen(true);
  };

  const handleModalClose = () => {
    setIsDeleteModalOpen(false);
    setIsConfirmModalOpen(false);
    closeModal();
    fetchTickets();
  };

  const applyFilters = (filterOptions: FilterOptions) => {
    const { modalities, categories, academies } = filterOptions;

    if (!modalities.length && !categories.length && !academies.length) {
      setFilteredTickets(tickets);
      return;
    }

    const filtered = tickets.filter(ticket => {
      return ticket.entries.some(entry => {
        const modalityMatch = modalities.length === 0 || modalities.includes(entry.level);
        const categoryMatch = categories.length === 0 || categories.includes(entry.category);

        const academyMatch = academies.length === 0 || (() => {
          // Buscar en academiesName primero
          if (entry.academiesName && entry.academiesName.length > 0) {
            return entry.academiesName.some(name => academies.includes(name));
          }

          // Buscar en academiesId como fallback
          if (entry.academiesId && entry.academiesId.length > 0) {
            return entry.academiesId.some(academyId => {
              const academyName = academyNames[academyId];
              return academyName && academies.includes(academyName);
            });
          }

          // Si no hay academias, incluir "Libre" en el filtro
          return academies.includes("Libre");
        })();

        return modalityMatch && categoryMatch && academyMatch;
      });
    });

    setFilteredTickets(filtered);
  };

  // Pagination calculations
  const indexOfLastTicket = currentPage * ticketsPerPage;
  const indexOfFirstTicket = indexOfLastTicket - ticketsPerPage;
  const currentTickets = filteredTickets.slice(indexOfFirstTicket, indexOfLastTicket);
  const totalPages = Math.ceil(filteredTickets.length / ticketsPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  // Statistics
  const stats = {
    total: filteredTickets.length,
    pending: filteredTickets.filter(t => t.status === 'Pendiente').length,
    paid: filteredTickets.filter(t => t.status === 'Pagado').length,
    canceled: filteredTickets.filter(t => t.status === 'Anulado').length,
    totalAmount: filteredTickets.reduce((sum, t) => sum + t.totalAmount, 0),
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Gestión de Tickets</h1>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Tickets</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="p-3 bg-gray-100 rounded-full">
                <Users className="w-6 h-6 text-gray-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pendientes</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-full">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pagados</p>
                <p className="text-2xl font-bold text-green-600">{stats.paid}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Anulados</p>
                <p className="text-2xl font-bold text-red-600">{stats.canceled}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-full">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total S/</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalAmount.toFixed(2)}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <CreditCard className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Buscar por DNI..."
                value={dniInput}
                onChange={(e) => setDniInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearchEventByDNI(dniInput)}
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>

            <button
              onClick={() => {
                setDniInput("");
                handleSearchEventByDNI("");
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              title="Limpiar búsqueda"
            >
              <ListRestart className="w-5 h-5" />
            </button>

            <button
              onClick={() => setIsFilterMenuOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              Filtrar
            </button>
          </div>
        </div>

        {/* Tickets List */}
        <div className="space-y-4">
          {tableLoading ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando tickets...</p>
            </div>
          ) : currentTickets.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No se encontraron tickets</p>
            </div>
          ) : (
            <>
              {currentTickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
                  ticket={ticket}
                  ticketUsers={ticketUsers[ticket.id] || {}}
                  academyNames={academyNames}
                  onView={() => openModal(ticket)}
                  onDelete={() => handleDeleteTicket(ticket)}
                  onConfirm={() => handleConfirmTicket(ticket)}
                />
              ))}

              {/* Pagination Information */}
              <div className="text-center text-sm text-gray-600 mt-4">
                Mostrando {indexOfFirstTicket + 1} - {Math.min(indexOfLastTicket, filteredTickets.length)} de {filteredTickets.length} tickets
              </div>

              {/* Pagination Component */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Ticket #{selectedTicket.id.slice(0, 8)}</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-600">
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Estado</p>
                  <p className={`font-medium ${selectedTicket.status === 'Pagado' ? 'text-green-600' :
                    selectedTicket.status === 'Pendiente' ? 'text-yellow-600' :
                      'text-red-600'
                    }`}>{selectedTicket.status}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tipo de Inscripción</p>
                  <p className="font-medium">{selectedTicket.inscriptionType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Registro</p>
                  <p className="font-medium">{selectedTicket.registrationDate.toDate().toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Fecha de Pago</p>
                  <p className="font-medium">
                    {selectedTicket.paymentDate ? selectedTicket.paymentDate.toDate().toLocaleString() : 'No disponible'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total a Pagar</p>
                  <p className="font-medium text-lg">S/ {selectedTicket.totalAmount.toFixed(2)}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Inscripciones</h3>
                {selectedTicket.entries.map((entry, i) => (
                  <div key={i} className="bg-gray-50 rounded-lg p-4 mb-3">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Modalidad - Categoría</p>
                        <p className="font-medium">{entry.level} - {entry.category}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Academia(s)</p>
                        <div>
                          {(() => {
                            // Prioridad 1: academiesName (academias nuevas)
                            if (entry.academiesName && entry.academiesName.length > 0) {
                              return entry.academiesName
                                .filter(name => name && name.trim() !== '')
                                .join(", ") || "Libre";
                            }

                            // Prioridad 2: academiesId (academias existentes)
                            if (entry.academiesId && entry.academiesId.length > 0) {
                              return entry.academiesId
                                .filter(id => id && id.trim() !== '')
                                .map(id => academyNames[id] || "Academia no encontrada")
                                .join(", ");
                            }

                            // Default: Libre
                            return "Libre";
                          })()}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Participantes</p>
                        <div className="space-y-1">
                          {entry.usersId.map((userId) => {
                            const user = ticketUsers[selectedTicket.id]?.[userId];
                            return user ? (
                              <div key={userId} className="flex items-center gap-2">
                                <div className={`w-2 h-2 rounded-full ${user?.gender === 'Masculino' ? 'bg-blue-500' : 'bg-pink-500'}`} />
                                <span className="text-sm">{decryptValue(user?.dni)} - {user?.firstName} {user?.lastName}</span>
                              </div>
                            ) : (
                              <span key={userId} className="text-sm text-gray-500">Usuario no encontrado</span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selectedTicket.status === "Pendiente" && (
                <div className="flex gap-2 mt-6">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    onClick={() => handleConfirmTicket(selectedTicket)}
                  >
                    Confirmar Pago
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    onClick={() => handleDeleteTicket(selectedTicket)}
                  >
                    Eliminar Ticket
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <FilterModal
        isOpen={isFilterMenuOpen}
        onClose={() => setIsFilterMenuOpen(false)}
        onApplyFilters={applyFilters}
        availableFilters={availableFilters}
      />

      <DeleteTicket
        isOpen={isDeleteModalOpen}
        onClose={handleModalClose}
        ticket={selectedTicket!}
      />
      <ConfirmTicket
        isOpen={isConfirmModalOpen}
        onClose={handleModalClose}
        ticket={selectedTicket!}
      />
    </div>
  );
};

export default Tickets;