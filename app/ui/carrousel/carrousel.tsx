'use client';

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Play, Pause } from "lucide-react";
import { CustomEvent } from "@/app/types/eventType"

interface CarruselEventoProps {
    events: CustomEvent[];
    showIndicators?: boolean;
    currentUser?: any; // Agregar prop para el usuario actual
    user?: any; // Agregar prop alternativa para el usuario
}

const CarruselEvento = ({ 
    events, 
    showIndicators = events.length > 1,
}: CarruselEventoProps) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isPlaying, setIsPlaying] = useState(true);
    const [imagesLoaded, setImagesLoaded] = useState<Record<number, boolean>>({});

    const ids = events.map((event) => event.id);
    const imagenes = events.map((event) => event.bannerImage);

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

    const togglePlay = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsPlaying(!isPlaying);
    };

    // Control del auto-play
    useEffect(() => {
        if (!isHovered && isPlaying && imagenes.length > 1) {
            const intervalId = setInterval(nextSlide, 5000);
            return () => clearInterval(intervalId);
        }
    }, [nextSlide, isHovered, isPlaying, imagenes.length]);

    // Precargar imágenes para evitar el resize
    useEffect(() => {
        imagenes.forEach((src, index) => {
            const img = new window.Image();
            img.onload = () => {
                setImagesLoaded(prev => ({ ...prev, [index]: true }));
            };
            img.src = src;
        });
    }, [imagenes]);

    if (imagenes.length === 0) return null;

    return (
        <div
            className="relative w-full mx-auto h-[200px] sm:h-[450px] overflow-hidden group"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Marco con gradiente animado */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-[-2px] bg-gradient-to-r from-red-500 via-purple-500 via-blue-500 to-red-500 opacity-60 animate-pulse"></div>
                <div className="absolute inset-[2px] bg-black"></div>
            </div>

            {/* Contenedor principal con esquinas redondeadas */}
            <div className="relative w-full h-full verflow-hidden bg-gray-900">
                {/* Botón anterior mejorado */}
                {showIndicators && imagenes.length > 1 && (
                    <button
                        onClick={prevSlide}
                        className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:-translate-x-2 sm:group-hover:translate-x-0"
                        aria-label="Previous slide"
                    >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full border border-white/20 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                            <ChevronLeft className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white hover:text-red-400 transition-colors duration-300" />
                        </div>
                    </button>
                )}

                {/* Link envolvente */}
                <Link href={`/event/${ids[currentIndex]}`} className="block w-full h-full">
                    <div className="relative w-full h-full">
                        {/* Contenedor de las imágenes con transición suave */}
                        <div
                            className="flex transition-transform duration-700 ease-in-out h-full"
                            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
                        >
                            {imagenes.map((imagen, index) => (
                                <div key={index} className="w-full h-full flex-shrink-0 relative">
                                    {/* Fondo desenfocado con mejor efecto */}
                                    <div className="absolute inset-0">
                                        <Image
                                            src={imagen}
                                            fill
                                            className="object-cover w-full h-full blur-2xl brightness-30 scale-110"
                                            alt={`Background ${index + 1}`}
                                            priority={index === 0}
                                            loader={({ src }) => src}
                                            sizes="(max-width: 768px) 100vw, 100vw"
                                        />
                                        {/* Gradiente overlay para mejor contraste */}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30"></div>
                                    </div>

                                    {/* Imagen principal con placeholder */}
                                    <div className="relative w-full h-full flex items-center justify-center">
                                        {!imagesLoaded[index] && (
                                            <div className="absolute inset-0 flex items-center justify-center bg-gray-800 rounded-lg">
                                                <div className="w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 border-2 sm:border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                                            </div>
                                        )}
                                        <div className="relative w-full h-full transition-all duration-500 hover:scale-[1.02]">
                                            <Image
                                                src={imagen}
                                                fill
                                                className={`object-contain w-full h-full transition-opacity duration-500 ${imagesLoaded[index] ? 'opacity-100' : 'opacity-0'}`}
                                                alt={`Slide ${index + 1}`}
                                                priority={index === 0}
                                                loader={({ src }) => src}
                                                sizes="(max-width: 768px) 100vw, 100vw"
                                                onLoad={() => setImagesLoaded(prev => ({ ...prev, [index]: true }))}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Link>

                {/* Botón siguiente mejorado */}
                {showIndicators && imagenes.length > 1 && (
                    <button
                        onClick={nextSlide}
                        className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300 transform sm:translate-x-2 sm:group-hover:translate-x-0"
                        aria-label="Next slide"
                    >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 md:w-12 sm:h-10 md:h-12 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full border border-white/20 hover:border-red-500/50 transition-all duration-300 shadow-lg hover:shadow-red-500/25">
                            <ChevronRight className="w-4 h-4 sm:w-5 md:w-6 sm:h-5 md:h-6 text-white hover:text-red-400 transition-colors duration-300" />
                        </div>
                    </button>
                )}

                {/* Control de play/pause */}
                {showIndicators && imagenes.length > 1 && (
                    <button
                        onClick={togglePlay}
                        className="absolute top-2 sm:top-4 right-2 sm:right-4 z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300"
                        aria-label={isPlaying ? "Pause slideshow" : "Play slideshow"}
                    >
                        <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-black/60 backdrop-blur-md hover:bg-black/80 rounded-full border border-white/20 hover:border-red-500/50 transition-all duration-300">
                            {isPlaying ? (
                                <Pause className="w-3 h-3 sm:w-4 sm:h-4 text-white hover:text-red-400 transition-colors duration-300" />
                            ) : (
                                <Play className="w-3 h-3 sm:w-4 sm:h-4 text-white hover:text-red-400 transition-colors duration-300 ml-0.5" />
                            )}
                        </div>
                    </button>
                )}

                {/* Indicadores mejorados */}
                {showIndicators && imagenes.length > 1 && (
                    <div className="absolute bottom-3 sm:bottom-6 left-1/2 transform -translate-x-1/2 z-20">
                        <div className="flex space-x-1.5 sm:space-x-2 bg-black/40 backdrop-blur-md rounded-full px-2 py-1.5 sm:px-4 sm:py-2 border border-white/10">
                            {imagenes.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className="group relative"
                                    aria-label={`Go to slide ${index + 1}`}
                                >
                                    <div className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                                        index === currentIndex
                                            ? "w-6 h-2.5 sm:w-8 sm:h-3 bg-gradient-to-r from-red-500 to-red-400"
                                            : "w-2.5 h-2.5 sm:w-3 sm:h-3 bg-white/40 hover:bg-white/60"
                                    }`}>
                                        {index === currentIndex && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {/* Información del slide actual */}
                {showIndicators && imagenes.length > 1 && (
                    <div className="absolute top-2 sm:top-4 left-2 sm:left-4 z-20 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all duration-300">
                        <div className="bg-black/60 backdrop-blur-md rounded-lg px-2 py-1 sm:px-3 sm:py-1 border border-white/10 text-white text-xs sm:text-sm">
                            {currentIndex + 1} / {imagenes.length}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CarruselEvento;