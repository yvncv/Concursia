import React, { useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import {
  Search, Edit, Trash2,
  Save, XCircle, Eye
} from 'lucide-react';
import StaffUserInfo from './StaffUserInfo';
import DeleteConfirmation from './DeleteConfirmation';
import JudgeConfirmationModal from './JudgeConfirmationModal';

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

interface StaffListProps {
  event: CustomEvent;
  staffEntries: StaffEntry[];
  setStaffEntries: React.Dispatch<React.SetStateAction<StaffEntry[]>>;
  deleteConfirmation: StaffEntry | null; // ✅ AGREGADO
  setDeleteConfirmation: React.Dispatch<React.SetStateAction<StaffEntry | null>>;
  showNotification: (type: 'success' | 'error', message: string) => void;
  syncFirestore: (updated: StaffEntry[]) => Promise<void>;
}

const StaffList = ({
  event,
  staffEntries,
  setStaffEntries,
  deleteConfirmation,
  setDeleteConfirmation,
  showNotification,
  syncFirestore
}: StaffListProps) => {

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editPermissions, setEditPermissions] = useState<string[]>([]);
  const [editJuradoInicia, setEditJuradoInicia] = useState<boolean>(false);
  const [showModal, setShowModal] = useState(false);
  const [showJudgeModal, setShowJudgeModal] = useState(false);
  const [previousPermissions, setPreviousPermissions] = useState<string[] | null>(null);
  const [isJudgeRemoval, setIsJudgeRemoval] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [filter, setFilter] = useState('');

  // Iniciar edición de permisos
  const startEdit = (entry: StaffEntry) => {
    setEditingUserId(entry.userId);
    setEditPermissions([...entry.permissions]);
    setEditJuradoInicia(entry.juradoInicia || false);
  };

  // Alternar permisos durante edición
  const toggleEditPermission = (perm: string) => {
    if (perm === 'judge') {
      const isCurrentlyJudge = editPermissions.includes('judge');

      if (!isCurrentlyJudge) {
        // ✅ Corrección: acceder al número de jurados desde event.dance.levels
        const maxJudges = event?.dance?.levels?.Seriado?.config?.judgesCount || 0;
        const totalCurrentJudges = staffEntries.filter(e =>
          e.permissions.includes('judge') && e.userId !== editingUserId
        ).length;

        if (totalCurrentJudges >= maxJudges) {
          showNotification('error', `Ya se alcanzó el máximo de ${maxJudges} jurados permitidos.`);
          return;
        }

        if (editPermissions.length > 0) {
          setPreviousPermissions(editPermissions);
          setIsJudgeRemoval(false);
          setShowJudgeModal(true);
        } else {
          setEditPermissions(['judge']);
        }
      } else {
        setIsJudgeRemoval(true);
        setShowJudgeModal(true);
      }

      return;
    }

    if (editPermissions.includes('judge') && editPermissions.length === 1 && perm !== 'judge') return;

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
        ? { ...e, permissions: editPermissions, juradoInicia: editJuradoInicia }
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

  // Abrir modal de información de usuario
  const openUserModal = (user?: User) => {
    if (user) {
      setModalUser(user);
      setShowModal(true);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmation) return;
    const updated = staffEntries.filter(e => e.userId !== deleteConfirmation.userId);
    setStaffEntries(updated);
    setDeleteConfirmation(null);
    await syncFirestore(updated);
    showNotification('success', `${deleteConfirmation.user?.firstName} eliminado del personal`);
  };

  // Filtrar entradas de personal
  const filteredStaff = staffEntries.filter(entry => {
    if (!filter) return true;
    const fullName = `${entry.user?.firstName || ''} ${entry.user?.lastName || ''}`.toLowerCase();
    return fullName.includes(filter.toLowerCase());
  });
  return (
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

      {
        staffEntries.length === 0 ? (
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
                        {editPermissions.includes('judge') && (
                          <div className="mt-4">
                            <label className="flex items-center gap-2 text-sm">
                              <input
                                type="checkbox"
                                checked={editJuradoInicia}
                                onChange={() => setEditJuradoInicia(prev => !prev)}
                                className="w-4 h-4 accent-blue-600"
                              />
                              Inicia automáticamente como jurado
                            </label>
                          </div>
                        )}
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
                          onClick={() => setDeleteConfirmation(entry)}
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
        )
      }
      {showModal && modalUser && (
        <StaffUserInfo
          event={event}
          modalUser={modalUser}
          close={() => {
            setShowModal(false);
            setModalUser(null);
          }}
        />
      )}
      {deleteConfirmation?.user && (
        <DeleteConfirmation
          user={deleteConfirmation.user}
          onCancel={() => setDeleteConfirmation(null)}
          onConfirm={handleDelete}
        />
      )}
      {showJudgeModal && (
        <JudgeConfirmationModal
          isRemoving={isJudgeRemoval}
          onConfirm={() => {
            if (isJudgeRemoval) {
              // Quitar el permiso de judge
              setEditPermissions(prev => prev.filter(p => p !== "judge"));
              setEditJuradoInicia(false); // ✅ también quitar el flag de inicio automático
            } else {
              // Asignar solo "judge" y remover los demás
              setEditPermissions(["judge"]);
              setEditJuradoInicia(false);
            }

            setShowJudgeModal(false);
            setIsJudgeRemoval(false);
            setPreviousPermissions(null);
          }}
          onCancel={() => {
            setShowJudgeModal(false);
            setIsJudgeRemoval(false);
          }}
        />
      )}
    </div >
  )
}

export default StaffList