'use client';

import { useParams } from 'next/navigation';
import useUsers from "@/app/hooks/useUsers";
import Image from "next/image";
import React, {useState} from "react";
import LocationInformation from "@/app/profiles/components/LocationInformation";

export default function UserProfilePage() {
    const { id } = useParams(); // Obtener el ID dinámico de la URL
    const { users, loadingUsers, error } = useUsers();
    const [croppedImage] = useState<string | null>(null);

    if (loadingUsers) return <div className="text-center mt-20">Cargando usuario...</div>;
    if (error) return <div className="text-center mt-20">Error: {error}</div>;

    const user = users.find((user) => user.id === id);

    if (!user) return <div className="text-center mt-20">Usuario no encontrado.</div>;

    const capitalizeName = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());

    return (
        <main className="flex flex-col h-screen">
            {/* Header */}
            <div
                className={`top-0 z-10 items-center p-8 flex md:flex-row flex-col justify-around ${user?.gender === 'Masculino' ? 'bg-gradient-to-r from-blue-500 to-purple-700' // Male gradient
                    : user?.gender === 'Femenino'
                        ? 'bg-gradient-to-r from-pink-500 to-purple-600' // Female gradient
                        : 'bg-gradient-to-r from-red-400 to-orange-600' // Default gradient
                } m-3 rounded-md`}
            >
                <div className="flex flex-col md:flex-row items-center space-x-8">
                    <div className="relative group w-15 h-15 md:w-40 md:h-40 rounded-full border-4 shadow-lg overflow-hidden">
                        {croppedImage ? (
                            <Image
                                src={croppedImage}
                                alt="Foto de perfil"
                                className="object-cover"
                                width={160}
                                height={160}
                                unoptimized
                            />
                        ) : user.profileImage ? (
                            <Image
                                src={typeof user.profileImage === 'string'
                                    ? user.profileImage
                                    : URL.createObjectURL(user.profileImage as File)}
                                alt="Foto de perfil"
                                className="object-cover"
                                width={160}
                                height={160}
                                unoptimized
                            />
                        ) : (
                            <Image
                                src={user.gender === 'Masculino' ? '/default-male.JPG' : '/default-female.JPG'}
                                alt="Foto de perfil"
                                className="object-cover"
                                width={160}
                                height={160}
                                unoptimized
                            />
                        )}
                    </div>
                    <div className="text-white mt-4 md:mt-0">
                        <h1 className="bg-black/40 p-3 rounded-md md:text-4xl font-bold">{capitalizeName(user.firstName + ' ' + user.lastName)}</h1>
                        <p className="bg-black/40 p-3 rounded-md md:text-xl mt-2">{user.roleId.toUpperCase()} {user.marinera.academyId && ` • ${user.marinera.academyName}`}</p>
                    </div>
                </div>

                {croppedImage && (
                    <button
                        className="px-4 py-2 bg-red-600 rounded text-white mt-4 md:mt-0"
                    >
                        Guardar Imagen
                    </button>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <LocationInformation locationData={{
                    department: user.location?.department || 'N/A',
                    district: user.location?.district || 'N/A',
                    province: user.location?.province || 'N/A',
                }} />

            </div>

        </main>
    );
}