import React from 'react';
import { User } from '@/app/types/userType';

interface Props {
  foundUser: User;
}

const PersonalInformation: React.FC<Props> = ({ foundUser }) => {
  // Safely format birth date (if exists)
  const formattedBirthDate = foundUser.birthDate
    ? new Date(foundUser.birthDate.toDate()).toISOString().split('T')[0]
    : 'N/A';

  const infoItems = [
    { label: 'DNI', value: foundUser.dni || 'N/A' },
    { label: 'Fecha de Nacimiento', value: formattedBirthDate },
    { label: 'Género', value: foundUser.gender || 'N/A' },
    { label: 'Categoría', value: foundUser.category || 'N/A' },
  ];
  // Definir iconos para diferentes tipos de información
  const icons = [
    "M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2", // DNI
    "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", // Fecha de nacimiento
    "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", // Género
    "M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z", // Categoría
  ];

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
      {/* Header with status badge */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:-bottom-2">
          Información Personal
        </h2>
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            Perfil Completo
          </span>
        </div>
      </div>

      {/* Information grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {infoItems.map(({ label, value }, index) =>
          <div key={label} className="mb-4 transition-all duration-200 hover:translate-y-[-2px] group">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
              {label}
            </label>
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200 relative">
              <div className="absolute top-1/2 left-4 transform -translate-y-1/2 text-gray-300 group-hover:text-blue-400 transition-colors duration-200">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icons[index % 4]} />
                </svg>
              </div>
              <p className="text-gray-800 font-medium pl-7">{value}</p>

              {/* Badge for specific items */}
              {label === 'Categoría' && (
                <span className="absolute top-0 right-0 -mt-2 -mr-2 px-2 py-1 bg-blue-500 text-white text-xs rounded-full shadow-md">
                  Nuevo
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer with additional information */}
      <div className="mt-6 pt-4 border-t border-gray-200 flex flex-col sm:flex-row sm:justify-between text-sm text-gray-500">
        <div className="flex items-center mb-2 sm:mb-0">
          {/* <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
          </svg>
          <span>Rol: {foundUser.roleId.toString()}</span> */}
        </div>
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Se unió en: {foundUser.createdAt.toDate().toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};

export default PersonalInformation;
