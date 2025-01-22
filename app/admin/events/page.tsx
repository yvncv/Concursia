"use client";
import React from "react";
import useEvents from "@/app/hooks/useEvents";
import { Eye, FilePenLine, Trash2 } from "lucide-react"; // Iconos de react-icons

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Eventos</h1>

      {loadingEvents ? (
        <p>Cargando eventos...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Descripción</th>
                <th className="border border-gray-300 px-4 py-2">Fecha Inicio</th>
                <th className="border border-gray-300 px-4 py-2">Fecha Fin</th>
                <th className="border border-gray-300 px-4 py-2">Tipo</th>
                <th className="border border-gray-300 px-4 py-2">Estado</th>
                <th className="border border-gray-300 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{event.name}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {event.description.length > 50
                      ? `${event.description.substring(0, 50)}...`
                      : event.description}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(event.startDate.toDate()).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {new Date(event.endDate.toDate()).toLocaleDateString()}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">{event.eventType}</td>
                  <td className="border border-gray-300 px-4 py-2">
                    {event.status === "active" ? "Activo" : "Inactivo"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      title="Visualizar"
                      onClick={() => console.log("Visualizar", event.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      className="text-yellow-500 hover:text-yellow-700 mr-2"
                      title="Editar"
                      onClick={() => console.log("Editar", event.id)}
                    >
                      <FilePenLine />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                      onClick={() => console.log("Eliminar", event.id)}
                    >
                      <Trash2 />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Events;
