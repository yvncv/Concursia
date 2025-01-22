"use client";
import React from "react";
import useUsers from "@/app/hooks/useUsers";
import { Eye, UserPen, Trash2 } from "lucide-react"; // Iconos de react-icons

const Users: React.FC = () => {
  const { users, loadingUsers, error } = useUsers();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gestión de Usuarios</h1>

      {loadingUsers ? (
        <p>Cargando usuarios...</p>
      ) : error ? (
        <p className="text-red-500">Error: {error}</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Nombre</th>
                <th className="border border-gray-300 px-4 py-2">Correo</th>
                <th className="border border-gray-300 px-4 py-2">Rol</th>
                <th className="border border-gray-300 px-4 py-2">Género</th>
                <th className="border border-gray-300 px-4 py-2">Nacimiento</th>
                {/* <th className="border border-gray-300 px-4 py-2">Estado</th> */}
                <th className="border border-gray-300 px-4 py-2">Registro</th>
                <th className="border border-gray-300 px-4 py-2">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">{user.fullName}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.email[0]}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.roleId}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.gender}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.birthDate.toDate().toLocaleDateString()}</td>
                  <td className="border border-gray-300 px-4 py-2">{user.createdAt.toDate().toLocaleDateString()}</td>
                  {/* <td className="border border-gray-300 px-4 py-2">
                    {user.status === "active" ? "Activo" : "Inactivo"}
                  </td> */}
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <button
                      className="text-blue-500 hover:text-blue-700 mr-2"
                      title="Visualizar"
                      onClick={() => console.log("Visualizar", user.id)}
                    >
                      <Eye />
                    </button>
                    <button
                      className="text-yellow-500 hover:text-yellow-700 mr-2"
                      title="Editar"
                      onClick={() => console.log("Editar", user.id)}
                    >
                      <UserPen />
                    </button>
                    <button
                      className="text-red-500 hover:text-red-700"
                      title="Eliminar"
                      onClick={() => console.log("Eliminar", user.id)}
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

export default Users;
