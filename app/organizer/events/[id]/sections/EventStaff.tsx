// EventStaff.tsx

import React, { useEffect, useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import InfoUser from '@/app/ui/info-user/InfoUser';
import { X } from 'lucide-react';

const STAFF_TYPES = ['inscripciones', 'entradas', 'evento', 'tunel'];

interface StaffEntry {
  userId: string;
  userStaffType: string[];
  user?: User;
}

interface EventStaffProps {
  event: CustomEvent;
}

export default function EventStaff({ event }: EventStaffProps) {
  const { users } = useUsers();

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);
  const [dniInput, setDniInput] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editType, setEditType] = useState('');
  const [editTypes, setEditTypes] = useState<string[]>([]);
  const [multipleTypeMode, setMultipleTypeMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalUser, setModalUser] = useState<User | null>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null);
  const [showMultipleConfirm, setShowMultipleConfirm] = useState(false);

  useEffect(() => {
    const enriched = (event.staff || []).map((s) => {
      const user = users.find((u) => u.id === s.userId);
      return { userId: s.userId, userStaffType: [...s.userStaffType], user };
    });
    setStaffEntries(enriched);
  }, [event, users]);

  const syncFirestore = async (updatedStaff: StaffEntry[]) => {
    setLoading(true);
    try {
      const ref = doc(db, 'eventos', event.id);
      const payload = updatedStaff.map(({ userId, userStaffType }) => ({ userId, userStaffType }));
      await updateDoc(ref, { staff: payload });
    } catch (err) {
      console.error(err);
      alert('Error actualizando staff');
    }
    setLoading(false);
  };

  const handleAdd = async () => {
    if (!dniInput.trim() || !selectedType) return;
    const user = users.find((u) => u.dni === dniInput.trim());
    if (!user) return alert('Usuario no encontrado');
    const exists = staffEntries.find((e) => e.userId === user.id);
    let updated: StaffEntry[];
    if (exists) {
      const updatedTypes = Array.from(new Set([...exists.userStaffType, selectedType]));
      updated = staffEntries.map((e) => e.userId === user.id ? { userId: e.userId, userStaffType: updatedTypes, user: e.user } : e);
    } else {
      updated = [...staffEntries, { userId: user.id, userStaffType: [selectedType], user }];
    }
    setStaffEntries(updated);
    setDniInput(''); setSelectedType('');
    await syncFirestore(updated);
  };

  const startEdit = (entry: StaffEntry) => { 
    setEditingUserId(entry.userId);
    if (entry.userStaffType.length > 0) {
      setEditType(entry.userStaffType[0]); 
    } else {
      setEditType('');
    }
    setEditTypes([...entry.userStaffType]);
    
    // Si tiene más de un tipo, preguntar si desea editar en modo múltiple
    if (entry.userStaffType.length > 1) {
      setShowMultipleConfirm(true);
    }
  };
  
  const saveEdit = async () => {
    if (!editingUserId) return;
    
    let updatedTypes: string[];
    if (multipleTypeMode) {
      updatedTypes = [...editTypes];
    } else {
      updatedTypes = editType ? [editType] : [];
    }
    
    const updated = staffEntries.map((e) => 
      e.userId === editingUserId ? { ...e, userStaffType: updatedTypes } : e
    );
    
    setStaffEntries(updated);
    setEditingUserId(null);
    setEditType('');
    setEditTypes([]);
    setMultipleTypeMode(false);
    await syncFirestore(updated);
  };
  
  const cancelEdit = () => { 
    setEditingUserId(null); 
    setEditType('');
    setEditTypes([]);
    setMultipleTypeMode(false);
    setShowMultipleConfirm(false);
  };
  
  const enableMultipleMode = () => {
    setMultipleTypeMode(true);
    setShowMultipleConfirm(false);
  };
  
  const disableMultipleMode = () => {
    setMultipleTypeMode(false);
    setShowMultipleConfirm(false);
  };
  
  const toggleStaffType = (type: string) => {
    if (editTypes.includes(type)) {
      setEditTypes(editTypes.filter(t => t !== type));
    } else {
      setEditTypes([...editTypes, type]);
    }
  };
  
  const openDeleteConfirmation = (userId: string) => {
    setDeleteConfirmation(userId);
  };
  
  const closeDeleteConfirmation = () => {
    setDeleteConfirmation(null);
  };
  
  const handleRemove = async (userId: string) => {
    const updated = staffEntries.filter((e) => e.userId !== userId);
    setStaffEntries(updated);
    await syncFirestore(updated);
    closeDeleteConfirmation();
  };

  const openUserModal = (user: User | undefined) => {
    if (!user) return;
    setModalUser(user);
    setShowModal(true);
  };

  const closeUserModal = () => {
    setShowModal(false);
    setTimeout(() => setModalUser(null), 300); // Cleanup after animation
  };

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white rounded-lg shadow-lg border border-gray-100">
      <h2 className="text-2xl font-semibold mb-6 text-gray-800 border-b pb-4">Asignar Staff</h2>

      <div className="bg-blue-50 p-5 rounded-lg mb-8 border border-blue-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="DNI del usuario" 
            value={dniInput} 
            onChange={(e) => setDniInput(e.target.value)} 
            className="border rounded-lg px-4 py-3 flex-1 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm" 
          />
          <select 
            value={selectedType} 
            onChange={(e) => setSelectedType(e.target.value)} 
            className="border rounded-lg px-4 py-3 flex-1 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
          >
            <option value="">Selecciona tipo de staff</option>
            {STAFF_TYPES.map((type) => (
              <option key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </option>
            ))}
          </select>
          <button 
            onClick={handleAdd} 
            disabled={loading} 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 font-medium shadow-sm"
          >
            {loading ? 'Procesando...' : 'Asignar'}
          </button>
        </div>
      </div>

      <h3 className="text-xl font-medium mb-4 text-gray-700 flex items-center">
        <div className="mr-2 w-1 h-6 bg-blue-500 rounded"></div>
        Staff Actual
      </h3>
      {staffEntries.length === 0 ? (
        <div className="text-gray-500 italic p-10 text-center border border-dashed rounded-lg">
          No hay personal asignado todavía
        </div>
      ) : (
        <ul className="divide-y border rounded-lg overflow-hidden shadow-sm">
          {staffEntries.map((entry) => (
            <li key={entry.userId} className="py-4 px-4 flex flex-col sm:flex-row sm:items-center justify-between hover:bg-gray-50 transition-colors">
              <div>
                <p className="font-medium text-gray-800 text-lg">{entry.user?.firstName} {entry.user?.lastName}</p>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium">Roles:</span>{' '}
                  {entry.userStaffType.length > 0
                    ? entry.userStaffType.map(type => 
                      type.charAt(0).toUpperCase() + type.slice(1)
                    ).join(', ')
                    : 'Sin rol asignado'
                  }
                </p>
              </div>
              <div className="mt-3 sm:mt-0 flex items-center gap-3">
                {/* Ver Información */}
                <button 
                  onClick={() => openUserModal(entry.user)} 
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium bg-indigo-50 px-3 py-1 rounded-md transition-colors hover:bg-indigo-100"
                >
                  Ver Info
                </button>
                {/* Editar */}
                {editingUserId === entry.userId ? (
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                    {multipleTypeMode ? (
                      <div className="flex flex-wrap gap-2 border rounded-lg p-3 bg-gray-50 min-w-64">
                        <h4 className="w-full text-sm font-medium mb-2 text-gray-700">Seleccione los tipos:</h4>
                        {STAFF_TYPES.map((type) => (
                          <div key={type} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`type-${type}-${entry.userId}`}
                              checked={editTypes.includes(type)}
                              onChange={() => toggleStaffType(type)}
                              className="mr-2 h-4 w-4"
                            />
                            <label 
                              htmlFor={`type-${type}-${entry.userId}`}
                              className="text-sm cursor-pointer select-none"
                            >
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <select 
                        value={editType} 
                        onChange={(e) => setEditType(e.target.value)} 
                        className="border rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none min-w-48"
                      >
                        <option value="">Selecciona tipo de staff</option>
                        {STAFF_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type.charAt(0).toUpperCase() + type.slice(1)}
                          </option>
                        ))}
                      </select>
                    )}
                    <div className="flex gap-2 mt-2 sm:mt-0">
                      <button 
                        onClick={saveEdit} 
                        className="bg-green-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-green-700"
                      >
                        Guardar
                      </button>
                      <button 
                        onClick={cancelEdit} 
                        className="bg-gray-200 text-gray-700 px-3 py-2 rounded text-sm font-medium hover:bg-gray-300"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button 
                      onClick={() => startEdit(entry)} 
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium bg-blue-50 px-3 py-1 rounded-md transition-colors hover:bg-blue-100"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => openDeleteConfirmation(entry.userId)} 
                      className="text-red-600 hover:text-red-800 text-sm font-medium bg-red-50 px-3 py-1 rounded-md transition-colors hover:bg-red-100"
                    >
                      Eliminar
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal de información */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full max-h-screen overflow-auto animate-fade-in">
            <div className="flex justify-between items-center p-4 border-b bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800">Información del Staff</h3>
              <button 
                onClick={closeUserModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none hover:bg-gray-200 p-1 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              {modalUser && <InfoUser users={modalUser} title="" />}
            </div>
            <div className="border-t p-4 flex justify-end bg-gray-50">
              <button 
                onClick={closeUserModal}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para consultar sobre edición múltiple */}
      {showMultipleConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-fade-in">
            <div className="p-6 border-b bg-blue-50">
              <div className="flex items-center mb-4">
                <div className="bg-blue-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Tipo de edición</h3>
              </div>
              <p className="text-gray-600 mb-6">
                Este miembro tiene múltiples roles asignados. ¿Desea editar todos los roles a la vez o asignar un solo tipo?
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={disableMultipleMode}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Un solo tipo
                </button>
                <button 
                  onClick={enableMultipleMode}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Editar todos
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md animate-fade-in">
            <div className="p-6 border-b bg-red-50">
              <div className="flex items-center mb-4">
                <div className="bg-red-100 p-2 rounded-full mr-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-800">Confirmar eliminación</h3>
              </div>
              <p className="text-gray-600 mb-6">
                ¿Estás seguro de que deseas eliminar a este miembro del staff? Esta acción no se puede deshacer.
              </p>
              <div className="flex justify-end gap-3">
                <button 
                  onClick={closeDeleteConfirmation}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition font-medium"
                >
                  Cancelar
                </button>
                <button 
                  onClick={() => handleRemove(deleteConfirmation)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
}