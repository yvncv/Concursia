import { UserCircle } from 'lucide-react';
import React from 'react';

const InfoUser: React.FC<{ users: any; title: string }> = ({ users, title }) => {
  const calculateAge = (birthDate: any): number => {
    const birth = birthDate.toDate();
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }

    return age;
  };

  // Ensure users is an array
  const userArray = Array.isArray(users) ? users : [users];

  return (
    <>
      {/* Información de usuarios */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-3">{title}</h3>
        <div className="space-y-3">
          {userArray.map((user: any) => (
            <div key={user?.id} className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-start gap-4">
                {/* User Image */}
                <div className="flex-shrink-0">
                  {user?.profileImage ? (
                    <img
                      src={user?.profileImage as string}
                      alt={user?.firstName}
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '';
                        (e.target as HTMLImageElement).className = 'hidden';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center">
                      <UserCircle className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                </div>

                {/* User Info */}
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Nombre Completo</p>
                    <p className="font-medium">{user?.firstName} {user?.lastName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">DNI</p>
                    <p className="font-medium">{user?.dni}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Género</p>
                    <p className="font-medium">{user?.gender}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Edad</p>
                    <p className="font-medium">{calculateAge(user?.birthDate)} años</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Fecha de Nacimiento</p>
                    <p className="font-medium">{user?.birthDate.toDate().toLocaleDateString()}</p>
                  </div>
                  {user?.academyName && (
                    <div>
                      <p className="text-sm text-gray-600">Academia</p>
                      <p className="font-medium">{user?.academyName}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default InfoUser;