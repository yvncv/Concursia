"use client";

import { eventos } from "./evento-info";
import Image from "next/image";

export default function EventosComponents() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-4">
      {eventos.map((event) => (
        <div 
          className="bg-white rounded-lg shadow-md overflow-hidden transform transition hover:scale-105 hover:shadow-lg" 
          key={event.title}
        >
          <Image
            src={event.image}
            className="w-full h-48 object-cover"
            alt={event.title}
            width={200}
            height={200}
          />
          <div className="p-4">
            <h5 className="text-lg font-semibold text-gray-800">{event.title}</h5>
            {/* Puedes habilitar el subtítulo si lo necesitas */}
            {/* <h6 className="text-sm text-gray-600">{event.subtitle}</h6> */}
            <p className="text-gray-600 text-sm mt-2">{event.description}</p>
            <a
              href="#"
              className="block mt-4 text-center bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
            >
              Más información
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
