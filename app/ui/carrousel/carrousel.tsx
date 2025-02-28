'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CustomEvent } from "@/app/types/eventType"

const CarruselEvento = ({ events }: { events: CustomEvent[] }) => {
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
            {/* Botones de anterior */}
            <button
                onClick={prevSlide}
                className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1 md:p-2 rounded-full transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Previous slide"
            >
                <ChevronLeft className="w-6 h-6" />
            </button>

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
                                <div className="w-full absolute inset-0 -z-10">
                                    <Image
                                        fill
                                        src={imagen}
                                        className="w-full h-full object-fill blur-xl scale-200 brightness-75"
                                        alt={`Background ${index + 1}`}
                                        priority={index === currentIndex}
                                    />
                                </div>

                                {/* Imagen principal con efecto hover */}
                                <div className="relative h-full transition-transform duration-500 hover:scale-105">
                                    <Image
                                        fill
                                        src={imagen}
                                        className="w-full h-full object-contain object-center"
                                        alt={`Slide ${index + 1}`}
                                        priority={index === currentIndex}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                {/* Filtro de fondo con opacidad */}
                <div className="absolute inset-0 bg-black/50 z-0"></div>
            </Link>

            {/* Botón siguiente */}
            <button
                onClick={nextSlide}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-black/50 hover:bg-black/70 text-white p-1 md:p-2 rounded-full transition-all duration-300 sm:opacity-0 sm:group-hover:opacity-100 backdrop-blur-sm"
                aria-label="Next slide"
            >
                <ChevronRight className="w-6 h-6" />
            </button>

            {/* Indicadores */}
            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3 z-10">
                {imagenes.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setCurrentIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all duration-300 ${index === currentIndex
                            ? "bg-white w-4"
                            : "bg-white/50 hover:bg-white/75"
                            }`}
                        aria-label={`Go to slide ${index + 1}`}
                    ></button>
                ))}
            </div>
        </div>
    );
};

export default CarruselEvento;