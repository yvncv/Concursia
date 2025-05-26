'use client';

import { useParams } from 'next/navigation';
import useAcademies from "@/app/hooks/useAcademies";
import Image from "next/image";
import React, {useState} from "react";
import LocationInformation from "@/app/profiles/components/LocationInformation";
import useUser from "@/app/hooks/useUser";
import afiliateAcademy from '@/app/hooks/afiliateAcademy';
import { useEffect } from "react";

export default function AcademyProfilePage() {
    const { id } = useParams(); // Obtener el ID dinámico de la URL
    const { academies, loadingAcademies, errorAcademies } = useAcademies();
    const [croppedImage] = useState<string | null>(null);
    const [isAfiliated, setIsAfiliated] = useState(false);
    const { user, loadingUser } = useUser();

    const academy = academies.find((academy) => academy.id === id);

    useEffect(() => {
        if (user && academy) {
            setIsAfiliated(user.marinera?.academyId === academy.id);
        }
    }, [user, academy]);

    if (loadingAcademies) return <div className="text-center mt-20">Cargando academia...</div>;
    if (errorAcademies) return <div className="text-center mt-20">Error: {errorAcademies}</div>;



    if (!academy) return <div className="text-center mt-20">Academia no encontrada.</div>;



    const handleUpdateAfiliation= async () =>  {
        if (!academy || !academy.id || !academy.name) return;

        try {
            await afiliateAcademy(academy.id, academy.name, user, loadingUser);
            setIsAfiliated(true); // Actualiza el estado local al éxito
        } catch (error) {
            console.error(error);
        }
    }

    const handleClearAfiliation= async () =>  {
        try {
            await afiliateAcademy('', '', user, loadingUser);
            setIsAfiliated(false); // Actualiza el estado local al éxito
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <main className="flex flex-col h-screen">
            {/* Header */}
            <div
                className={`top-0 z-10 items-center p-8 flex md:flex-row flex-col justify-around 
                        bg-gradient-to-r from-red-400 to-orange-600 m-3 rounded-md`}
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
                        ) : academy.profileImage ? (
                            <Image
                                src={typeof academy.profileImage === 'string'
                                    ? academy.profileImage
                                    : URL.createObjectURL(academy.profileImage as File)}
                                alt="Foto de perfil"
                                className="object-cover"
                                width={160}
                                height={160}
                                unoptimized
                            />
                        ) : (
                            <Image
                                src={'/default-male.JPG'}
                                alt="Foto de perfil"
                                className="object-cover"
                                width={160}
                                height={160}
                                unoptimized
                            />
                        )}
                    </div>
                    <div className="text-white mt-4 md:mt-0">
                        <h1 className="bg-black/40 p-3 rounded-md md:text-4xl font-bold">{academy.name }</h1>
                        {/* Afiliate button */}
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={
                                    isAfiliated ? handleClearAfiliation :
                                handleUpdateAfiliation
                            }
                                className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 ${isAfiliated===false
                                    ? 'bg-green-600 hover:bg-green-700 shadow-sm hover:shadow'
                                    : 'bg-gray-400 opacity-70'}`}
                            >
                                {isAfiliated===false ? (
                                    <span className="flex items-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Afiliarse
                                    </span>
                                ) : 'Ya está afiliado'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto p-8">
                <LocationInformation locationData={academy.location}/>

            </div>

        </main>
    );
}