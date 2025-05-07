"use client"
import { useState, useEffect } from 'react';
import { Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function UnAuthorized () {
  const [stars, setStars] = useState([]);
  
  useEffect(() => {
    // Crear estrellas aleatorias
    const generateStars = () => {
      const newStars = [];
      const starsCount = 100;
      
      for (let i = 0; i < starsCount; i++) {
        newStars.push({
          id: i,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          size: Math.random() * 3 + 1,
          animationDelay: `${Math.random() * 6}s`
        });
      }
      
      setStars(newStars);
    };
    
    generateStars();
  }, []);

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-100 to-orange-100 flex items-center justify-center overflow-hidden p-4">
      {/* Estrellas */}
      <div className="absolute inset-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute rounded-full bg-red-500 animate-pulse"
            style={{
              left: star.left,
              top: star.top,
              width: `${star.size*20}px`,
              height: `${star.size*20}px`,
              opacity: 0.6,
              animationDuration: '3s',
              animationDelay: star.animationDelay
            }}
          />
        ))}
      </div>
      
      <div className="relative z-10 max-w-lg w-full bg-gray-200 bg-opacity-30 backdrop-blur-sm rounded-2xl p-8 text-center border border-gray-100 shadow-2xl">
        <h1 className="text-9xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-pink-600 mb-4">404</h1>
        
        <h2 className="text-3xl font-bold text-black mb-4">Página no encontrada</h2>
        
        <p className="text-gray-900 text-lg mb-8">
          La página que estás buscando parece haberse perdido en el espacio digital.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Link href="/" className="flex items-center justify-center gap-2 bg-gradient-to-r from-orange-500 to-pink-500 text-black font-medium py-3 px-6 rounded-full hover:opacity-90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1">
            <Home size={20} />
            <span>Volver al inicio</span>
          </Link>
          
          <button 
            onClick={() => window.history.back()}
            className="flex items-center justify-center gap-2 bg-gray-200 text-white font-medium py-3 px-6 rounded-full hover:bg-gray-100 transition-all"
          >
            <ArrowLeft size={20} color='black' />
            <span className='text-black'>Regresar</span>
          </button>
        </div>
      </div>
    </div>
  );
}