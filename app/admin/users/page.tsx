"use client"
import React from "react";
import useUsers from "@/app/hooks/useUsers";

const Users: React.FC = () => {
  const { users, loadingUsers, error } = useUsers();

  // Calcular estadísticas de usuarios
  const totalUsers = users.length;
  const genderStats = users.reduce(
    (acc, user) => {
      if (user.gender === "Masculino") acc.male++;
      if (user.gender === "Femenino") acc.female++;
      return acc;
    },
    { male: 0, female: 0 }
  );

  const rolesStats = users.reduce((acc, user) => {
    acc[user.roleId] = (acc[user.roleId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Estadísticas de Usuarios</h1>

      {loadingUsers ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Tarjeta Total de Usuarios */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Total de Usuarios</h2>
            <p className="text-2xl font-bold">{totalUsers}</p>
          </div>

          {/* Tarjeta Género: Masculino */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Hombres</h2>
            <p className="text-2xl font-bold">{genderStats.male}</p>
          </div>

          {/* Tarjeta Género: Femenino */}
          <div className="bg-white p-4 shadow-md rounded-lg">
            <h2 className="text-lg font-semibold">Mujeres</h2>
            <p className="text-2xl font-bold">{genderStats.female}</p>
          </div>

          {/* Tarjetas por Roles */}
          {Object.keys(rolesStats).map((roleId) => (
            <div key={roleId} className="bg-white p-4 shadow-md rounded-lg">
              <h2 className="text-lg font-semibold">Rol: {roleId}</h2>
              <p className="text-2xl font-bold">{rolesStats[roleId]}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Users;
