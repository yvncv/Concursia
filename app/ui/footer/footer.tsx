import Link from 'next/link'
import React from 'react'

const Footer = ({brandName}: {brandName: string}) => {
  return (
    <footer className="bg-rojo text-white py-8 mb-0 bottom-0">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-between">
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">{brandName}</h3>
            <p>Celebrando la cultura y tradición de la marinera norteña.</p>
          </div>
          <div className="w-full md:w-1/3 mb-6 md:mb-0">
            <h3 className="text-xl font-bold mb-2">Enlaces Rápidos</h3>
            <ul>
              <li><Link href="#eventos" className="hover:text-red-500">Eventos</Link></li>
              <li><Link href="#galeria" className="hover:text-red-500">Galería</Link></li>
              <li><Link href="#acerca" className="hover:text-red-500">Acerca de</Link></li>
              <li><Link href="#contacto" className="hover:text-red-500">Contacto</Link></li>
            </ul>
          </div>
          <div className="w-full md:w-1/3">
            <h3 className="text-xl font-bold mb-2">Síguenos</h3>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-red-500">Facebook</a>
              <a href="#" className="hover:text-red-500">Instagram</a>
              <a href="#" className="hover:text-red-500">YouTube</a>
            </div>
          </div>
        </div>
        <div className="mt-8 text-center">
          <p>&copy; 2023 {brandName}. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer