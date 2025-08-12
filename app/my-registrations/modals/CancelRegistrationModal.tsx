// app/my-registrations/modals/CancelRegistrationModal.tsx
'use client';

import React, { useState } from 'react';
import { doc, updateDoc, Timestamp, getDoc } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import toast from "react-hot-toast";
import { RegistrationItem } from '@/app/hooks/my-registrations/useMyRegistrations';
import { Ticket } from '@/app/types/ticketType';

interface CancelRegistrationModalProps {
  registration: RegistrationItem;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

const CancelRegistrationModal: React.FC<CancelRegistrationModalProps> = ({
  registration,
  isOpen,
  onClose,
  onSuccess,
  userId,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');
  const [confirmCancellation, setConfirmCancellation] = useState(false);

  const predefinedReasons = [
    'Cambio de planes',
    'Problema de salud',
    'Conflicto de horario',
    'Motivos económicos',
    'Duplicado por error',
    'Otro'
  ];

  const handleConfirm = async () => {
    if (isLoading) return; // Prevenir múltiples clics

    setIsLoading(true);

    const loadingToast = toast.loading('Cancelando inscripción...', {
      position: 'top-right',
    });

    try {
      const finalReason = selectedReason === 'Otro' ? reason : selectedReason;

      // Validaciones
      if (!registration.ticketId) {
        throw new Error('No se encontró el ticket asociado');
      }

      if (!finalReason.trim()) {
        throw new Error('Debe especificar un motivo de cancelación');
      }

      // Extraer el índice de la entry del ID generado
      const entryIndexMatch = registration.id.match(/-entry-(\d+)$/);
      if (!entryIndexMatch) {
        throw new Error('No se pudo determinar la entry a cancelar');
      }
      const entryIndex = parseInt(entryIndexMatch[1]);

      // Obtener el ticket completo de Firestore
      const ticketRef = doc(db, "tickets", registration.ticketId);
      const ticketDoc = await getDoc(ticketRef);

      if (!ticketDoc.exists()) {
        throw new Error('Ticket no encontrado en la base de datos');
      }

      const ticketData = ticketDoc.data() as Ticket;

      // Verificar que el índice sea válido
      if (!ticketData.entries || entryIndex >= ticketData.entries.length || entryIndex < 0) {
        throw new Error('Entry no encontrada en el ticket');
      }

      // Verificar que la entry no esté ya cancelada
      if (ticketData.entries[entryIndex].status === 'Anulado') {
        throw new Error('Esta inscripción ya está cancelada');
      }

      // Crear una copia de las entries y marcar la específica como cancelada
      const updatedEntries = [...ticketData.entries];

      // Actualizar la entry específica
      updatedEntries[entryIndex] = {
        ...updatedEntries[entryIndex],
        status: 'Anulado',
        cancelledDate: Timestamp.now(),
        cancellationReason: finalReason,
        cancelledBy: userId
      };

      // Determinar el nuevo status del ticket
      const activesEntries = updatedEntries.filter(entry => entry.status !== 'Anulado');
      const allEntriesCancelled = activesEntries.length === 0;

      let ticketUpdateData: any = {
        entries: updatedEntries,
        updatedAt: Timestamp.now()
      };

      // Si todas las entries están canceladas, cancelar todo el ticket
      if (allEntriesCancelled) {
        ticketUpdateData.status = 'Anulado';
        ticketUpdateData.cancelledDate = Timestamp.now();
        ticketUpdateData.cancellationReason = `Todas las inscripciones canceladas. Última: ${finalReason}`;
        ticketUpdateData.cancelledBy = userId;
      }

      // Actualizar el ticket en Firestore
      await updateDoc(ticketRef, ticketUpdateData);

      // Cerrar el loading toast
      toast.dismiss(loadingToast);

      // Toast de éxito
      toast.success(
        'Inscripción cancelada exitosamente.',
        {
          position: 'top-right',
          duration: 3000,
          style: {
            background: '#10B981',
            color: 'white',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#10B981',
          },
        }
      );

      // Limpiar estados
      setReason('');
      setSelectedReason('');
      setConfirmCancellation(false);

      // Limpiar estados
      setReason('');
      setSelectedReason('');
      setConfirmCancellation(false);

      // Notificar éxito para refrescar la lista inmediatamente
      onSuccess();

      // Cerrar modal después de un pequeño delay para permitir que se actualice la lista
      setTimeout(() => {
        onClose();
      }, 200);

    } catch (error) {
      console.error('Error al cancelar inscripción:', error);

      // Cerrar el loading toast
      toast.dismiss(loadingToast);

      // Toast de error
      toast.error(
        error instanceof Error ? error.message : "Error al cancelar la inscripción. Por favor, intenta de nuevo.",
        {
          position: 'top-right',
          duration: 4000,
          style: {
            background: '#EF4444',
            color: 'white',
            fontWeight: '500',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#EF4444',
          },
        }
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      onClose();
      setReason('');
      setSelectedReason('');
      setConfirmCancellation(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">

        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Cancelar Inscripción</h2>
                <p className="text-orange-100 text-sm">La inscripción pasará a estado "Anulado"</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors disabled:opacity-50"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Información del evento */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="flex items-start space-x-3">
              <div className="w-16 h-16 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                {registration.eventImage ? (
                  <img
                    src={registration.eventImage}
                    alt={registration.eventName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{registration.eventName}</h3>
                <p className="text-sm text-gray-600 mb-2">{registration.category} - {registration.level}</p>
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>📅 {registration.eventDate.toLocaleDateString()}</span>
                  <span>📍 {registration.location}</span>
                  <span>💰 S/ {registration.amount.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Advertencia */}
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-orange-800 mb-1">¡Importante!</h4>
                <p className="text-sm text-orange-700">
                  Al cancelar tu inscripción, perderás tu lugar en el evento y la inscripción
                  será conservada en el sistema para fines de auditoría, pero no será válida para el evento.
                </p>
                <p className="text-sm text-orange-700 mt-2 font-medium">
                  No será posible realizar reembolsos después de la cancelación.
                </p>
              </div>
            </div>
          </div>

          {/* Motivo de cancelación */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Motivo de la cancelación *
            </label>
            <div className="space-y-2">
              {predefinedReasons.map((predefinedReason, index) => (
                <label key={index} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="reason"
                    value={predefinedReason}
                    checked={selectedReason === predefinedReason}
                    onChange={(e) => setSelectedReason(e.target.value)}
                    disabled={isLoading}
                    className="mt-1 w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500 disabled:opacity-50"
                  />
                  <span className="text-sm text-gray-700">{predefinedReason}</span>
                </label>
              ))}
            </div>

            {selectedReason === 'Otro' && (
              <div className="mt-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe el motivo de tu cancelación..."
                  disabled={isLoading}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none disabled:opacity-50"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{reason.length}/200 caracteres</p>
              </div>
            )}
          </div>

          {/* Confirmación */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmCancellation}
                onChange={(e) => setConfirmCancellation(e.target.checked)}
                disabled={isLoading}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500 disabled:opacity-50"
              />
              <span className="text-sm text-gray-700">
                Confirmo que entiendo que esta acción anulará mi inscripción permanentemente
                y que no será posible realizar reembolsos. Si deseo participar en el evento,
                deberé crear una nueva inscripción.
              </span>
            </label>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-2xl">
          <div className="flex justify-end space-x-3">
            <button
              onClick={handleClose}
              disabled={isLoading}
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Mantener Inscripción
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading || !selectedReason || (selectedReason === 'Otro' && !reason.trim()) || !confirmCancellation}
              className={`px-6 py-2 rounded-lg transition-colors flex items-center space-x-2 ${!selectedReason || (selectedReason === 'Otro' && !reason.trim()) || !confirmCancellation
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-50'
                }`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Cancelando...</span>
                </>
              ) : (
                <span>Confirmar Cancelación</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancelRegistrationModal;