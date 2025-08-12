import React, { useCallback, useEffect, useState } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { CustomEvent } from '@/app/types/eventType';
import { User } from '@/app/types/userType';
import { AlertCircle, CheckCircle2, Shield, Sparkles, Users } from 'lucide-react';
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      {/* Container principal con efectos visuales */}
      <div className="max-w-6xl mx-auto">

        {/* Hero Section */}
        <div className="relative mb-8">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-20"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-blue-100">
              <Sparkles className="w-8 h-8" />
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Users className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  Gestión de Personal
                </h1>
                <p className="text-gray-600 font-medium">Panel de Control de Permisos</p>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-600">
              <Shield className="w-5 h-5" />
              <span className="text-sm">Asigne personal y administre los permisos para su evento</span>
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Personal Total</p>
                    <p className="text-2xl font-bold text-gray-800">{staffEntries.length}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jueces Activos</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {staffEntries.filter(s => s.permissions.includes('judge')).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <Shield className="w-5 h-5 text-green-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/30">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Jueces que inician</p>
                    <p className="text-2xl font-bold text-gray-800">
                      {staffEntries.filter(s => s.permissions.includes('judge') && s.juradoInicia == true).length}
                    </p>
                  </div>
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Notificaciones mejoradas */}
        {notification && (
          <div className="mb-8 animate-in slide-in-from-top-4 duration-300">
            <div className={`relative overflow-hidden rounded-2xl shadow-lg border-2 ${notification.type === 'success'
                ? 'bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200'
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-200'
              }`}>
              {/* Animated background */}
              <div className={`absolute inset-0 opacity-10 ${notification.type === 'success' ? 'bg-gradient-to-r from-emerald-400 to-green-400' : 'bg-gradient-to-r from-red-400 to-rose-400'
                }`}></div>

              <div className="relative p-4 flex items-center gap-3">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full ${notification.type === 'success' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                  {notification.type === 'success' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  )}
                </div>
                <div>
                  <h3 className={`font-semibold ${notification.type === 'success' ? 'text-emerald-800' : 'text-red-800'
                    }`}>
                    {notification.type === 'success' ? '¡Éxito!' : 'Error'}
                  </h3>
                  <p className={`text-sm ${notification.type === 'success' ? 'text-emerald-700' : 'text-red-700'
                    }`}>
                    {notification.message}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Content sections con mejor espaciado */}
        <div className="space-y-8">
          {/* Sección AddStaff */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30 overflow-hidden">
            <div className="">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6">
                <AddStaff event={event} />
              </div>
            </div>
          </div>

          {/* Sección StaffList */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/30">
            <div className="">
              <div className="bg-white/95 backdrop-blur-sm rounded-xl p-6">
                <StaffList
                  event={event}
                  staffEntries={staffEntries}
                  setStaffEntries={setStaffEntries}
                  showNotification={showNotification}
                  syncFirestore={syncFirestore}
                  deleteConfirmation={deleteConfirmation}
                  setDeleteConfirmation={setDeleteConfirmation}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-white/30">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
                <div>
                  <h3 className="font-semibold text-gray-800">Actualizando permisos...</h3>
                  <p className="text-sm text-gray-600">Por favor espere un momento</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}