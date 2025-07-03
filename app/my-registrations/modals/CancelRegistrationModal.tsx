// app/my-registrations/modals/CancelRegistrationModal.tsx
'use client';

import React, { useState } from 'react';
import { RegistrationItem } from '@/app/hooks/my-registrations/useMyRegistrations';

interface CancelRegistrationModalProps {
  registration: RegistrationItem;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (registrationId: string, reason: string) => Promise<void>;
}

const CancelRegistrationModal: React.FC<CancelRegistrationModalProps> = ({
  registration,
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState('');

  const predefinedReasons = [
    'No podré asistir por motivos personales',
    'Cambio de fechas en mi agenda',
    'Problemas de salud',
    'Inscripción duplicada por error',
    'Cambio de planes',
    'Otro motivo (especificar)'
  ];

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      const finalReason = selectedReason === 'Otro motivo (especificar)' ? reason : selectedReason;
      await onConfirm(registration.id, finalReason);
      onClose();
      setReason('');
      setSelectedReason('');
    } catch (error) {
      console.error('Error al cancelar inscripción:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setReason('');
    setSelectedReason('');
  };

  if (!isOpen) return null;

  const canRefund = registration.status === 'Confirmada' && registration.paymentDate;
  const daysSincePayment = canRefund 
    ? Math.floor((new Date().getTime() - registration.paymentDate!.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold">Cancelar Inscripción</h2>
                <p className="text-red-100 text-sm">Esta acción no se puede deshacer</p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="font-medium text-yellow-800 mb-1">¡Importante!</h4>
                <p className="text-sm text-yellow-700">
                  Al cancelar tu inscripción, perderás tu lugar en el evento. 
                  {canRefund && daysSincePayment <= 7 
                    ? ' Podrás recibir un reembolso parcial según nuestras políticas.'
                    : ' No será posible realizar reembolsos después de la cancelación.'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Información de reembolso */}
          {canRefund && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                Política de Reembolso
              </h4>
              <div className="text-sm text-blue-700 space-y-1">
                {daysSincePayment <= 7 && (
                  <p>✅ Reembolso del 80% (han pasado {daysSincePayment} días desde el pago)</p>
                )}
                {daysSincePayment > 7 && daysSincePayment <= 15 && (
                  <p>⚠️ Reembolso del 50% (han pasado {daysSincePayment} días desde el pago)</p>
                )}
                {daysSincePayment > 15 && (
                  <p>❌ No hay reembolso disponible (han pasado {daysSincePayment} días desde el pago)</p>
                )}
                <p className="text-xs text-blue-600 mt-2">
                  Los reembolsos se procesan en 5-7 días hábiles.
                </p>
              </div>
            </div>
          )}

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
                    className="mt-1 w-4 h-4 text-red-600 border-gray-300 focus:ring-red-500"
                  />
                  <span className="text-sm text-gray-700">{predefinedReason}</span>
                </label>
              ))}
            </div>
            
            {selectedReason === 'Otro motivo (especificar)' && (
              <div className="mt-3">
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Describe el motivo de tu cancelación..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                  rows={3}
                  maxLength={200}
                />
                <p className="text-xs text-gray-500 mt-1">{reason.length}/200 caracteres</p>
              </div>
            )}
          </div>

          {/* Confirmación */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                className="mt-1 w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                required
              />
              <span className="text-sm text-red-700">
                Confirmo que deseo cancelar mi inscripción y entiendo que esta acción es irreversible. 
                He leído y acepto las condiciones de cancelación y reembolso.
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
              disabled={isLoading || !selectedReason || (selectedReason === 'Otro motivo (especificar)' && !reason.trim())}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
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