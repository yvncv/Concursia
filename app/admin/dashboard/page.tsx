"use client"
import React from "react";
import useUsers from "@/app/hooks/useUsers";
import useAcademies from "@/app/hooks/useAcademies";
import useEvents from "@/app/hooks/useEvents";

const Dashboard: React.FC = () => {
  const { users, loadingUsers } = useUsers();
  const { academias, loadingAcademias, errorAcademias } = useAcademies();
  const { events, loadingEvents } = useEvents();

  const eventosActivos = events.filter((evento) => evento.status === "en curso");
  const totalEventos = events.length;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tarjeta de Usuarios */}
        <div className="bg-white/80 p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold">Usuarios</h2>
          {loadingUsers ? (
            <p>Cargando...</p>
          ) : (
            <p className="text-2xl font-bold">{users.length}</p>
          )}
        </div>

        {/* Tarjeta de Academias */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold">Academias</h2>
          {loadingAcademias ? (
            <p>Cargando...</p>
          ) : errorAcademias ? (
            <p className="text-red-500">Error: {errorAcademias}</p>
          ) : (
            <p className="text-2xl font-bold">{academias.length}</p>
          )}
        </div>

        {/* Tarjeta de Eventos Activos */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold">Eventos Activos</h2>
          {loadingEvents ? (
            <p>Cargando...</p>
          ) : (
            <p className="text-2xl font-bold">{eventosActivos.length}</p>
          )}
        </div>

        {/* Tarjeta Total de Eventos */}
        <div className="bg-white p-4 shadow-md rounded-lg">
          <h2 className="text-lg font-semibold">Total de Eventos</h2>
          <p className="text-2xl font-bold">{totalEventos}</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
