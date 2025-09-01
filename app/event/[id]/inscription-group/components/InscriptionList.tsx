import React from "react";
import { CheckCircle, Trash2, Users, Send, Archive } from "lucide-react";
import toast from 'react-hot-toast';
import { Ticket } from "@/app/types/ticketType";
import { User } from '@/app/types/userType';
import { decryptValue } from "@/app/utils/security/securityHelpers";

// Definición de tipos
interface EventSettings {
  levels: {
    [key: string]: {
      price?: number;
      couple?: boolean;
      description?: string;
    };
  };
}

interface Event {
  id: string;
  name: string;
  academyId?: string;
  settings: EventSettings;
}

interface Academy {
  id: string;
  name: string;
}

interface GroupValidation {
  isValid: boolean;
  message: string;
  invalidInscriptions?: number[];
  userAcademyName?: string;
  totalInscriptions?: number;
  validInscriptions?: number;
}

interface InscriptionListProps {
  processTicket: Ticket | null;
  eliminarInscripcion: (entryIndex: number) => Promise<void>;
  confirmarTicket: () => void;
  isSubmitting: boolean;
  event: Event;
  groupValidation: GroupValidation;
  getParticipantCategory: (participante: { birthDate: Date }) => string;
  user: User;
  academies: Academy[];
  usersMap: Record<string, User>; // Nueva prop
  getUserById: (userId: string) => Promise<User | null>; // Nueva prop
}

const InscriptionList: React.FC<InscriptionListProps> = ({
  processTicket,
  eliminarInscripcion,
  confirmarTicket,
  isSubmitting,
  event,
  groupValidation,
  getParticipantCategory,
  user,
  academies,
  usersMap,
  getUserById
}) => {

  // Función helper para obtener usuario con fallback
  const getUser = (userId: string): User | null => {
    return usersMap[userId] || null;
  };

  // Función helper para obtener el nombre completo del usuario
  const getUserFullName = (user: User): string => {
    return `${user.firstName} ${user.lastName}`;
  };

  // Función helper para obtener academia por ID
  const getAcademyName = (academyId: string): string => {
    const academy = academies.find(a => a.id === academyId);
    return academy?.name || 'Academia no encontrada';
  };

  const handleEliminarEntry = (entryIndex: number) => {
    if (!processTicket) return;
    
    const entry = processTicket.entries[entryIndex];
    const participantCount = entry.usersId.length;
    
    // Obtener nombres de los participantes para el toast
    const participantNames = entry.usersId
      .map(userId => {
        const user = getUser(userId);
        return user ? getUserFullName(user) : `Usuario ${userId.substring(0, 8)}...`;
      })
      .join(', ');
    
    const participantText = participantCount > 1 ? `${participantCount} participantes` : '1 participante';
    
    toast((t) => (
      <div className="flex flex-col">
        <p className="font-medium">¿Eliminar inscripción?</p>
        <p className="text-sm text-gray-600">{participantText}: {participantNames}</p>
        <p className="text-xs text-gray-500">{entry.level} - S/. {entry.amount}</p>
        <div className="flex gap-2 mt-2">
          <button
            onClick={async () => {
              await eliminarInscripcion(entryIndex);
              toast.dismiss(t.id);
            }}
            className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600 transition-colors"
          >
            Eliminar
          </button>
          <button
            onClick={() => toast.dismiss(t.id)}
            className="bg-gray-300 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-400 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    ), {
      duration: 6000,
      style: { maxWidth: '320px' }
    });
  };

  return (
    <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center">
          <Archive className="w-5 h-5 mr-2 text-blue-600" />
          Ticket de Inscripciones
          {processTicket && (
            <span className="ml-3 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full font-medium">
              En Proceso
            </span>
          )}
        </h3>
      </div>

      {!processTicket || processTicket.entries.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
          <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">No hay inscripciones en el ticket</p>
          <p className="text-sm text-gray-400 mt-1">
            Agrega inscripciones usando el formulario. Se guardarán automáticamente.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Tabla unificada - Versión desktop */}
          <div className="hidden md:block overflow-hidden border border-gray-200 rounded-lg">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Modalidad
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Participante
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Pareja
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Categoría
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Precio
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {processTicket.entries.map((entry, index) => {
                  const firstUser = getUser(entry.usersId[0]);
                  const secondUser = entry.usersId.length > 1 ? getUser(entry.usersId[1]) : null;
                  const firstUserAcademy = firstUser?.marinera?.academyName || '';
                  const secondUserAcademy = secondUser?.marinera?.academyName || '';

                  return (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <div className="font-medium text-gray-900">{entry.level}</div>
                        <div className="text-xs text-blue-600">
                          {entry.usersId.length === 1 ? 'Individual' : 'Pareja'}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {firstUser ? (
                          <div>
                            <p className="font-medium text-gray-800">{getUserFullName(firstUser)}</p>
                            <p className="text-xs text-gray-500">DNI: {decryptValue(firstUser.dni)}</p>
                            <p className="text-xs text-blue-600">{firstUserAcademy || 'Sin academia'}</p>
                          </div>
                        ) : (
                          <div className="text-gray-400">
                            <p>Usuario no encontrado</p>
                            <p className="text-xs">ID: {entry.usersId[0]?.substring(0, 8)}...</p>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        {secondUser ? (
                          <div>
                            <p className="font-medium text-gray-800">{getUserFullName(secondUser)}</p>
                            <p className="text-xs text-gray-500">DNI: {decryptValue(secondUser.dni)}</p>
                            <p className="text-xs text-purple-600">{secondUserAcademy || 'Sin academia'}</p>
                          </div>
                        ) : (
                          <span className="text-gray-400 italic">Individual</span>
                        )}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        <span className="font-medium">{entry.category}</span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-green-600">
                        S/. {entry.amount}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-center">
                        <button
                          onClick={() => handleEliminarEntry(index)}
                          disabled={isSubmitting}
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                          title="Eliminar inscripción"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista móvil - Cards */}
          <div className="md:hidden space-y-3">
            {processTicket.entries.map((entry, index) => {
              const firstUser = getUser(entry.usersId[0]);
              const secondUser = entry.usersId.length > 1 ? getUser(entry.usersId[1]) : null;
              const firstUserAcademy = firstUser?.marinera?.academyName || '';
              const secondUserAcademy = secondUser?.marinera?.academyName || '';

              return (
                <div key={index} className="rounded-lg p-4 border bg-gray-50">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{entry.level}</h4>
                      <p className="text-sm text-blue-600">
                        {entry.usersId.length === 1 ? 'Individual' : 'Pareja'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEliminarEntry(index)}
                        disabled={isSubmitting}
                        className="text-red-500 hover:text-red-700 p-1 rounded disabled:opacity-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium">Participante:</span>
                      {firstUser ? (
                        <div className="mt-1">
                          <p>{getUserFullName(firstUser)}</p>
                          <p className="text-xs text-gray-500">DNI: {decryptValue(firstUser.dni)}</p>
                          <p className="text-xs text-blue-600">{firstUserAcademy || 'Sin academia'}</p>
                        </div>
                      ) : (
                        <p className="text-gray-400">Usuario no encontrado</p>
                      )}
                    </div>
                    
                    {secondUser && (
                      <div>
                        <span className="font-medium">Pareja:</span>
                        <div className="mt-1">
                          <p>{getUserFullName(secondUser)}</p>
                          <p className="text-xs text-gray-500">DNI: {decryptValue(secondUser.dni)}</p>
                          <p className="text-xs text-purple-600">{secondUserAcademy || 'Sin academia'}</p>
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between pt-2 border-t">
                      <span><strong>Categoría:</strong> {entry.category}</span>
                      <span className="font-semibold text-green-600">S/. {entry.amount}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Resumen y botón para enviar a pendiente */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <div>
                <div className="grid grid-cols-2 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-gray-600">Total inscripciones:</span>
                    <span className="font-semibold ml-2">{processTicket.entries.length}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Total participantes:</span>
                    <span className="font-semibold ml-2">
                      {processTicket.entries.reduce((total, entry) => total + entry.usersId.length, 0)}
                    </span>
                  </div>
                </div>
                <p className="text-2xl font-bold text-blue-800">
                  Monto total: <span className="text-green-600">S/. {processTicket.totalAmount}</span>
                </p>
                <p className="text-sm text-blue-600 mt-1">
                  Ticket en proceso - Puedes seguir agregando inscripciones
                </p>
              </div>
              
              <button
                onClick={confirmarTicket}
                disabled={isSubmitting || !processTicket || processTicket.entries.length === 0 || !groupValidation.isValid}
                className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center ${
                  isSubmitting || !processTicket || processTicket.entries.length === 0 || !groupValidation.isValid
                    ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 mr-2" />
                    Enviar Ticket a Pago
                  </>
                )}
              </button>
            </div>
            
            <div className="mt-3 text-xs text-gray-600">
              <p>✓ Al enviar, el ticket pasará a estado "Pendiente" y no podrás modificarlo.</p>
              {!groupValidation.isValid && (
                <p className="text-red-600 mt-1">⚠️ {groupValidation.message}</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InscriptionList;