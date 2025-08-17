import React, { useState } from "react";
import useUsers from "@/app/hooks/useUsers";
import VistaUsuario from "./vistaUsuario";
import { decryptValue } from "@/app/utils/security/securityHelpers";

export default function ListaUsuarios() {
    const { users, loadingUsers, error } = useUsers();
    const [selectedUser, setSelectedUser] = useState(null);

    const exportToCSV = () => {
        // Crear los datos para exportar
        const exportData = users.map(user => ({
            id: user.id,
            nombre: `${user.firstName} ${user.lastName}`,
            dni: user.dni ? decryptValue(user.dni) : 'N/A',
            academia: user.marinera?.academyName || 'Sin academia'
        }));

        // Crear el contenido CSV
        const headers = ['ID', 'Nombre', 'DNI', 'Academia'];
        const csvContent = [
            headers.join(','),
            ...exportData.map(row => [
                row.id,
                `"${row.nombre}"`, // Comillas para manejar nombres con comas
                row.dni,
                `"${row.academia}"` // Comillas para manejar nombres de academia con comas
            ].join(','))
        ].join('\n');

        // Agregar BOM para UTF-8
        const BOM = '\uFEFF';
        const csvWithBOM = BOM + csvContent;

        // Crear y descargar el archivo
        const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        
        link.setAttribute('href', url);
        link.setAttribute('download', `usuarios_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Lista de Usuarios</h2>
                {!loadingUsers && !error && users.length > 0 && (
                    <button
                        onClick={exportToCSV}
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                    >
                        <svg 
                            className="w-4 h-4" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                        >
                            <path 
                                strokeLinecap="round" 
                                strokeLinejoin="round" 
                                strokeWidth={2} 
                                d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
                            />
                        </svg>
                        Exportar CSV
                    </button>
                )}
            </div>
            
            {loadingUsers ? (
                <p className="text-gray-500 dark:text-gray-300">Cargando...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full max-w-none border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-blue-100 dark:bg-blue-900">
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Nombre</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Correo</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Rol</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Detalles</th>
                        </tr>
                        </thead>
                        <tbody>
                        {users.map((u, idx) => (
                            <tr
                                key={u.id}
                                className={
                                    idx % 2 === 0
                                        ? "bg-gray-50 dark:bg-slate-700"
                                        : "bg-white dark:bg-slate-800"
                                }
                            >
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.firstName} {u.lastName}</td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{Array.isArray(u.email) ? u.email[0] : u.email}</td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.roleId}</td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100 flex gap-2">
                                    <button
                                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                        onClick={() => setSelectedUser(u)}
                                    >
                                        Ver
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
            <VistaUsuario user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}