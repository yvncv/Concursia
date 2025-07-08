import React, { useState } from 'react';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import {
  Search, Edit, Trash2,
  Save, XCircle, Eye, AlertCircle
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
  deleteConfirmation: StaffEntry | null;
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
    const isJudge = perm === 'judge';
    const hasJudge = editPermissions.includes('judge');

    // 👉 Si se está editando el permiso de jurado
    if (isJudge) {
      const isCurrentlyJudge = hasJudge;

      if (!isCurrentlyJudge) {
        // Verificar si ya se alcanzó el máximo de jurados
        const maxJudges = event?.dance?.levels?.Seriado?.config?.judgesCount || 0;
        const currentJudgeCount = staffEntries.filter(e =>
          e.permissions.includes('judge') && e.userId !== editingUserId
        ).length;

        if (currentJudgeCount >= maxJudges) {
          showNotification('error', `Ya se alcanzó el máximo de ${maxJudges} jurados permitidos.`);
          return;
        }

        if (editPermissions.length > 0) {
          // Tiene otros permisos → confirmar que se eliminarán al asignar "judge"
          setPreviousPermissions([...editPermissions]);
          setIsJudgeRemoval(false); // no estamos quitando, sino agregando
          setShowJudgeModal(true);
        } else {
          // No tiene otros permisos, se asigna directamente
          setEditPermissions(['judge']);
        }
      } else {
        // Está quitando el permiso de jurado → confirmar
        setIsJudgeRemoval(true);
        setShowJudgeModal(true);
      }

      return;
    }

    // 👉 Si el usuario ya es jurado, no puede tener otros permisos
    if (hasJudge) {
      showNotification('error', 'Los jurados no pueden tener otros roles. Debe quitar el rol de jurado primero.');
      return;
    }

    // 👉 Alternar permisos normales
    setEditPermissions(prev =>
      prev.includes(perm) ? prev.filter(p => p !== perm) : [...prev, perm]
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
    <div className="space-y-6">
      {/* Header con búsqueda mejorada */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h3 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
            Personal Actual
          </h3>
          <p className="text-gray-600 text-sm mt-1">
            {staffEntries.length} {staffEntries.length === 1 ? 'miembro' : 'miembros'} del personal
          </p>
        </div>

        {staffEntries.length > 0 && (
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar personal..."
              value={filter}
              onChange={e => setFilter(e.target.value)}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm"
            />
          </div>
        )}
      </div>

      {/* Estados vacíos mejorados */}
      {staffEntries.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-blue-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">No hay personal asignado</h4>
            <p className="text-gray-600">Comience agregando miembros del personal a este evento.</p>
          </div>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-8 h-8 text-orange-600" />
            </div>
            <h4 className="text-lg font-semibold text-gray-800 mb-2">Sin resultados</h4>
            <p className="text-gray-600">
              No se encontraron resultados para <span className="font-medium text-gray-800">"{filter}"</span>
            </p>
          </div>
        </div>
      ) : (
        /* Lista de personal mejorada */
        <div className="space-y-4">
          {filteredStaff.map(entry => (
            <div key={entry.userId} className="group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl blur opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
                <div className="relative bg-white/80 backdrop-blur-sm border border-white/30 rounded-2xl p-6 hover:shadow-lg transition-all duration-300">

                  {editingUserId === entry.userId ? (
                    /* Modo edición mejorado */
                    <div className="space-y-6">
                      {/* Header de edición */}
                      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                            <Edit className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h4 className="text-lg font-semibold text-gray-800">
                              {entry.user?.firstName} {entry.user?.lastName}
                            </h4>
                            <p className="text-sm text-gray-600">Editando permisos</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={saveEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl text-sm font-medium hover:from-green-600 hover:to-emerald-600 transition-all duration-200 shadow-lg hover:shadow-green-200"
                          >
                            <Save size={16} />
                            Guardar
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                          >
                            <XCircle size={16} />
                            Cancelar
                          </button>
                        </div>
                      </div>

                      {/* Alerta informativa para jurado */}
                      {editPermissions.includes('judge') && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
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
                      {editPermissions.includes('judge') && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                          <label className="flex items-center gap-3 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={editJuradoInicia}
                              onChange={() => setEditJuradoInicia(prev => !prev)}
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
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {SECTIONS.map(sec => {
                          const isJudgeRole = sec.id === 'judge';
                          const isCurrentlyJudge = editPermissions.includes('judge');
                          const isSelected = editPermissions.includes(sec.id);
                          const isDisabled = !isJudgeRole && isCurrentlyJudge;

                          return (
                            <div
                              key={sec.id}
                              className={`relative overflow-hidden rounded-xl border-2 transition-all duration-200 ${isDisabled
                                  ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? isJudgeRole
                                      ? 'border-amber-300 bg-gradient-to-br from-amber-50 to-amber-100 shadow-md cursor-pointer'
                                      : 'border-blue-300 bg-gradient-to-br from-blue-50 to-blue-100 shadow-md cursor-pointer'
                                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm cursor-pointer'
                                }`}
                              onClick={() => !isDisabled && toggleEditPermission(sec.id)}
                            >
                              <div className="p-4">
                                <div className="flex items-start gap-3">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    disabled={isDisabled}
                                    onChange={() => !isDisabled && toggleEditPermission(sec.id)}
                                    className={`w-5 h-5 rounded mt-0.5 ${isJudgeRole ? 'accent-amber-600' : 'accent-blue-600'
                                      } ${isDisabled ? 'cursor-not-allowed' : ''}`}
                                    id={`edit-${entry.userId}-${sec.id}`}
                                  />
                                  <div className="flex-1 min-w-0">
                                    <label
                                      htmlFor={`edit-${entry.userId}-${sec.id}`}
                                      className={`block text-sm font-medium mb-1 ${isDisabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-800 cursor-pointer'
                                        }`}
                                    >
                                      {sec.name}
                                      {isJudgeRole && (
                                        <span className="ml-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                          Exclusivo
                                        </span>
                                      )}
                                    </label>
                                    <p className={`text-xs line-clamp-2 ${isDisabled ? 'text-gray-400' : 'text-gray-600'
                                      }`}>
                                      {sec.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                              {isSelected && (
                                <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${isJudgeRole ? 'bg-amber-500' : 'bg-blue-500'
                                  }`}></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    /* Modo visualización mejorado */
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-semibold text-lg">
                            {entry.user?.firstName?.charAt(0)}{entry.user?.lastName?.charAt(0)}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-semibold text-gray-800">
                            {entry.user?.firstName} {entry.user?.lastName}
                          </h4>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {entry.permissions.map(pid => {
                              const isJudgeRole = pid === 'judge';
                              return (
                                <span
                                  key={pid}
                                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${isJudgeRole
                                      ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
                                      : 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-700 border-blue-200'
                                    }`}
                                >
                                  {SECTIONS.find(s => s.id === pid)?.name || pid}
                                  {isJudgeRole && (
                                    <span className="ml-1 text-xs">⭐</span>
                                  )}
                                </span>
                              );
                            })}
                            {entry.juradoInicia && (
                              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-green-50 to-emerald-50 text-green-700 border border-green-200">
                                Auto-jurado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openUserModal(entry.user)}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 transition-all duration-200"
                          title="Ver información de usuario"
                        >
                          <Eye size={16} />
                          Ver
                        </button>
                        <button
                          onClick={() => startEdit(entry)}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-all duration-200"
                          title="Editar permisos"
                        >
                          <Edit size={16} />
                          Editar
                        </button>
                        <button
                          onClick={() => setDeleteConfirmation(entry)}
                          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-all duration-200"
                          title="Eliminar del personal"
                        >
                          <Trash2 size={16} />
                          Eliminar
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modales */}
      {showModal && modalUser && (
        <div className='fixed inset-0 bg-black/50 flex items-center justify-center z-60'>
          <StaffUserInfo
            event={event}
            modalUser={modalUser}
            close={() => {
              setShowModal(false);
              setModalUser(null);
            }}
          />
        </div>
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
              // Quitar rol de jurado - restaurar permisos anteriores si existen
              setEditPermissions(previousPermissions || []);
              setEditJuradoInicia(false);
            } else {
              // Asignar rol de jurado - remover todos los otros permisos
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
            setPreviousPermissions(null);
          }}
        />
      )}
    </div>
  );
}

export default StaffList;