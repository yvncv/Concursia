'use client';

import { useParams } from 'next/navigation';
import useUsers from "@/app/hooks/useUsers";

export default function UserProfilePage() {
    const { id } = useParams(); // Obtener el ID dinámico de la URL
    const { users, loadingUsers, error } = useUsers();

    if (loadingUsers) return <div className="text-center mt-20">Cargando usuario...</div>;
    if (error) return <div className="text-center mt-20">Error: {error}</div>;

    const user = users.find((user) => user.id === id);

    if (!user) return <div className="text-center mt-20">Usuario no encontrado.</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-4">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-700 mb-2">Ubicación: {user.location.district}</p>
            <p className="text-gray-700 mb-2">Descripción: {user.roleId}</p>
            <p className="text-gray-700">Contacto: {user.email}</p>
        </div>
    );
}