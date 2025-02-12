// /app/components/Users.tsx
"use client";
import React, { useState } from "react";
import useUsers from "@/app/hooks/useUsers";
import { Eye, FilePenLine, Trash2 } from "lucide-react";
import { User } from "@/app/types/userType";
import UserModal from "./modals/ReadUserModal";
import EditUserModal from "./modals/EditUserModal";
import DeleteUserModal from "./modals/DeleteUserModal";

const Users: React.FC = () => {
  const { users, loadingUsers, error } = useUsers();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserToEdit, setSelectedUserToEdit] = useState<User | null>(null);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState<User | null>(null);

  return (
    <div className="p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Gestión de Usuarios
      </h1>

      {loadingUsers ? (
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-600 dark:text-gray-300">Cargando usuarios...</p>
        </div>
      ) : error ? (
        <p className="text-red-500 dark:text-red-400">Error: {error}</p>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
          <table className="w-full border-collapse">
            <thead className="bg-gray-100 dark:bg-gray-700">
              <tr>
                {[
                  "Full Name",
                  "Emails",
                  "Role ID",
                  "Gender",
                  "Birth Date",
                  "Created At",
                  "Acciones",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider border-b dark:border-gray-600"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-gray-700">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                    {`${user?.firstName} ${user?.lastName}`}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                    {Array.isArray(user.email)
                      ? user.email.length > 1
                        ? user.email[1] === ""
                          ? user.email[0]
                          : user.email.join(", ")
                        : user.email[0]
                      : user.email}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                    {user.roleId}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                    {user.gender}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                    {new Date(user.birthDate.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-300">
                    {new Date(user.createdAt.toDate()).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center space-x-2">
                      <button
                        className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                        title="Visualizar"
                        onClick={() => setSelectedUser(user)}
                      >
                        <Eye className="w-5 h-5" />
                      </button>
                      <button
                        className="text-yellow-500 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300 transition-colors"
                        title="Editar"
                        onClick={() => setSelectedUserToEdit(user)}
                      >
                        <FilePenLine className="w-5 h-5" />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                        title="Eliminar"
                        onClick={() => setSelectedUserToDelete(user)}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <UserModal user={selectedUser} onClose={() => setSelectedUser(null)} />
      )}
      {selectedUserToEdit && (
        <EditUserModal user={selectedUserToEdit} onClose={() => setSelectedUserToEdit(null)} />
      )}
      {selectedUserToDelete && (
        <DeleteUserModal user={selectedUserToDelete} onClose={() => setSelectedUserToDelete(null)} />
      )}
    </div>
  );
};

export default Users;
