'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomEvent } from "@/app/types/eventType"

const CarruselEvento = ({ events, showIndicators = events.length > 1 }: { events: CustomEvent[], showIndicators?: boolean }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const ids = events.map((event) => event.id);
    const imagenes = events.map((event) => event.bannerImage);
    // const banners = events.map((event) => event.bannerImage);

    const nextSlide = useCallback(() => {
        setCurrentIndex((prevIndex) =>
            prevIndex === imagenes.length - 1 ? 0 : prevIndex + 1
        );
    }, [imagenes.length]);

    const prevSlide = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? imagenes.length - 1 : prevIndex - 1
        );
    };

    useEffect(() => {
        if (!isHovered) {
            const intervalId = setInterval(nextSlide, 5000);
            return () => clearInterval(intervalId);
        }
    }, [nextSlide, isHovered]);

    if (imagenes.length === 0) return null;

    return (
        <div
            className="relative w-full mx-auto h-[200px] sm:h-[450px] overflow-hidden shadow-lg group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Animación de brillo superior */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
            </div>

            {/* Animación de brillo inferior */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-60 z-20">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-400 to-transparent animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-shimmer"></div>
            </div>

            {/* Botón anterior con gradiente */}
            {showIndicators && (
                <button
                    onClick={prevSlide}
                    className="absolute left-0 top-0 bottom-0 z-10 w-16 md:w-20 bg-gradient-to-r from-black/50 via-black/30 to-transparent hover:from-black/70 hover:via-black/50 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-start pl-2 md:pl-3"
                    aria-label="Previous slide"
                >
                    <div className="text-white hover:text-red-400 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300">
                        <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                </button>
            )}

            {/* Contenedor de imágenes */}
            <Link href={`/event/${ids[currentIndex]}`}>
                <div className="relative w-full h-full">
                    {/* Contenedor de las imágenes con efecto de deslizamiento */}
                    <div
                        className="flex transition-transform duration-500 ease-out h-full"
                        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                    >
                        {imagenes.map((imagen, index) => (
                            <div key={index} className="w-full h-full flex-shrink-0 relative">
                                {/* Fondo desenfocado */}
                                <div className="absolute inset-0 -z-10">
                                    <Image
                                        src={imagen}
                                        fill
                                        className="object-cover w-full h-full blur-xl brightness-50 scale-125"
                                        alt={`Background ${index + 1}`}
                                        priority={index === currentIndex}
                                        loader={({ src }) => src}
                                    />
                                </div>

                                {/* Imagen principal con efecto hover */}
                                <div className="relative w-full h-full transition-transform duration-500 hover:scale-105">
                                    <Image
                                        src={imagen}
                                        fill
                                        className="object-contain w-full h-full"
                                        alt={`Slide ${index + 1}`}
                                        priority={index === currentIndex}
                                        loader={({ src }) => src}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Filtro de fondo con opacidad */}
                <div className="absolute inset-0 bg-black/50 z-0"></div>
            </Link>

            {/* Botón siguiente con gradiente */}
            {showIndicators && (
                <button
                    onClick={nextSlide}
                    className="absolute right-0 top-0 bottom-0 z-10 w-16 md:w-20 bg-gradient-to-l from-black/50 via-black/30 to-transparent hover:from-black/70 hover:via-black/50 transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 flex items-center justify-end pr-2 md:pr-3"
                    aria-label="Next slide"
                >
                    <div className="text-white hover:text-red-400 p-2 rounded-full bg-black/30 hover:bg-black/50 backdrop-blur-sm transition-all duration-300">
                        <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
                    </div>
                </button>
            )}

            {/* Indicadores */}
            {showIndicators &&
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                    {imagenes.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                                ? "bg-white w-4 shadow-lg shadow-red-500/30"
                                : "bg-white/50 hover:bg-white/75"
                                }`}
                            aria-label={`Go to slide ${index + 1}`}
                        ></button>
                    ))}
                </div>
            }

            <style jsx>{`
                @keyframes shimmer {
                    0% {
                        transform: translateX(-100%);
                    }
                    100% {
                        transform: translateX(100%);
                    }
                }
                
                .animate-shimmer {
                    animation: shimmer 3s linear infinite;
                }
            `}</style>
        </div>
    );
};

export default CarruselEvento;