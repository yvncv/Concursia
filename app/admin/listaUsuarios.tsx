import React, { useState, useMemo } from "react";
import useUsers from "@/app/hooks/useUsers";
import VistaUsuario from "./vistaUsuario";
import { decryptValue } from "@/app/utils/security/securityHelpers";
import { Search, X, ChevronLeft, ChevronRight, Users, Building, UserCheck, User } from "lucide-react";

export default function ListaUsuarios() {
    const { users, loadingUsers, error } = useUsers();
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [usersPerPage, setUsersPerPage] = useState(10);

    // Estadísticas de usuarios
    const userStats = useMemo(() => {
        if (!users || users.length === 0) {
            return {
                total: 0,
                withAcademy: 0,
                withoutAcademy: 0,
                organizers: 0,
                regularUsers: 0
            };
        }

        const withAcademy = users.filter(user => user.marinera?.academyName).length;
        const organizers = users.filter(user => 
            user.roleId && (
                user.roleId.toLowerCase() === 'organizer' ||
                user.roleId.toLowerCase() === 'admin' ||
                user.roleId.toLowerCase().includes('organizador')
            )
        ).length;

        return {
            total: users.length,
            withAcademy: withAcademy,
            withoutAcademy: users.length - withAcademy,
            organizers: organizers,
            regularUsers: users.length - organizers
        };
    }, [users]);

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

    // Calcular paginación
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    // Resetear página cuando cambie la búsqueda
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const clearSearch = () => {
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleUsersPerPageChange = (newUsersPerPage) => {
        setUsersPerPage(newUsersPerPage);
        setCurrentPage(1);
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

    // Generar números de página para mostrar
    const getPageNumbers = () => {
        const pageNumbers = [];
        const maxPagesToShow = 5;
        
        if (totalPages <= maxPagesToShow) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 5; i++) {
                    pageNumbers.push(i);
                }
            } else if (currentPage >= totalPages - 2) {
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pageNumbers.push(i);
                }
            } else {
                for (let i = currentPage - 2; i <= currentPage + 2; i++) {
                    pageNumbers.push(i);
                }
            }
        }
        
        return pageNumbers;
    };

    return (
        <div className="w-full bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <div className="flex justify-between items-center mb-6">
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

            {/* Estadísticas de usuarios */}
            {!loadingUsers && !error && users.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Total</span>
                        </div>
                        <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
                            {userStats.total}
                        </p>
                    </div>
                    
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="flex items-center gap-2">
                            <Building className="h-5 w-5 text-green-600 dark:text-green-400" />
                            <span className="text-sm font-medium text-green-600 dark:text-green-400">Con Academia</span>
                        </div>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                            {userStats.withAcademy}
                        </p>
                    </div>
                    
                    <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                            <span className="text-sm font-medium text-orange-600 dark:text-orange-400">Sin Academia</span>
                        </div>
                        <p className="text-2xl font-bold text-orange-700 dark:text-orange-300 mt-1">
                            {userStats.withoutAcademy}
                        </p>
                    </div>
                    
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2">
                            <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Organizadores</span>
                        </div>
                        <p className="text-2xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                            {userStats.organizers}
                        </p>
                    </div>
                </div>
            )}

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

            {/* Selector de usuarios por página */}
            {!loadingUsers && !error && filteredUsers.length > 0 && (
                <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                        <span>Mostrar:</span>
                        <select
                            value={usersPerPage}
                            onChange={(e) => handleUsersPerPageChange(Number(e.target.value))}
                            className="border border-gray-300 dark:border-slate-600 rounded px-2 py-1 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                        >
                            <option value={5}>5</option>
                            <option value={10}>10</option>
                            <option value={20}>20</option>
                            <option value={50}>50</option>
                        </select>
                        <span>usuarios por página</span>
                    </div>
                    
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                        Mostrando {indexOfFirstUser + 1}-{Math.min(indexOfLastUser, filteredUsers.length)} de {filteredUsers.length} usuarios
                    </div>
                </div>
            )}
            
            {loadingUsers ? (
                <p className="text-gray-500 dark:text-gray-300">Cargando...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-300">No hay usuarios registrados</p>
            ) : (
                <>
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
                            {currentUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-300">
                                        {searchTerm.trim() 
                                            ? `No se encontraron usuarios que coincidan con "${searchTerm}"`
                                            : 'No hay usuarios para mostrar'
                                        }
                                    </td>
                                </tr>
                            ) : (
                                currentUsers.map((u, idx) => (
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

                    {/* Paginación */}
                    {totalPages > 1 && (
                        <div className="flex justify-center items-center mt-6 gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-700"
                            >
                                <ChevronLeft className="w-4 h-4" />
                                Anterior
                            </button>

                            <div className="flex gap-1">
                                {getPageNumbers().map((pageNumber) => (
                                    <button
                                        key={pageNumber}
                                        onClick={() => handlePageChange(pageNumber)}
                                        className={`px-3 py-2 text-sm font-medium rounded-lg ${
                                            currentPage === pageNumber
                                                ? 'bg-blue-600 text-white'
                                                : 'text-gray-500 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200'
                                        }`}
                                    >
                                        {pageNumber}
                                    </button>
                                ))}
                            </div>

                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white dark:bg-slate-700 border border-gray-300 dark:border-slate-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-600 hover:text-gray-700 dark:hover:text-gray-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white dark:disabled:hover:bg-slate-700"
                            >
                                Siguiente
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </>
            )}
            <VistaUsuario user={selectedUser} onClose={() => setSelectedUser(null)} />
        </div>
    );
}