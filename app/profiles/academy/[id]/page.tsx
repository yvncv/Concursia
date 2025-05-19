'use client';

import { useParams } from 'next/navigation';
import useAcademies from "@/app/hooks/useAcademies";

export default function AcademyProfilePage() {
    const { id } = useParams(); // Obtener el ID dinámico de la URL
    const { academies, loadingAcademies, errorAcademies } = useAcademies();

    if (loadingAcademies) return <div className="text-center mt-20">Cargando academia...</div>;
    if (errorAcademies) return <div className="text-center mt-20">Error: {errorAcademies}</div>;

    const academy = academies.find((academy) => academy.id === id);

    if (!academy) return <div className="text-center mt-20">Academia no encontrada.</div>;

    return (
        <div className="container mx-auto px-4 py-6">
            <h1 className="text-3xl font-bold mb-4">{academy.name}</h1>
            <p className="text-gray-700 mb-2">Ubicación: {academy.location.department}</p>
            <p className="text-gray-700 mb-2">Descripción: {academy.phoneNumber}</p>
            <p className="text-gray-700">Contacto: {academy.email}</p>
        </div>
    );
}