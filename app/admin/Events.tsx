import React from "react";
import useEvents from "../hooks/useEvents"; // Suponiendo que tienes un hook similar para eventos

const Events: React.FC = () => {
  const { events, loadingEvents, error } = useEvents();

  // Calcular estadísticas de eventos
  const totalEvents = events.length;
  const typeStats = events.reduce((acc, event) => {
    acc[event.eventType] = (acc[event.eventType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusStats = events.reduce((acc, event) => {
    acc[event.status] = (acc[event.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Estadísticas de Eventos</h1>

      {loadingEvents ? (
        <p>Cargando eventos...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta Total de Eventos */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Total de Eventos</h2>
            <p className="text-2xl font-bold">{totalEvents}</p>
          </div>

          {/* Tarjeta por Tipo de Evento */}
          {Object.keys(typeStats).map((type) => (
            <div key={type} className="bg-white p-4 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold">Tipo: {type}</h2>
              <p className="text-2xl font-bold">{typeStats[type]}</p>
            </div>
          ))}

          {/* Tarjeta por Estado de Evento */}
          {Object.keys(statusStats).map((status) => (
            <div key={status} className="bg-white p-4 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold">Estado: {status}</h2>
              <p className="text-2xl font-bold">{statusStats[status]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Events;
