import React from 'react';
import { User } from '@/app/types/userType';

interface Props {
  foundUser: User & {
    location: {
      department: string;
      district: string;
      province: string;
    };
  };
}

const PlaceInformation: React.FC<Props> = ({ foundUser }) => {
  const placeItems = [
    { label: 'Departamento', value: foundUser?.location?.department || 'N/A' },
    { label: 'Provincia', value: foundUser?.location?.province || 'N/A' },
    { label: 'Distrito', value: foundUser?.location?.district || 'N/A' },
  ];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:-bottom-2">
          Información de Ubicación
        </h2>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          Locación
        </span>
      </div>

      {/* Map Preview - Optional decorative element */}
      <div className="w-full h-40 bg-blue-50 rounded-xl mb-6 overflow-hidden relative shadow-inner">
        {/* <div className="absolute inset-0 opacity-20 bg-[url('/api/placeholder/800/400')] bg-cover bg-center"></div> */}
        {/* <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-500 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span className="text-gray-700 font-medium">Vista previa no disponible</span>
          </div>
        </div> */}
      </div>

      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {placeItems.map(({ label, value }, index) => {
          // Definir iconos para cada tipo de ubicación
          const icons = [
            "M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42", // Departamento (sun icon)
            "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6", // Provincia (home icon)
            "M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z M15 11a3 3 0 11-6 0 3 3 0 016 0z", // Distrito (pin icon)
          ];

          // Colores para cada tipo
          const colors = ['text-orange-500', 'text-green-500', 'text-purple-500'];
          const bgColors = ['bg-orange-100', 'bg-green-100', 'bg-purple-100'];

          return (
            <div key={label} className="relative group transition-all duration-200 hover:translate-y-[-2px]">
              <div className={`absolute top-0 right-0 w-10 h-10 flex items-center justify-center rounded-full -mt-3 -mr-3 ${bgColors[index % 3]} group-hover:scale-110 transition-transform duration-200`}>
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${colors[index % 3]}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[index % 3]} />
                </svg>
              </div>

              <div className="pt-2">
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                  <span className={`w-2 h-2 ${bgColors[index % 3]} rounded-full inline-block mr-2`}></span>
                  {label}
                </label>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <p className="text-gray-800 font-medium flex items-center">
                    {value}
                    {index === 0 && value && (
                      <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Principal
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Optional footer with additional info */}
      <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-500 flex items-center justify-between">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Ubicación verificada</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceInformation;
