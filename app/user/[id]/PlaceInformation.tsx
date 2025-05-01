import React from 'react';
import { User } from '@/app/types/userType';

interface Props {
  foundUser: User & {
    department: string;
    district: string;
    province: string;
  };
}

const PlaceInformation: React.FC<Props> = ({ foundUser }) => {
  const { department, district, province } = foundUser;

  const placeItems = [
    { label: 'Departamento', value: department || 'N/A' },
    { label: 'Provincia', value: province || 'N/A' },
    { label: 'Distrito', value: district || 'N/A' },
  ];

  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
        Información de Ubicación
      </h2>

      {/* Map Embed */}
      {/* <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 mb-2">
          Ubicación
        </label>
        <div className="w-full h-64 rounded-lg overflow-hidden shadow-sm">
          iframe
            title="Mapa de ubicación"
            src={mapSrc}
            className="w-full h-full"
            allowFullScreen
          /> 
        </div>
      </div> */}

      {/* Department, Province, District */}
      {placeItems.map(({ label, value }) => (
        <div key={label} className="mb-4">
          <label className="block text-sm font-medium text-gray-600 mb-2">
            {label}
          </label>
          <div className="bg-white rounded-xl p-3 shadow-sm">
            <p className="text-gray-800 font-medium">{value}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PlaceInformation;
