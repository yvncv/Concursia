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

  return (
    <div className="bg-gray-50 rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
        Información Personal
      </h2>

      {infoItems.map(({ label, value }) => (
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

export default PersonalInformation;
