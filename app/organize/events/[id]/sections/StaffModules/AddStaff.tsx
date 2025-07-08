import React, { useEffect, useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import { Search, UserPlus, Info, CheckCircle, AlertCircle, XCircle, AlertTriangle } from 'lucide-react';
import { decryptValue } from '@/app/utils/security/securityHelpers';
import { findUserByHashedDni } from "@/app/utils/security/dni/findUserByHashedDni";

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
  juradoInicia?: boolean;
  user?: User;
}

interface EventStaffProps {
  event: CustomEvent;
}

// Componente de notificación mejorado
const NotificationToast = ({ notification, onClose }) => {
  const icons = {
    success: <CheckCircle className="w-5 h-5 text-green-600" />,
    error: <XCircle className="w-5 h-5 text-red-600" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600" />,
    info: <Info className="w-5 h-5 text-blue-600" />
  };

  const bgColors = {
    success: 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200',
    error: 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200',
    warning: 'bg-gradient-to-r from-amber-50 to-yellow-50 border-amber-200',
    info: 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200'
  };

  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-right-full duration-300">
      <div className={`${bgColors[notification.type]} border rounded-xl p-4 shadow-lg max-w-md`}>
        <div className="flex items-start gap-3">
          {icons[notification.type]}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800">{notification.message}</p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

const AddStaff = ({ event }: EventStaffProps) => {
  const { users } = useUsers();

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);
  const [dniInput, setDniInput] = useState('');
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [newJuradoInicia, setNewJuradoInicia] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'warning' | 'info';
    message: string;
  } | null>(null);

  // Enriquecer las entradas de personal con información de usuario
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

  const showNotification = useCallback((type: 'success' | 'error' | 'warning' | 'info', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  }, []);

  // Sincronizar con Firestore
  const syncFirestore = useCallback(async (updated: StaffEntry[]) => {
    setLoading(true);
    try {
      const ref = doc(db, 'eventos', event.id);
      const payload = updated.map(({ userId, permissions, juradoInicia }) => ({ 
        userId, 
        permissions, 
        juradoInicia 
      }));
      await updateDoc(ref, { staff: payload });
      showNotification('success', 'Permisos actualizados correctamente');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error actualizando permisos');
    }
    setLoading(false);
  }, [event.id, showNotification]);

  // Verificar DNI para buscar usuario
  const handleDniCheck = async () => {
    const sanitizedDni = dniInput.trim();

    if (!/^\d{8}$/.test(sanitizedDni)) {
      showNotification('error', 'Ingrese un DNI válido de 8 dígitos');
      return;
    }

    setLoading(true);
    try {
      const user = await findUserByHashedDni(sanitizedDni);

      if (!user) {
        showNotification('error', 'Usuario no encontrado con este DNI');
        return;
      }

      const existingEntry = staffEntries.find(e => e.userId === user.id);
      const duplicateByDni = staffEntries.find(e => {
        if (!e.user?.dni) return false;
        return decryptValue(e.user.dni) === sanitizedDni && e.user.id !== user.id;
      });

      if (duplicateByDni) {
        showNotification('error', 'Ya existe un miembro del staff con este DNI.');
        return;
      }

      if (existingEntry) {
        setNewUser(user);
        setNewPermissions(existingEntry.permissions);
        setNewJuradoInicia(existingEntry.juradoInicia || false);
        showNotification('warning', 'Usuario ya forma parte del personal. Puede editar sus permisos.');
      } else {
        setNewUser(user);
        setNewPermissions(['overview']);
        setNewJuradoInicia(false);
        showNotification('success', 'Usuario encontrado. Puede asignarle permisos.');
      }
    } catch (error) {
      console.error("Error al buscar usuario por DNI:", error);
      showNotification('error', 'Error al buscar el usuario. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  // Alternar permisos para nuevo personal
  const toggleNewPermission = (perm: string) => {
    const isJudge = perm === 'judge';
    const isCurrentlyJudge = newPermissions.includes('judge');

    if (isJudge && !isCurrentlyJudge) {
      const maxJudges = event?.dance?.levels?.Seriado?.config?.judgesCount || 0;

      const totalCurrentJudges = staffEntries.filter(e =>
        e.permissions.includes('judge') &&
        e.userId !== newUser?.id
      ).length;

      if (totalCurrentJudges >= maxJudges) {
        showNotification('error', `Ya se alcanzó el máximo de ${maxJudges} jurados permitidos.`);
        return;
      }

      // Si tiene otros permisos, confirmar que solo quedará como jurado
      if (newPermissions.length > 0) {
        showNotification('warning', 'Al asignar como jurado, se eliminarán todos los demás permisos.');
        setNewPermissions(['judge']);
        setNewJuradoInicia(false);
        return;
      }
    }

    if (isJudge && newPermissions.length > 0 && !isCurrentlyJudge) {
      showNotification('error', 'El jurado no puede tener otros permisos asignados.');
      return;
    }

    if (!isJudge && newPermissions.includes('judge')) {
      showNotification('error', 'Los jurados no pueden tener otros roles. Debe quitar el rol de jurado primero.');
      return;
    }

    setNewPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  // Asignar todos los permisos
  const assignAllPermissions = () => {
    if (newPermissions.includes('judge')) {
      showNotification('warning', 'No se pueden asignar todos los permisos a un jurado.');
      return;
    }
    setNewPermissions(SECTIONS
      .filter(s => s.id !== 'judge')
      .map(s => s.id)
    );
  };

  // Quitar todos los permisos
  const clearAllPermissions = () => {
    setNewPermissions([]);
    setNewJuradoInicia(false);
  };

  // Agregar o actualizar miembro del personal
  const handleAdd = async () => {
    if (!newUser) return;

    if (newPermissions.length === 0) {
      showNotification('error', 'Seleccione al menos un permiso');
      return;
    }

    const exists = staffEntries.find(e => e.userId === newUser.id);
    let updated: StaffEntry[];

    if (exists) {
      updated = staffEntries.map(e =>
        e.userId === newUser.id
          ? { ...e, permissions: newPermissions, juradoInicia: newJuradoInicia }
          : e
      );
      showNotification('success', `Permisos actualizados para ${newUser.firstName} ${newUser.lastName}`);
    } else {
      updated = [
        ...staffEntries,
        {
          userId: newUser.id,
          permissions: newPermissions,
          juradoInicia: newJuradoInicia,
          user: newUser
        }
      ];
      showNotification('success', `${newUser.firstName} ${newUser.lastName} añadido al personal`);
    }

    setStaffEntries(updated);
    setDniInput('');
    setNewUser(null);
    setNewPermissions([]);
    setNewJuradoInicia(false);
    await syncFirestore(updated);
  };

  // Abrir modal de información de usuario
  const openUserModal = (user?: User) => {
    if (user) {
      setModalUser(user);
      setShowModal(true);
    }
  };

  // Cancelar proceso
  const handleCancel = () => {
    setDniInput('');
    setNewUser(null);
    setNewPermissions([]);
    setNewJuradoInicia(false);
  };

  return (
    <div className="space-y-6">
      {/* Notificaciones */}
      {notification && (
        <NotificationToast
          notification={notification}
          onClose={() => setNotification(null)}
        />
      )}

      {/* Contenedor principal mejorado */}
      <div className="group">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-10 group-hover:opacity-20 transition-opacity duration-300"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-8 shadow-lg">
            
            {/* Header mejorado */}
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Añadir Nuevo Personal
                </h3>
                <p className="text-gray-600 text-sm mt-1">
                  Busque usuarios por DNI y asigne permisos
                </p>
              </div>
            </div>

            {/* Buscador mejorado */}
            <div className="flex gap-4 items-center mb-6">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Ingrese DNI del usuario (8 dígitos)"
                  value={dniInput}
                  onChange={e => setDniInput(e.target.value)}
                  className="block w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
                  disabled={loading}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && dniInput.trim()) {
                      handleDniCheck();
                    }
                  }}
                />
              </div>
              <button
                onClick={handleDniCheck}
                disabled={loading || !dniInput.trim()}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl text-white font-medium transition-all duration-200 ${
                  loading || !dniInput.trim() 
                    ? 'bg-gray-300 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-blue-200'
                }`}
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Verificando...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    Verificar
                  </>
                )}
              </button>
            </div>

            {/* Información del usuario encontrado */}
            {newUser && (
              <div className="space-y-6">
                {/* Separador visual */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-xl">
                          {newUser.firstName?.charAt(0)}{newUser.lastName?.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-xl font-semibold text-gray-800">
                          {newUser.firstName} {newUser.lastName}
                        </h4>
                        <p className="text-sm text-gray-600">
                          DNI: {decryptValue(newUser.dni)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancel}
                        className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-all duration-200"
                      >
                        <XCircle size={16} />
                        Cancelar
                      </button>
                    </div>
                  </div>

                  {/* Controles rápidos */}
                  <div className="flex justify-between items-center mb-6">
                    <h5 className="text-lg font-semibold text-gray-800">Asignar Permisos</h5>
                    <div className="flex gap-2">
                      <button
                        onClick={assignAllPermissions}
                        className="text-sm bg-blue-100 hover:bg-blue-200 px-3 py-1.5 rounded-lg text-blue-700 font-medium transition-all duration-200 disabled:opacity-50"
                        disabled={newPermissions.includes('judge')}
                      >
                        Todos los permisos
                      </button>
                      <button
                        onClick={clearAllPermissions}
                        className="text-sm bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-gray-700 font-medium transition-all duration-200"
                      >
                        Limpiar todo
                      </button>
                    </div>
                  </div>

                  {/* Alerta informativa para jurado */}
                  {newPermissions.includes('judge') && (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-amber-800">
                            Rol exclusivo de jurado
                          </p>
                          <p className="text-xs text-amber-700 mt-1">
                            Los jurados no pueden tener otros roles. Solo pueden acceder al panel de calificación.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Checkbox especial para jurado */}
                  {newPermissions.includes('judge') && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <label className="flex items-center gap-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={newJuradoInicia}
                          onChange={() => setNewJuradoInicia(prev => !prev)}
                          className="w-5 h-5 accent-blue-600 rounded"
                        />
                        <div>
                          <span className="text-sm font-medium text-blue-800">
                            Inicia automáticamente como jurado
                          </span>
                          <p className="text-xs text-blue-600 mt-1">
                            El usuario será dirigido directamente al panel de jurado al iniciar sesión
                          </p>
                        </div>
                      </label>
                    </div>
                  )}

                  {/* Grid de permisos mejorado */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {SECTIONS.map(sec => {
                      const isJudgeRole = sec.id === 'judge';
                      const isCurrentlyJudge = newPermissions.includes('judge');
                      const isSelected = newPermissions.includes(sec.id);
                      const isDisabled = !isJudgeRole && isCurrentlyJudge;

                      return (
                        <div
                          key={sec.id}
                          className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                            isDisabled
                              ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                              : isSelected
                                ? isJudgeRole
                                  ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md cursor-pointer'
                                  : 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md cursor-pointer'
                                : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                          }`}
                          onClick={() => !isDisabled && toggleNewPermission(sec.id)}
                        >
                          <div className="p-4">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                disabled={isDisabled}
                                onChange={() => !isDisabled && toggleNewPermission(sec.id)}
                                className={`w-5 h-5 rounded mt-0.5 ${
                                  isJudgeRole ? 'accent-amber-600' : 'accent-blue-600'
                                } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                                id={`new-${sec.id}`}
                              />
                              <div className="flex-1 min-w-0">
                                <label
                                  htmlFor={`new-${sec.id}`}
                                  className={`block text-sm font-medium mb-1 ${
                                    isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer'
                                  }`}
                                >
                                  {sec.name}
                                  {isJudgeRole && (
                                    <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                      Exclusivo
                                    </span>
                                  )}
                                </label>
                                <p className={`text-xs line-clamp-2 ${
                                  isDisabled ? 'text-gray-400' : 'text-gray-600'
                                }`}>
                                  {sec.description}
                                </p>
                              </div>
                            </div>
                          </div>
                          {isSelected && (
                            <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${
                              isJudgeRole ? 'bg-amber-500' : 'bg-blue-500'
                            }`}></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Botón de acción final */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleAdd}
                      disabled={loading || newPermissions.length === 0}
                      className={`flex items-center gap-2 px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 ${
                        loading || newPermissions.length === 0
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 shadow-lg hover:shadow-green-200'
                      }`}
                    >
                      {loading ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Procesando...
                        </>
                      ) : (
                        <>
                          <UserPlus size={18} />
                          {staffEntries.find(e => e.userId === newUser.id) ? 'Actualizar Permisos' : 'Añadir al Personal'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddStaff;