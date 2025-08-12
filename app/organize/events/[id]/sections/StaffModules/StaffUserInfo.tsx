import React, { useEffect, useState } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import InfoUser from '@/app/ui/info-user/InfoUser';
import { X, XCircle, CheckCircle2 } from 'lucide-react';

const SECTIONS = [
  { id: 'overview', name: 'Visión General', description: 'Ver información general del evento' },
  { id: 'tickets', name: 'Entradas', description: 'Gestionar entradas y registros' },
  { id: 'participants', name: 'Participantes', description: 'Administrar participantes' },
  { id: 'eventstaff', name: 'Personal', description: 'Gestionar personal y permisos' },
  { id: 'schedule', name: 'Horario', description: 'Administrar programación y agenda' },
  { id: 'statistics', name: 'Estadísticas', description: 'Ver datos y análisis' },
  { id: 'messages', name: 'Mensajes', description: 'Gestionar comunicaciones' },
  { id: 'judge', name: 'Jurado', description: 'Calificar danzas' },
  { id: 'settings', name: 'Configuración', description: 'Cambiar configuración del evento' }
];

interface StaffEntry {
  userId: string;
  permissions: string[];
  user?: User;
}

interface StaffUserInfoProps {
  event: CustomEvent;
  modalUser: User;
  close: () => void;
}

const StaffUserInfo = ({ event, modalUser, close }: StaffUserInfoProps) => {
  const { users } = useUsers();
  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);

  useEffect(() => {
    const enriched = (event.staff || []).map(s => {
      const user = users.find(u => u.id === s.userId);
      return {
        userId: s.userId,
        permissions: s.permissions || [],
        juradoInicia: s.juradoInicia ?? false,
        user,
      };
    });
    setStaffEntries(enriched);
  }, [event.staff, users]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">Información del usuario</h3>
          <button
            onClick={close}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X />
          </button>
        </div>

        <div className="p-4">
          <InfoUser users={modalUser} title="" />

          <div className="mt-6 border-t pt-4">
            <h4 className="text-md font-medium mb-3">Permisos asignados</h4>

            {(() => {
              const staffEntry = staffEntries.find(e => e.userId === modalUser.id);
              if (!staffEntry || staffEntry.permissions.length === 0) {
                return (
                  <p className="text-gray-500 italic">Este usuario no tiene permisos asignados.</p>
                );
              }

              return (
                <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                  <div className="grid grid-cols-2 gap-2">
                    {SECTIONS.map(section => {
                      const hasPermission = staffEntry.permissions.includes(section.id);
                      return (
                        <div
                          key={section.id}
                          className={`flex items-center p-2 rounded ${hasPermission ? 'text-blue-700' : 'text-gray-400'}`}
                        >
                          {hasPermission ? (
                            <CheckCircle2 size={16} className="mr-2 flex-shrink-0" />
                          ) : (
                            <XCircle size={16} className="mr-2 flex-shrink-0" />
                          )}
                          <span className={hasPermission ? 'font-medium' : ''}>
                            {section.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffUserInfo;
