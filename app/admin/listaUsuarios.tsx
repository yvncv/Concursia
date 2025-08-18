import React, { useState, useMemo } from "react";
import useUsers from "@/app/hooks/useUsers";
import VistaUsuario from "./vistaUsuario";
import { decryptValue } from "@/app/utils/security/securityHelpers";
import { Search, X } from "lucide-react";

export default function ListaUsuarios() {
    const { users, loadingUsers, error } = useUsers();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Filtrar usuarios basado en el término de búsqueda
    const filteredUsers = useMemo(() => {
        if (!searchTerm.trim()) {
            return users;
        }

        const searchLower = searchTerm.toLowerCase().trim();
        return users.filter(user => {
            const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
            const email = Array.isArray(user.email) ? user.email[0] : user.email;
            const emailLower = email ? email.toLowerCase() : '';
            const role = user.roleId ? user.roleId.toLowerCase() : '';
            const academy = user.marinera?.academyName ? user.marinera.academyName.toLowerCase() : '';

            return fullName.includes(searchLower) || 
                   emailLower.includes(searchLower) || 
                   role.includes(searchLower) ||
                   academy.includes(searchLower);
        });
    }, [users, searchTerm]);

    const clearSearch = () => {
        setSearchTerm("");
    };

    const exportToCSV = () => {
        // Usar los usuarios filtrados para la exportación
        const exportData = filteredUsers.map(user => ({
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
        
        const fileName = searchTerm.trim() 
            ? `usuarios_filtrados_${new Date().toISOString().split('T')[0]}.csv`
            : `usuarios_${new Date().toISOString().split('T')[0]}.csv`;
        
        link.setAttribute('href', url);
        link.setAttribute('download', fileName);
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
                        Exportar CSV {searchTerm.trim() && `(${filteredUsers.length} filtrados)`}
                    </button>
                )}
            </div>

            {/* Buscador */}
            {!loadingUsers && !error && users.length > 0 && (
                <div className="mb-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Buscar por nombre, email, rol o academia..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-700 dark:text-white"
                        />
                        {searchTerm && (
                            <button
                                onClick={clearSearch}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 dark:hover:text-gray-300"
                            >
                                <X className="h-4 w-4 text-gray-400" />
                            </button>
                        )}
                    </div>
                    {searchTerm.trim() && (
                        <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                            Mostrando {filteredUsers.length} de {users.length} usuarios
                            {filteredUsers.length === 0 && (
                                <span className="text-orange-500 ml-2">
                                    - No se encontraron usuarios que coincidan con "{searchTerm}"
                                </span>
                            )}
                        </div>
                    )}
                </div>
            )}
            
            {loadingUsers ? (
                <p className="text-gray-500 dark:text-gray-300">Cargando...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-300">No hay usuarios registrados</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full max-w-none border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-blue-100 dark:bg-blue-900">
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Nombre</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Correo</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Rol</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Academia</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Detalles</th>
                        </tr>
                        </thead>
                        <tbody>
                        {filteredUsers.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-300">
                                    {searchTerm.trim() 
                                        ? `No se encontraron usuarios que coincidan con "${searchTerm}"`
                                        : 'No hay usuarios para mostrar'
                                    }
                                </td>
                            </tr>
                        ) : (
                            filteredUsers.map((u, idx) => (
                                <tr
                                    key={u.id}
                                    className={
                                        idx % 2 === 0
                                            ? "bg-gray-50 dark:bg-slate-700"
                                            : "bg-white dark:bg-slate-800"
                                    }
                                >
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {u.firstName} {u.lastName}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {Array.isArray(u.email) ? u.email[0] : u.email}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {u.roleId}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100">
                                        {u.marinera?.academyName || 'Sin academia'}
                                    </td>
                                    <td className="px-4 py-2 text-gray-900 dark:text-gray-100 flex gap-2">
                                        <button
                                            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm font-medium transition-colors"
                                            onClick={() => setSelectedUser(u)}
                                        >
                                            Ver
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>
                </div>
            )}
            <VistaUsuario user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}