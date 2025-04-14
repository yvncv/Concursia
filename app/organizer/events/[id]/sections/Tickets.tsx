/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useEffect } from "react";
import { CustomEvent } from "@/app/types/eventType";
import useTicket from "@/app/hooks/useTicket";
import useUsers from "@/app/hooks/useUsers";
import { Ticket } from "@/app/types/ticketType";
import { User } from "@/app/types/userType";
import { ChevronRight, CircleX, Eye, Search, Trash2 } from "lucide-react";
import DeleteTicket from "@/app/organizer/events/[id]/sections/ticketsModules/deleteTicket";
import ConfirmTicket from "@/app/organizer/events/[id]/sections/ticketsModules/confirmTicket";

interface TicketsProps {
  event: CustomEvent;
}

const Tickets: React.FC<TicketsProps> = ({ event }) => {
  const { tickets, loading, error, fetchTickets } = useTicket(event.id);
  const { getUserById } = useUsers();
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
  const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    setFilteredTickets(tickets);
  }, [tickets]);

  const openModal = async (ticket: Ticket) => {
    setSelectedTicket(ticket);
    setIsModalOpen(true);

    if (ticket.level === "Individual" || ticket.level === "Seriado") {
      const user1 = await getUserById(ticket.usersId[0]);
      setUsers([user1].filter(Boolean) as User[]);
    } else {
      const user1 = await getUserById(ticket.usersId[0]);
      const user2 = await getUserById(ticket.usersId[1]);
      setUsers([user1, user2].filter(Boolean) as User[]);
    }
  };

  const [dniInput, setDniInput] = useState<string>("");
  const [tableLoading, setTableLoading] = useState(false);

  const handleSearchEventByDNI = async (dni: string) => {
    const dniRegex = /^[0-9]{8}$/;
    const dniClean = dni.trim();

    if (dniClean && !dniRegex.test(dni)) {
      console.error("Ingrese un DNI válido de 8 dígitos");
      return;
    }

    const results = [];
    setTableLoading(true);
    for (const ticket of tickets) {
      try {
        const user1 = await getUserById(ticket.usersId[0]);
        if (
          ticket.level !== "Individual" &&
          ticket.level !== "Seriado" &&
          ticket.usersId.length > 1
        ) {
          const user2 = await getUserById(ticket.usersId[1]);
          if (
            (user1 && user1.dni.includes(dniClean)) ||
            (user2 && user2.dni.includes(dniClean))
          ) {
            results.push(ticket);
          }
        } else {
          if (user1 && user1.dni.includes(dniClean)) {
            results.push(ticket);
          }
        }
      } catch (error) {
        console.error("Error al buscar ticket:", error);
      }
    }
    setTableLoading(false);
    setFilteredTickets(results);
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setIsModalOpen(false);
    setUsers([]);
  };

  const toggleFilterMenu = () => {
    setIsFilterMenuOpen(!isFilterMenuOpen);
  };

  const filterTickets = (filter: string, criteria: string) => {
    if (criteria === "Todos") {
      setFilteredTickets(tickets);
    } else {
      if (filter === "levels") {
        const filtered = tickets.filter((ticket) => ticket.level === criteria);
        setFilteredTickets(filtered);
      }
      if (filter === "categories") {
        const filtered = tickets.filter(
          (ticket) => ticket.category === criteria
        );
        setFilteredTickets(filtered);
      }
      if (filter === "status") {
        const filtered = tickets.filter((ticket) => ticket.status === criteria);
        setFilteredTickets(filtered);
      }
    }
    setIsFilterMenuOpen(false);
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

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }
  if (error) {
    return <div className="p-6 text-red-500">{error}</div>;
  }

  const headers: string[] = [
    "ID",
    "Modalidad",
    "Categoría",
    "Fecha de Registro",
    "Estado",
    "Acciones",
  ];
  const levels: string[] = [
    "Todos",
    "Seriado",
    "Individual",
    "Novel Novel",
    "Novel Abierto",
    "Novel Abierto A",
    "Novel Abierto B",
    "Nacional",
  ];
  const categories: string[] = [
    "Baby",
    "Pre-Infante",
    "Infante",
    "Infantil",
    "Junior",
    "Juvenil",
    "Adulto",
    "Senior",
    "Master",
    "Oro",
  ];
  const status: string[] = ["Pendiente", "Cancelado"];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-extrabold mb-4">Tickets del Evento</h1>
      <section className="w-full flex justify-between items-center h-10 mb-4 gap-x-2">
        <form
          className="h-full w-3/4 relative"
          action=""
          onSubmit={async (e) => {
            e.preventDefault();
            await handleSearchEventByDNI(dniInput);
          }}
        >
          <input
            className="h-full px-4 w-full rounded-lg border-2 border-gray-700 focus:outline-none "
            placeholder="Buscar por dni..."
            onChange={(e) => setDniInput((e.target as HTMLInputElement).value)}
            type="text"
          />
          <Search className="absolute top-1/2 -translate-y-1/2 right-4" />
        </form>
        <button
          onClick={toggleFilterMenu}
          className="px-4 h-full bg-white w-1/4 border-2 border-gray-700 rounded-lg text-black flex justify-center items-center gap-x-2"
        >
          <span>Filtrar Tickets</span>
          <ChevronRight
            size={16}
            className={`${
              isFilterMenuOpen && "rotate-90"
            } transition-transform duration-150 ease-in-out`}
          />
        </button>
      </section>
      {isFilterMenuOpen && (
        <div className="mb-4 p-4 bg-gray-100 rounded shadow flex">
          <div className="flex-1">
            {levels.map((level) => (
              <button
                onClick={() => filterTickets("levels", level)}
                className="block w-full text-left px-4 py-2 hover:underline"
                key={level}
              >
                {level}
              </button>
            ))}
          </div>
          <div className="flex-1">
            {categories.map((category) => (
              <button
                onClick={() => filterTickets("categories", category)}
                className="block w-full text-left px-4 py-2 hover:underline"
                key={category}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="flex-1">
            {status.map((state) => (
              <button
                onClick={() => filterTickets("status", state)}
                className="block w-full text-left px-4 py-2 hover:underline"
                key={state}
              >
                {state}
              </button>
            ))}
          </div>
        </div>
      )}
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
              <>
                {filteredTickets.map((ticket) => (
                  <tr key={ticket.id}>
                    <td className="px-4 py-3 border-b">{ticket.id}</td>
                    <td className="px-4 py-3 border-b">{ticket.level}</td>
                    <td className="px-4 py-3 border-b">{ticket.category}</td>
                    <td className="px-4 py-3 border-b">
                      {ticket.registrationDate.toDate().toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 border-b">{ticket.status}</td>
                    <td className="px-4 py-3 border-b">
                      <div className="flex justify-around">
                        <Eye
                          size={20}
                          className="text-blue-500 hover:underline hover:cursor-pointer"
                          onClick={() => openModal(ticket)}
                        >
                          Detalles
                        </Eye>
                        <Trash2
                          size={20}
                          className="text-red-500 hover:underline hover:cursor-pointer"
                          onClick={() => handleDeleteTicket(ticket)}
                        >
                          Detalles
                        </Trash2>
                      </div>
                    </td>
                  </tr>
                ))}
              </>
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
          <div className="bg-white p-6 rounded-lg shadow-lg">
            {/* Modal de detalles */}
            <div className="flex justify-between mt-4">
              <h2 className="text-xl font-bold mb-4">Detalles del Ticket</h2>
              <div>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <CircleX
                    size={40}
                    className="text-blue-500 hover:text-red-600 transition-colors"
                  />
                </button>
              </div>
            </div>

            <table className="w-full border-collapse">
              <tbody>
                <tr>
                  <td className="px-4 py-2 font-semibold">ID:</td>
                  <td className="px-4 py-2">{selectedTicket.id}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Modalidad:</td>
                  <td className="px-4 py-2">{selectedTicket.level}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Categoría:</td>
                  <td className="px-4 py-2">{selectedTicket.category}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">
                    Fecha de Registro:
                  </td>
                  <td className="px-4 py-2">
                    {selectedTicket.registrationDate.toDate().toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Fecha de Pago:</td>
                  <td className="px-4 py-2">
                    {selectedTicket.paymentDate
                      ? selectedTicket.paymentDate.toDate().toLocaleString()
                      : "No disponible"}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Estado:</td>
                  <td className="px-4 py-2">{selectedTicket.status}</td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Participantes:</td>
                  <td className="px-4 py-2">
                    <div className="space-y-2">
                      {users.map((user) => (
                        <div key={user.id}>
                          {user.dni} {user.firstName} {user.lastName}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-2 font-semibold">Academias:</td>
                  <td className="px-4 py-2">
                    <div className="space-y-2">
                      <div>
                        {selectedTicket.academiesName.map((academy, index) => (
                          <div key={index}>{academy}</div>
                        ))}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <div className="flex justify-between mt-4">
              <button className="text-blue-500 hover:underline"></button>
              {selectedTicket.status === "Pendiente" && (
                <div>
                  <button
                    className="bg-green-500 rounded-xl p-4 text-white hover:underline ml-2"
                    onClick={() => handleConfirmTicket(selectedTicket)}
                  >
                    Confirmar
                  </button>
                  <button
                    className="bg-red-500 rounded-xl p-4 text-white hover:underline ml-2"
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

      <DeleteTicket
        isOpen={isDeleteModalOpen}
        onClose={() => {
          handleModalClose();
        }}
        ticket={selectedTicket!} // Use non-null assertion operator
      />
      <ConfirmTicket
        isOpen={isConfirmModalOpen}
        onClose={() => {
          handleModalClose();
        }}
        ticket={selectedTicket!} // Use non-null assertion operator
      />
    </div>
  );
};

export default Tickets;
