import React, { useCallback, useEffect, useState } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import AddStaff from './StaffModules/AddStaff';
import StaffList from './StaffModules/StaffList';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';

interface StaffEntry {
  userId: string;
  permissions: string[];
  user?: User;
  juradoInicia?: boolean;
}

interface EventStaffProps {
  event: CustomEvent;
}

export default function EventStaff({ event }: EventStaffProps) {
  const { users } = useUsers();

  const [staffEntries, setStaffEntries] = useState<StaffEntry[]>([]);
  const [deleteConfirmation, setDeleteConfirmation] = useState<StaffEntry | null>(null);
  const [loading, setLoading] = useState(false);
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
      const payload = updated.map(({ userId, permissions, juradoInicia }) => ({
        userId,
        permissions,
        juradoInicia: juradoInicia ?? false,
      }));
      await updateDoc(ref, { staff: payload });

      // Leer nuevamente el evento desde Firestore
      const snap = await getDoc(ref);
      const freshData = snap.data() as CustomEvent;

      // Enriquecer otra vez pero con lo recién guardado
      const enriched = (freshData.staff || []).map(s => {
        const user = users.find(u => u.id === s.userId);
        return {
          userId: s.userId,
          permissions: s.permissions || [],
          juradoInicia: s.juradoInicia ?? false,
          user,
        };
      });
      setStaffEntries(enriched);

      showNotification('success', 'Permisos actualizados correctamente');
    } catch (err) {
      console.error(err);
      showNotification('error', 'Error actualizando permisos');
    }
    setLoading(false);
  }, [event.id, users, showNotification]);

  return (
    <>
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
      </div>

      {/* Componente para agregar staff */}
      <AddStaff event={event} />

      <StaffList
        event={event}
        staffEntries={staffEntries}
        setStaffEntries={setStaffEntries}
        showNotification={showNotification}
        syncFirestore={syncFirestore}
        deleteConfirmation={deleteConfirmation}
        setDeleteConfirmation={setDeleteConfirmation}
      />
    </>
  );
}