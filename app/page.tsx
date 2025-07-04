"use client";

import Image from "next/image";
import Link from "next/link";
import useEvents from "./hooks/useEvents";
import EventComponent from "./ui/event/eventComponent";
import CarruselEvento from "./ui/carrousel/carrousel";
import { useEffect, useState } from "react";
import { Award, CheckCircle, Heart, Mail, MapPin, Music, Phone, Send, Star, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
  const { events } = useEvents();
  const pastEvents = events.filter(
    (event) => event.endDate.toDate() < new Date(Date.now())
  );
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Filtrar solo las primeras 8 imágenes
  const galleryImages = events.slice(0, 8);

  useEffect(() => {
    if (galleryImages.length > 0 && currentIndex >= galleryImages.length) {
      setCurrentIndex(0);
    }
  }, [galleryImages, currentIndex]);

  useEffect(() => {
    if (!isAutoPlaying || galleryImages.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) =>
        prevIndex === galleryImages.length - 1 ? 0 : prevIndex + 1
      );
    }, 4000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, galleryImages.length]);

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  const nextSlide = () => {
    setCurrentIndex(currentIndex === galleryImages.length - 1 ? 0 : currentIndex + 1);
  };

  const prevSlide = () => {
    setCurrentIndex(currentIndex === 0 ? galleryImages.length - 1 : currentIndex - 1);
  };

  const handleMouseEnter = () => setIsAutoPlaying(false);
  const handleMouseLeave = () => setIsAutoPlaying(true);

  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular envío
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
    }, 3000);
  };

  return (
    <div className="flex flex-col min-h-screen overflow-hidden">
      <main className="flex-1 overflow-y-auto scroll-smooth">
        {/* Hero Section */}
        <section className="relative h-[200px] sm:h-[450px] flex items-center justify-center w-full">
          {/* Carrusel de ancho completo */}
          <div className="absolute inset-0">
            <CarruselEvento events={events} showIndicators={false} />
          </div>

          {/* Fondo oscuro */}
          <div className="absolute inset-0 bg-red-900/80 z-0"></div>

          {/* Contenido superpuesto */}
          <div className="relative z-1 text-center text-white px-4">
            <h1 className="text-sm sm:text-2xl md:text-5xl font-bold mb-4 drop-shadow-2xl">
              <span className="bg-gradient-to-r from-white via-yellow-200 to-white bg-clip-text text-transparent">
                Vive la Pasión de la
              </span>
              <br />
              <span className="text-yellow-300 drop-shadow-2xl animate-pulse">
                Marinera Norteña
              </span>
            </h1>
            <p className="text-sm sm:text-lg md:text-xl mb-4 mx-5 md:mb-8 text-gray-100 drop-shadow-lg font-light">
              Descubre los mejores eventos y competencias en Perú
            </p>
            <Link
              href="/calendario"
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-red-900 transition-all duration-300 ease-out transform hover:scale-105 active:scale-95 shadow-2xl"
            >
              {/* Fondo del botón con gradiente peruano */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-white to-red-600 rounded-xl shadow-xl group-hover:shadow-red-500/50 transition-all duration-300"></div>

              {/* Capa intermedia naranja */}
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500 via-yellow-400 to-orange-500 rounded-xl opacity-90 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Contenido del botón */}
              <span className="relative flex items-center gap-2 font-extrabold drop-shadow-sm">
                <span>Ver Eventos</span>
                <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </span>
            </Link>
          </div>
        </section>

        {/* Eventos Section */}
        <section id="eventos" className="py-16 bg-gray-100">
          <div className="container mx-auto px-4 max-w-screen-lg">
            {pastEvents.length > 0 ? (
              <>
                <div className="text-center mb-16">
                  <div className="inline-flex items-center bg-red-100 text-red-600 px-4 py-2 rounded-full text-sm font-semibold mb-4">
                    <TrendingUp className="w-4 h-4 mr-2" />
                    Eventos Destacados
                  </div>
                  <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6 leading-tight">
                    Eventos Recientes
                  </h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Descubre los eventos más impactantes que hemos realizado y conoce las experiencias
                    que hemos compartido con nuestra comunidad
                  </p>
                </div>
                <div className="flex flex-wrap justify-center gap-4">
                  {pastEvents.map((event, index) => {
                    if (index >= 6) return;
                    return <EventComponent key={event.id} event={event} />;
                  })}
                </div>
              </>
            ) : (
              <p className="text-center">No hay eventos recientes.</p>
            )}
          </div>
        </section>

        {/* Galería Section */}
        <section id="galeria" className="py-20 bg-gradient-to-br from-red-50 via-yellow-50 to-orange-50 relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute top-10 left-10 w-20 h-20 bg-red-200/30 rounded-full blur-xl"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-yellow-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-20 left-1/4 w-24 h-24 bg-orange-200/30 rounded-full blur-xl"></div>

          <div className="container mx-auto px-4 max-w-screen-xl">
            {/* Título decorativo */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center gap-3 mb-4">
                <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-red-500"></div>
                <span className="text-red-600 font-semibold tracking-wide">MOMENTOS ÚNICOS</span>
                <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-red-500"></div>
              </div>
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-4">
                <span className="bg-gradient-to-r from-red-600 via-yellow-600 to-red-600 bg-clip-text text-transparent">
                  Galería de Imágenes
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Revive la magia y pasión de la marinera norteña a través de estos momentos capturados
              </p>
            </div>

            {/* Carrusel principal */}
            <div
              className="relative max-w-6xl mx-auto"
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
            >
              {/* Contenedor del carrusel */}
              <div className="relative h-[400px] sm:h-[500px] lg:h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                {/* Imagen principal */}
                <div className="relative w-full h-full">
                  {galleryImages[currentIndex]?.smallImage ? (
                    <Image
                      src={galleryImages[currentIndex].smallImage}
                      alt={`Imagen de marinera ${currentIndex + 1}`}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500">Cargando imagen...</span>
                    </div>
                  )}

                  {/* Overlay decorativo */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                  {/* Información de la imagen */}
                  <div className="absolute bottom-6 left-6 right-6 text-white">
                    <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4">
                      <h3 className="text-xl font-bold mb-2">
                        Marinera Norteña {galleryImages[currentIndex]?.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        Capturando la esencia de nuestra tradición peruana
                      </p>
                    </div>
                  </div>
                </div>

                {/* Botones de navegación */}
                <button
                  onClick={prevSlide}
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
                >
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-300 group"
                >
                  <svg className="w-6 h-6 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>

                {/* Indicador de reproducción automática */}
                <div className="absolute top-4 right-4">
                  <div className={`w-3 h-3 rounded-full ${isAutoPlaying ? 'bg-green-400' : 'bg-gray-400'} shadow-lg`}></div>
                </div>
              </div>

              {/* Miniaturas */}
              <div className="flex justify-center mt-6 gap-2 overflow-x-auto py-3">
                {galleryImages.map((event, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`relative flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden transition-all duration-300 mx-2 ${index === currentIndex
                      ? 'ring-4 ring-red-500 ring-offset-2 scale-110'
                      : 'ring-2 ring-gray-300 hover:ring-red-300 hover:scale-105'
                      }`}
                  >
                    <Image
                      src={event.smallImage}
                      alt={`Miniatura ${index + 1}`}
                      fill
                      className="object-cover"
                      loader={({ src }) => src}
                    />
                    {index === currentIndex && (
                      <div className="absolute inset-0 bg-red-500/20"></div>
                    )}
                  </button>
                ))}
              </div>

              {/* Indicadores de progreso */}
              <div className="flex justify-center mt-4 gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex
                      ? 'w-8 bg-red-500'
                      : 'w-2 bg-gray-300 hover:bg-red-300'
                      }`}
                  />
                ))}
              </div>
            </div>

            {/* Estadísticas decorativas */}
            <div className="mt-16 grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-red-600 mb-2">{galleryImages.length}</div>
                <div className="text-gray-600">Imágenes</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-yellow-600 mb-2">∞</div>
                <div className="text-gray-600">Tradición</div>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <div className="text-3xl font-bold text-orange-600 mb-2">🎭</div>
                <div className="text-gray-600">Pasión</div>
              </div>
            </div>
          </div>
        </section>

        {/* Acerca de Section */}
        <section id="acerca" className="py-20 bg-gradient-to-br from-red-700 via-red-600 to-red-800 text-white relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-20 right-20 w-32 h-32 bg-yellow-300 rounded-full blur-3xl animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse delay-500"></div>
          </div>

          {/* Patrón decorativo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-20"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '40px 40px'
              }}>
            </div>
          </div>

          <div className="container mx-auto px-4 max-w-screen-xl relative z-10">
            {/* Encabezado */}
            <div className="text-center mb-16">
              <div className="inline-flex items-center bg-white/10 backdrop-blur-sm text-white px-6 py-3 rounded-full text-sm font-semibold mb-6 border border-white/20">
                <Heart className="w-4 h-4 mr-2" />
                Tradición y Cultura
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                Acerca de la Marinera Norteña
              </h2>
              <div className="w-24 h-1 bg-yellow-400 mx-auto rounded-full mb-8"></div>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-center">
              {/* Contenido principal */}
              <div className="space-y-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <Music className="w-6 h-6 text-red-800" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-yellow-100">
                        La Danza del Cortejo
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed">
                        La marinera norteña es una danza tradicional peruana que representa el cortejo
                        entre un hombre y una mujer. Se caracteriza por sus movimientos elegantes y el
                        uso del pañuelo como elemento principal en esta hermosa representación del amor.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <div className="flex items-start space-x-4 mb-6">
                    <div className="w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center flex-shrink-0">
                      <MapPin className="w-6 h-6 text-red-800" />
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold mb-4 text-yellow-100">
                        Patrimonio Cultural
                      </h3>
                      <p className="text-white/90 text-lg leading-relaxed">
                        Originaria de la costa norte del Perú, la marinera norteña es considerada
                        Patrimonio Cultural de la Nación y es ampliamente celebrada en festivales
                        y concursos a lo largo del país, manteniendo vivas nuestras tradiciones.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Estadísticas y características */}
              <div className="space-y-6">
                {/* Tarjetas de estadísticas */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Award className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-yellow-100">1986</h4>
                    <p className="text-white/80 text-sm">Patrimonio Cultural</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Users className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-yellow-100">Miles</h4>
                    <p className="text-white/80 text-sm">de Bailarines</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Music className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-yellow-100">3/4</h4>
                    <p className="text-white/80 text-sm">Compás Musical</p>
                  </div>

                  <div className="bg-white/15 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                    <Star className="w-8 h-8 text-yellow-400 mx-auto mb-3" />
                    <h4 className="text-2xl font-bold text-yellow-100">Trujillo</h4>
                    <p className="text-white/80 text-sm">Ciudad Origen</p>
                  </div>
                </div>

                {/* Características destacadas */}
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
                  <h3 className="text-2xl font-bold mb-6 text-yellow-100">
                    Características Distintivas
                  </h3>
                  <ul className="space-y-4">
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">Uso elegante del pañuelo como elemento expresivo</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">Movimientos gráciles que representan el cortejo</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">Acompañamiento de guitarra y cajón peruano</span>
                    </li>
                    <li className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-white/90">Vestimenta tradicional con colores vibrantes</span>
                    </li>
                  </ul>
                </div>

                {/* Botones de acción */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 bg-yellow-400 hover:bg-yellow-300 text-red-800 font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                    Conocer Más
                  </button>
                  <button className="flex-1 border-2 border-white/30 hover:border-white/50 hover:bg-white/10 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300">
                    Ver Videos
                  </button>
                </div>
              </div>
            </div>

            {/* Sección de cita inspiradora */}
            <div className="mt-20 text-center">
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-12 border border-white/20 max-w-4xl mx-auto">
                <blockquote className="text-2xl md:text-3xl font-light text-yellow-100 mb-6 italic leading-relaxed">
                  "La marinera norteña es más que una danza; es la expresión viviente
                  del alma peruana, donde cada paso cuenta una historia de amor y tradición."
                </blockquote>
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-12 h-0.5 bg-yellow-400"></div>
                  <Heart className="w-6 h-6 text-yellow-400" />
                  <div className="w-12 h-0.5 bg-yellow-400"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contacto Section */}
        <section id="contacto" className="py-20 bg-gradient-to-br from-gray-50 to-gray-100 relative overflow-hidden">
          {/* Elementos decorativos de fondo */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-10 left-10 w-32 h-32 bg-red-500 rounded-full blur-3xl"></div>
            <div className="absolute bottom-10 right-10 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
            <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-purple-500 rounded-full blur-2xl"></div>
          </div>

          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            {/* Título principal */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Contáctanos
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Estamos aquí para ayudarte. Envíanos un mensaje y te responderemos lo más pronto posible.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-16 items-start">
              {/* Información de contacto */}
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                  <h3 className="text-2xl font-bold text-gray-800 mb-6">
                    Información de Contacto
                  </h3>

                  <div className="space-y-6">
                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center group-hover:bg-red-200 transition-colors">
                        <Mail className="w-6 h-6 text-red-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Email</h4>
                        <p className="text-gray-600">contacto@empresa.com</p>
                        <p className="text-sm text-gray-500">Respuesta en 24 horas</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                        <Phone className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Teléfono</h4>
                        <p className="text-gray-600">+51 123 456 789</p>
                        <p className="text-sm text-gray-500">Lun - Vie: 9:00 - 18:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-4 group">
                      <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center group-hover:bg-green-200 transition-colors">
                        <MapPin className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">Dirección</h4>
                        <p className="text-gray-600">San Isidro, Lima</p>
                        <p className="text-sm text-gray-500">Perú</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Horarios de atención */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 p-8 rounded-2xl text-white">
                  <h3 className="text-2xl font-bold mb-4">Horarios de Atención</h3>
                  <div className="space-y-2 text-red-100">
                    <div className="flex justify-between">
                      <span>Lunes - Viernes:</span>
                      <span className="font-semibold">9:00 - 18:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sábados:</span>
                      <span className="font-semibold">9:00 - 14:00</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Domingos:</span>
                      <span className="font-semibold">Cerrado</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Formulario de contacto */}
              <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-800 mb-6">
                  Envíanos un Mensaje
                </h3>

                {isSubmitted ? (
                  <div className="text-center py-12">
                    <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                    <h4 className="text-2xl font-bold text-green-600 mb-2">
                      ¡Mensaje Enviado!
                    </h4>
                    <p className="text-gray-600">
                      Gracias por contactarnos. Te responderemos pronto.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Nombre completo
                        </label>
                        <input
                          type="text"
                          name="nombre"
                          value={formData.nombre}
                          onChange={handleInputChange}
                          placeholder="Tu nombre"
                          className="w-full p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          placeholder="Tu teléfono"
                          className="w-full p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Correo electrónico
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="tu@email.com"
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">
                        Mensaje
                      </label>
                      <textarea
                        name="mensaje"
                        value={formData.mensaje}
                        onChange={handleInputChange}
                        placeholder="¿En qué podemos ayudarte?"
                        rows={5}
                        className="w-full p-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all outline-none resize-none"
                      ></textarea>
                    </div>

                    <button
                      onClick={handleSubmit}
                      className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
                    >
                      <Send className="w-5 h-5" />
                      <span>Enviar Mensaje</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
