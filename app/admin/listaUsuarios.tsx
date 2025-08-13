import useUsers from "@/app/hooks/useUsers";

export default function ListaUsuarios() {
    const { users, loadingUsers, error } = useUsers();

    return (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Lista de Usuarios</h2>
            {loadingUsers ? (
                <p className="text-gray-500 dark:text-gray-300">Cargando...</p>
            ) : error ? (
                <p className="text-red-500">{error}</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden">
                        <thead>
                        <tr className="bg-blue-100 dark:bg-blue-900">
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Nombre</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Correo</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">DNI</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Rol</th>
                            <th className="px-4 py-2 text-left text-gray-800 dark:text-white">Género</th>
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
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.dni}</td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.roleId}</td>
                                <td className="px-4 py-2 text-gray-900 dark:text-gray-100">{u.gender}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}