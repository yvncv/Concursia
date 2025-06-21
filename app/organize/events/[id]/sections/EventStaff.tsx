import React, { useEffect, useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import InfoUser from '@/app/ui/info-user/InfoUser';
import {
  X, AlertCircle, Search, UserPlus, Edit, Trash2,
  Save, XCircle, Eye, Info, CheckCircle2
} from 'lucide-react';
import { decryptValue } from '@/app/utils/encryption';
import { findUserByHashedDni } from '@/app/utils/findUserByHashedDni';

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

interface EventStaffProps {
  event: CustomEvent;
}

export default function EventStaff({ event }: EventStaffProps) {
  const { users } = useUsers();

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);
  const [dniInput, setDniInput] = useState('');
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const [filter, setFilter] = useState('');

  // Enriquecer las entradas de personal con información de usuario
  useEffect(() => {
    const enriched = (event.staff || []).map(s => {
      const user = users.find(u => u.id === s.userId);
      const permissions = s.permissions || [];
      return { userId: s.userId, permissions, user };
    });
    setStaffEntries(enriched);
  }, [event.staff, users]);

  const showNotification = useCallback((type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  // Sincronizar con Firestore
  const syncFirestore = useCallback(async (updated: StaffEntry[]) => {
    setLoading(true);
    try {
      const ref = doc(db, 'eventos', event.id);
      const payload = updated.map(({ userId, permissions }) => ({ userId, permissions }));
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

    try {
      const user = await findUserByHashedDni(sanitizedDni);

      if (!user) {
        showNotification('error', 'Usuario no encontrado con este DNI');
        return;
      }

      const existingEntry = staffEntries.find(e => e.userId === user.id);

      if (existingEntry) {
        setNewUser(user);
        setNewPermissions(existingEntry.permissions);
        showNotification('success', 'Usuario ya forma parte del personal. Puede editar sus permisos.');
      } else {
        setNewUser(user);
        setNewPermissions(['overview']);
        showNotification('success', 'Usuario encontrado. Puede asignarle permisos.');
      }
    } catch (error) {
      console.error("Error al buscar usuario por DNI:", error);
      showNotification('error', 'Error al buscar el usuario. Intente nuevamente.');
    }
  };


  // Alternar permisos para nuevo personal
  const toggleNewPermission = (perm: string) => {
    setNewPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  // Asignar todos los permisos
  const assignAllPermissions = () => {
    setNewPermissions(SECTIONS.map(s => s.id));
  };

  // Quitar todos los permisos
  const clearAllPermissions = () => {
    setNewPermissions([]);
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
          ? { ...e, permissions: newPermissions }
          : e
      );
      showNotification('success', `Permisos actualizados para ${newUser.firstName} ${newUser.lastName}`);
    } else {
      updated = [
        ...staffEntries,
        {
          userId: newUser.id,
          permissions: newPermissions,
          user: newUser
        }
      ];
      showNotification('success', `${newUser.firstName} ${newUser.lastName} añadido al personal`);
    }

    setStaffEntries(updated);
    setDniInput('');
    setNewUser(null);
    setNewPermissions([]);
    await syncFirestore(updated);
  };

  // Iniciar edición de permisos
  const startEdit = (entry: StaffEntry) => {
    setEditingUserId(entry.userId);
    setEditPermissions([...entry.permissions]);
  };

  // Alternar permisos durante edición
  const toggleEditPermission = (perm: string) => {
    setEditPermissions(prev =>
      prev.includes(perm)
        ? prev.filter(p => p !== perm)
        : [...prev, perm]
    );
  };

  // Guardar edición de permisos
  const saveEdit = async () => {
    if (!editingUserId) return;

    if (editPermissions.length === 0) {
      showNotification('error', 'Debe asignar al menos un permiso');
      return;
    }

    const updated = staffEntries.map(e =>
      e.userId === editingUserId
        ? { ...e, permissions: editPermissions }
        : e
    );

    setStaffEntries(updated);
    setEditingUserId(null);
    setEditPermissions([]);
    await syncFirestore(updated);
  };

  // Cancelar edición
  const cancelEdit = () => {
    setEditingUserId(null);
    setEditPermissions([]);
  };

  // Eliminar miembro del personal
  const handleRemove = async (userId: string) => {
    const member = staffEntries.find(e => e.userId === userId);
    const updated = staffEntries.filter(e => e.userId !== userId);

    setStaffEntries(updated);
    await syncFirestore(updated);
    setDeleteConfirmation(null);

    if (member?.user) {
      showNotification('success', `${member.user?.firstName} ${member.user?.lastName} eliminado del personal`);
    }
  };

  // Abrir modal de información de usuario
  const openUserModal = (user?: User) => {
    if (user) {
      setModalUser(user);
      setShowModal(true);
    }
  };

  // Cerrar modal de información de usuario
  const closeUserModal = () => {
    setShowModal(false);
    setModalUser(null);
  };

  // Filtrar entradas de personal
  const filteredStaff = staffEntries.filter(entry => {
    if (!filter) return true;
    const fullName = `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.toLowerCase();
    return fullName.includes(filter.toLowerCase());
  });

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
      {/* Encabezado */}
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">Gestión de Personal y Permisos</h2>
        <p className="text-gray-500 mt-1">Asigne personal y administre los permisos para su evento</p>
      </div>

      {/* Notificaciones */}
      {notification && (
        <div className={`mb-6 p-3 rounded-md flex items-center gap-2 ${notification.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' :
            'bg-red-50 text-red-700 border border-red-200'
          }`}>
          {notification.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Sección para añadir nuevo personal */}
      <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100">
        <h3 className="text-lg font-medium text-blue-800 mb-4 flex items-center gap-2">
          <UserPlus size={20} />
          Añadir nuevo personal
        </h3>

        <div className="flex gap-4 items-center">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="DNI del usuario (8 dígitos)"
              value={dniInput}
              onChange={e => setDniInput(e.target.value)}
              className="border border-gray-300 p-2 pl-10 rounded-md w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              disabled={loading}
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
          <button
            onClick={handleDniCheck}
            disabled={loading || !dniInput.trim()}
            className={`px-4 py-2 rounded-md text-white font-medium transition-colors ${loading || !dniInput.trim() ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
          >
            Verificar
          </button>
        </div>

        {newUser && (
          <div className="mt-6 bg-white p-4 rounded-md border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <div>
                <p className="font-medium text-gray-800">{newUser.firstName} {newUser.lastName}</p>
                <p className="text-sm text-gray-500">DNI: {decryptValue(newUser.dni)}</p>
              </div>
              <button
                onClick={() => openUserModal(newUser)}
                className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <Info size={16} /> Ver perfil
              </button>
            </div>

            <p className="mb-3 font-medium text-gray-700">Asignar permisos:</p>

            <div className="flex gap-2 mb-3">
              <button
                onClick={assignAllPermissions}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
              >
                Seleccionar todos
              </button>
              <button
                onClick={clearAllPermissions}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700"
              >
                Deseleccionar todos
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
              {SECTIONS.map(sec => (
                <div
                  key={sec.id}
                  className={`border rounded-md p-3 cursor-pointer transition-all ${newPermissions.includes(sec.id)
                      ? 'bg-blue-50 border-blue-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                    }`}
                  onClick={() => toggleNewPermission(sec.id)}
                >
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={newPermissions.includes(sec.id)}
                      onChange={() => toggleNewPermission(sec.id)}
                      className="w-4 h-4 accent-blue-600"
                      id={`new-${sec.id}`}
                    />
                    <label
                      htmlFor={`new-${sec.id}`}
                      className="font-medium text-gray-800 cursor-pointer select-none"
                    >
                      {sec.name}
                    </label>
                  </div>
                  <p className="text-xs text-gray-500 mt-1 ml-6">{sec.description}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={handleAdd}
                disabled={loading || newPermissions.length === 0}
                className={`flex items-center gap-2 px-4 py-2 rounded-md text-white font-medium transition-colors ${loading || newPermissions.length === 0
                    ? 'bg-green-300 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700'
                  }`}
              >
                {loading ? 'Procesando...' : <><UserPlus size={18} /> Asignar permisos</>}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de personal actual */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Personal Actual</h3>

          {staffEntries.length > 0 && (
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar personal..."
                value={filter}
                onChange={e => setFilter(e.target.value)}
                className="border border-gray-300 p-1.5 pl-8 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Search className="absolute left-2 top-2 text-gray-400" size={16} />
            </div>
          )}
        </div>

        {staffEntries.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center text-gray-500">
            No hay personal asignado a este evento.
          </div>
        ) : filteredStaff.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-md p-8 text-center text-gray-500">
            No se encontraron resultados para "{filter}".
          </div>
        ) : (
          <div className="border border-gray-200 rounded-md overflow-hidden">
            <ul className="divide-y divide-gray-200">
              {filteredStaff.map(entry => (
                <li key={entry.userId} className="p-4 hover:bg-gray-50 transition-colors">
                  {editingUserId === entry.userId ? (
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="font-medium">{entry.user?.firstName} {entry.user?.lastName}</h4>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-1 px-3 py-1 bg-green-600 text-white rounded-md text-sm hover:bg-green-700 transition-colors"
                          >
                            <Save size={16} /> Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1 px-3 py-1 bg-gray-200 text-gray-700 rounded-md text-sm hover:bg-gray-300 transition-colors"
                          >
                            <XCircle size={16} /> Cancelar
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
                        {SECTIONS.map(sec => (
                          <div
                            key={sec.id}
                            className={`border rounded p-2 cursor-pointer transition-all ${editPermissions.includes(sec.id)
                                ? 'bg-blue-50 border-blue-300'
                                : 'bg-white border-gray-200 hover:bg-gray-50'
                              }`}
                            onClick={() => toggleEditPermission(sec.id)}
                          >
                            <div className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={editPermissions.includes(sec.id)}
                                onChange={() => toggleEditPermission(sec.id)}
                                className="w-4 h-4 accent-blue-600"
                                id={`edit-${entry.userId}-${sec.id}`}
                              />
                              <label
                                htmlFor={`edit-${entry.userId}-${sec.id}`}
                                className="text-sm font-medium cursor-pointer select-none"
                              >
                                {sec.name}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-800">{entry.user?.firstName} {entry.user?.lastName}</h4>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {entry.permissions.map(pid => (
                            <span
                              key={pid}
                              className="inline-block bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded border border-blue-100"
                            >
                              {SECTIONS.find(s => s.id === pid)?.name || pid}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openUserModal(entry.user)}
                          className="flex items-center gap-1 px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition-colors"
                          title="Ver información de usuario"
                        >
                          <Eye size={16} /> Ver
                        </button>
                        <button
                          onClick={() => startEdit(entry)}
                          className="flex items-center gap-1 px-3 py-1 border border-blue-300 text-blue-700 rounded-md text-sm hover:bg-blue-50 transition-colors"
                          title="Editar permisos"
                        >
                          <Edit size={16} /> Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(entry.userId)}
                          className="flex items-center gap-1 px-3 py-1 border border-red-300 text-red-700 rounded-md text-sm hover:bg-red-50 transition-colors"
                          title="Eliminar del personal"
                        >
                          <Trash2 size={16} /> Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Modal de información de usuario */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Información del usuario</h3>
              <button
                onClick={closeUserModal}
                className="p-1 rounded-full hover:bg-gray-100 transition-colors"
              >
                <X />
              </button>
            </div>
            <div className="p-4">
              {modalUser && <InfoUser users={modalUser} title="" />}

              {/* Sección de permisos del usuario */}
              {modalUser && (
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
                                className={`flex items-center p-2 rounded ${hasPermission ? 'text-blue-700' : 'text-gray-400'
                                  }`}
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
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 text-red-600 mx-auto mb-4">
                <AlertCircle size={24} />
              </div>
              <h3 className="text-lg font-medium text-center mb-2">Confirmar eliminación</h3>
              <p className="text-gray-500 text-center mb-6">
                ¿Está seguro que desea eliminar a {
                  staffEntries.find(e => e.userId === deleteConfirmation)?.user?.firstName
                } {
                  staffEntries.find(e => e.userId === deleteConfirmation)?.user?.lastName
                } del personal?
              </p>
              <div className="flex gap-4 justify-center">
                <button
                  onClick={() => setDeleteConfirmation(null)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => handleRemove(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  Sí, eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}