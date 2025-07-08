import React, { useEffect, useState, useCallback } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import { Search, UserPlus, Info } from 'lucide-react';
import { decryptValue } from '@/app/utils/security/securityHelpers';
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

const AddStaff = ({ event }: EventStaffProps) => {
  const { users } = useUsers();

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);
  const [dniInput, setDniInput] = useState('');
  const [newUser, setNewUser] = useState<User | null>(null);
  const [newPermissions, setNewPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
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
        showNotification('error', 'Debe quitar los demás permisos antes de asignar como jurado.');
        return;
      }
    }

    if (isJudge && newPermissions.length > 0 && !isCurrentlyJudge) {
      // No permitir tener otros permisos además de judge
      showNotification('error', 'El jurado no puede tener otros permisos asignados.');
      return;
    }

    if (!isJudge && newPermissions.includes('judge')) {
      // No permitir añadir otros si ya es jurado
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
    setNewPermissions(SECTIONS
      .filter(s => s.id !== 'judge') // O 'jurado' si así se llama tu ID
      .map(s => s.id)
    );
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

  // Abrir modal de información de usuario
  const openUserModal = (user?: User) => {
    if (user) {
      setModalUser(user);
      setShowModal(true);
    }
  };

  return (
    <div className="bg-blue-50 p-6 rounded-lg mb-8 border border-blue-100" >
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

      {
        newUser && (
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
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded text-gray-700 disabled:opacity-50"
                disabled={newPermissions.includes('judge')}
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
        )
      }
    </div >
  )
}

export default AddStaff