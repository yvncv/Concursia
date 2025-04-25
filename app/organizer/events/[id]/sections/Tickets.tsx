import React, { useState, useEffect } from "react";
import { CustomEvent } from "@/app/types/eventType";
import useTicket from "@/app/hooks/useTicket";
import useUsers from "@/app/hooks/useUsers";
import { Ticket, TicketEntry } from "@/app/types/ticketType";
import { User } from "@/app/types/userType";
import { Academy } from "@/app/types/academyType";
import {
  ChevronRight,
  CircleX,
  Eye,
  ListRestart,
  Search,
  Trash2,
  Filter,
} from "lucide-react";
import DeleteTicket from "@/app/organizer/events/[id]/sections/ticketsModules/deleteTicket";
import ConfirmTicket from "@/app/organizer/events/[id]/sections/ticketsModules/confirmTicket";
import FilterModal, { FilterOptions } from "@/app/organizer/events/[id]/sections/ticketsModules/modals/FilterModal";
import { collection, getDoc, getDocs, doc } from "firebase/firestore";
import { db } from '@/app/firebase/config';
import useAcademies from "@/app/hooks/useAcademies";


interface TicketsProps {
  event: CustomEvent;
}

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
  
  // Estado para los filtros disponibles
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

  // Load all users and academies for tickets
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

  // Extract unique filter values from tickets
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
        // Add modality (level)
        if (entry.level) modalities.add(entry.level);
        
        // Add category
        if (entry.category) categories.add(entry.category);
        
        // Add academy names
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
      // If DNI search is empty, show all tickets
      setFilteredTickets(tickets);
      setTableLoading(false);
      return;
    }

    const results = tickets.filter(ticket => {
      const ticketUserMap = ticketUsers[ticket.id] || {};
      
      // Check if any user in this ticket has a matching DNI
      return Object.values(ticketUserMap).some(user => 
        user.dni.includes(dniClean)
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

  // Función para aplicar los filtros seleccionados
  const applyFilters = (filterOptions: FilterOptions) => {
    const { modalities, categories, academies } = filterOptions;
    
    if (!modalities.length && !categories.length && !academies.length) {
      // Si no hay filtros seleccionados, mostrar todos los tickets
      setFilteredTickets(tickets);
      return;
    }
    
    const filtered = tickets.filter(ticket => {
      return ticket.entries.some(entry => {
        const modalityMatch = modalities.length === 0 || modalities.includes(entry.level);
        const categoryMatch = categories.length === 0 || categories.includes(entry.category);
        
        // Check if any of the academies match the selected filter academy names
        const academyMatch = academies.length === 0 || (entry.academiesId && entry.academiesId.some(academyId => {
          const academyName = academyNames[academyId];
          return academyName && academies.includes(academyName);
        }));
        
        return modalityMatch && categoryMatch && academyMatch;
      });
    });
    
    setFilteredTickets(filtered);
  };

  const renderParticipantsByGender = (entry: TicketEntry, ticketId: string) => {
    const maleUsers: User[] = [];
    const femaleUsers: User[] = [];
    
    // Group users by gender
    entry.usersId.forEach(userId => {
      const user = ticketUsers[ticketId]?.[userId];
      if (user) {
        if (user.gender === 'Masculino') {
          maleUsers.push(user);
        } else if (user.gender === 'Femenino') {
          femaleUsers.push(user);
        }
      }
    });
    
    return (
      <div className="flex flex-col gap-1">
        {maleUsers.length > 0 && (
          <div>
            <span className="font-semibold">Varón: </span>
            {maleUsers.map((user, idx) => (
              <span key={user.id}>
                {user.dni} - {user.firstName} {user.lastName}
                {idx < maleUsers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        
        {femaleUsers.length > 0 && (
          <div>
            <span className="font-semibold">Mujer: </span>
            {femaleUsers.map((user, idx) => (
              <span key={user.id}>
                {user.dni} - {user.firstName} {user.lastName}
                {idx < femaleUsers.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        )}
        
        {maleUsers.length === 0 && femaleUsers.length === 0 && (
          <div>No hay información disponible</div>
        )}
      </div>
    );
  };

  const headers = [
    "ID",
    "Participante(s)",
    "Modalidad",
    "Categoría",
    "Academia",
    "Fecha de Registro",
    "Precio",
    "Estado",
    "Acciones",
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-4">Tickets del Evento</h1>
      <section className="w-full flex justify-between items-center h-10 mb-4 gap-x-2">
        <form
          className="h-full w-3/4 relative"
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSearchEventByDNI(dniInput);
          }}
        >
          <input
            className="h-full px-4 w-full rounded-lg border-2 border-gray-700 focus:outline-none"
            placeholder="Buscar por dni..."
            value={dniInput}
            onChange={(e) => setDniInput(e.target.value)}
            type="text"
          />
          <Search className="absolute top-1/2 -translate-y-1/2 right-4" />
        </form>
        <button
          title="Limpiar filtro de dni"
          onClick={async () => {
            setDniInput("");
            await handleSearchEventByDNI("");
          }}
          className="px-4 h-full bg-white w-20 border-2 border-gray-700 rounded-lg text-black flex justify-center items-center gap-x-2"
        >
          <ListRestart size={16} />
        </button>
        
        <button
          onClick={() => setIsFilterMenuOpen(true)}
          className="px-4 h-full bg-blue-600 hover:bg-blue-700 transition-colors w-1/4 border-0 rounded-lg text-white flex justify-center items-center gap-x-2"
        >
          <Filter size={16} />
          <span>Filtrar Tickets</span>
        </button>
      </section>

      <div className="overflow-x-auto rounded-lg p-4 bg-white shadow-md">
        <table className="w-full border-collapse shadow-md rounded-lg">
          <thead className="bg-gray-100">
            <tr>
              {headers.map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-sm font-medium text-black uppercase tracking-wider border-b"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {!tableLoading ? (
              filteredTickets.map((ticket) => (
                <tr key={ticket.id}>
                  <td className="px-4 py-3 border-b">{ticket.id}</td>
                  <td className="px-4 py-3 border-b">
                    {ticket.entries.map((entry, i) => (
                      <div key={i} className="mb-1">
                        {renderParticipantsByGender(entry, ticket.id)}
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {ticket.entries.map((entry, i) => (
                      <div key={i}>{entry.level}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {ticket.entries.map((entry, i) => (
                      <div key={i}>{entry.category}</div>
                    ))}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {ticket.entries.map((entry, i) => (
                      <div key={i}>
                        {entry.academiesId && entry.academiesId.length > 0 
                          ? entry.academiesId.map((academyId, idx) => (
                              <span key={idx}>
                                {academyNames[academyId] || "Academia no encontrada"}
                                {idx < entry.academiesId.length - 1 ? ", " : ""}
                              </span>
                            ))
                          : "Sin academia"
                        }
                      </div>
                    ))}
                  </td>
                  <td className="px-4 py-3 border-b">
                    {ticket.registrationDate.toDate().toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 border-b">
                    S/ {ticket.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-4 py-3 border-b">{ticket.status}</td>
                  <td className="px-4 py-3 border-b">
                    <div className="flex justify-around">
                      <Eye
                        size={20}
                        className="text-blue-500 hover:cursor-pointer"
                        onClick={() => openModal(ticket)}
                      />
                      <Trash2
                        size={20}
                        className="text-red-500 hover:cursor-pointer"
                        onClick={() => handleDeleteTicket(ticket)}
                      />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={headers.length} className="text-center py-4">
                  Cargando tickets...
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && selectedTicket && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-3xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalles del Ticket</h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-red-600">
                <CircleX size={32} />
              </button>
            </div>
            <div className="space-y-4">
              {selectedTicket.entries.map((entry, i) => (
                <div key={i} className="border-t pt-4">
                  <p><strong>Modalidad:</strong> {entry.level}</p>
                  <p><strong>Categoría:</strong> {entry.category}</p>
                  <p><strong>Academia(s):</strong> {
                    entry.academiesId && entry.academiesId.length > 0
                      ? entry.academiesId.map(id => academyNames[id] || "Academia no encontrada").join(", ")
                      : "Sin academia"
                  }</p>
                  <p><strong>Participantes:</strong></p>
                  <div className="ml-6 mt-2">
                    {renderParticipantsByGender(entry, selectedTicket.id)}
                  </div>
                </div>
              ))}
              <p><strong>Fecha de Registro:</strong> {selectedTicket.registrationDate.toDate().toLocaleString()}</p>
              <p><strong>Fecha de Pago:</strong> {selectedTicket.paymentDate ? selectedTicket.paymentDate.toDate().toLocaleString() : 'No disponible'}</p>
              <p><strong>Estado:</strong> {selectedTicket.status}</p>
              <p><strong>Total a pagar:</strong> S/ {selectedTicket.totalAmount.toFixed(2)}</p>
              {selectedTicket.status === "Pendiente" && (
                <div className="flex gap-2 mt-4">
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => handleConfirmTicket(selectedTicket)}
                  >
                    Confirmar
                  </button>
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                    onClick={() => handleDeleteTicket(selectedTicket)}
                  >
                    Eliminar
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