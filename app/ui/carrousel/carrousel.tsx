'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const CarruselEvento = ({ imagenes, ids }: { imagenes: string[]; ids: string[] }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    // Crear una versión memoizada de nextSlide usando useCallback
    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === imagenes.length - 1 ? 0 : prevIndex + 1
        );
    }, [imagenes.length]); // Dependemos del tamaño de las imágenes para que el callback se actualice si cambia el número de imágenes

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? imagenes.length - 1 : prevIndex - 1
        );
    };

    // Cambiar imagen automáticamente cada 5 segundos
    useEffect(() => {
        const intervalId = setInterval(nextSlide, 5000); // 5000 ms = 5 segundos
        return () => clearInterval(intervalId); // Limpiar intervalo cuando el componente se desmonte
    }, [nextSlide]); // Ahora 'nextSlide' está incluido en las dependencias

    return (
        <div className="relative w-full mx-auto h-[200px] sm:h-[450px] overflow-hidden">
            {/* Botón anterior */}
            <button
                onClick={prevSlide}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition"
            >
                ❮
            </button>

            {/* Imágenes del carrusel con enlace dinámico */}
            <Link href={`/evento/${ids[currentIndex]}`}>
                <div
                    className="flex transition-transform duration-500 ease-in-out h-full cursor-pointer"
                    style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                >
                    {imagenes.map((imagen, index) => (
                        <div key={index} className="w-full h-full flex-shrink-0 relative">
                            {/* Imagen desenfocada de fondo */}
                            <div className="absolute inset-0 -z-10">
                                <Image
                                    fill
                                    src={imagen}
                                    className="w-full h-full object-cover blur-sm scale-110"
                                    alt={`Blur background`}
                                    priority={index === currentIndex}
                                />
                            </div>
                            {/* Imagen principal */}
                            <Image
                                fill
                                src={imagen}
                                className="w-full h-full object-contain object-center"
                                alt={`Slide ${index + 1}`}
                                priority={index === currentIndex}
                            />
                        </div>
                    ))}
                </div>
            </Link>

            {/* Botón siguiente */}
            <button
                onClick={nextSlide}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-lg hover:bg-gray-200 transition"
            >
                ❯
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                {imagenes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-rojo" : "bg-gray-300"
                            }`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default CarruselEvento;
