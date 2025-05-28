import React, { useState } from 'react';
import { X, Send, UserPlus, Clock, CheckCircle, XCircle, AlertCircle, UserMinus } from 'lucide-react';
import { useCreateAcademyJoinRequest } from '@/app/hooks/academy/useCreateAcademyJoinRequest';
import { useAcademyJoinRequests } from '@/app/hooks/academy/useAcademyJoinRequests';
import { useAcademyMembershipManagement } from '@/app/hooks/academy/useAcademyMembershipManagement';

interface AcademyJoinRequestButtonProps {
  academyId: string;
  academyName: string;
  userId?: string;
  userAlreadyHasAcademy?: boolean;
  userCurrentAcademyId?: string; // ID de la academia actual del usuario
}

export default function AcademyJoinRequestButton({ 
  academyId, 
  academyName, 
  userId, 
  userAlreadyHasAcademy = false,
  userCurrentAcademyId
}: AcademyJoinRequestButtonProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [leaveReason, setLeaveReason] = useState('');
  
  const { createRequest, loading, success, error } = useCreateAcademyJoinRequest();
  const { hasRequestForAcademy, loading: loadingRequests } = useAcademyJoinRequests(userId);
  const { leaveAcademy, loading: leavingAcademy, error: leaveError } = useAcademyMembershipManagement();
  
  // Verificar si ya existe una solicitud pendiente para esta academia
  const existingRequest = hasRequestForAcademy(academyId);
  
  // Verificar si el usuario está afiliado a ESTA academia específica
  const isAffiliatedToThisAcademy = userCurrentAcademyId === academyId;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    try {
      await createRequest(userId, academyId, message.trim());
      setMessage('');
      setTimeout(() => {
        setIsModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error al enviar solicitud:', err);
    }
  };

  const handleLeaveAcademy = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId || !userCurrentAcademyId) return;

    try {
      await leaveAcademy(userId, userCurrentAcademyId, leaveReason.trim() || "Salida voluntaria");
      setLeaveReason('');
      setTimeout(() => {
        setIsLeaveModalOpen(false);
      }, 2000);
    } catch (err) {
      console.error('Error al abandonar academia:', err);
    }
  };

  const getButtonContent = () => {
    if (!userId) {
      return {
        text: 'Inicia sesión para solicitar afiliación',
        icon: <UserPlus className="w-4 h-4" />,
        disabled: true,
        variant: 'secondary' as const,
        action: 'none' as const
      };
    }

    // Si el usuario está afiliado a ESTA academia, mostrar botón de desafiliación
    if (isAffiliatedToThisAcademy) {
      return {
        text: 'Abandonar academia',
        icon: <UserMinus className="w-4 h-4" />,
        disabled: false,
        variant: 'danger' as const,
        action: 'leave' as const
      };
    }

    // Si está afiliado a OTRA academia
    if (userAlreadyHasAcademy) {
      return {
        text: 'Ya perteneces a otra academia',
        icon: <CheckCircle className="w-4 h-4" />,
        disabled: true,
        variant: 'secondary' as const,
        action: 'none' as const
      };
    }

    if (loadingRequests) {
      return {
        text: 'Verificando solicitudes...',
        icon: <Clock className="w-4 h-4 animate-spin" />,
        disabled: true,
        variant: 'secondary' as const,
        action: 'none' as const
      };
    }

    if (existingRequest) {
      switch (existingRequest.status) {
        case 'pending':
          return {
            text: 'Solicitud enviada',
            icon: <Clock className="w-4 h-4" />,
            disabled: true,
            variant: 'pending' as const,
            action: 'none' as const
          };
        case 'accepted':
          return {
            text: 'Solicitud aceptada',
            icon: <CheckCircle className="w-4 h-4" />,
            disabled: true,
            variant: 'success' as const,
            action: 'none' as const
          };
        case 'rejected':
          return {
            text: 'Solicitar nuevamente',
            icon: <UserPlus className="w-4 h-4" />,
            disabled: false,
            variant: 'primary' as const,
            action: 'join' as const
          };
      }
    }

    return {
      text: 'Solicitar afiliación',
      icon: <UserPlus className="w-4 h-4" />,
      disabled: false,
      variant: 'primary' as const,
      action: 'join' as const
    };
  };

  const buttonContent = getButtonContent();

  const getButtonClasses = () => {
    const baseClasses = "flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 shadow-sm";
    
    switch (buttonContent.variant) {
      case 'primary':
        return `${baseClasses} bg-red-600 hover:bg-red-700 text-white hover:shadow-md`;
      case 'secondary':
        return `${baseClasses} bg-gray-100 text-gray-500 cursor-not-allowed`;
      case 'pending':
        return `${baseClasses} bg-yellow-100 text-yellow-700 cursor-not-allowed`;
      case 'success':
        return `${baseClasses} bg-green-100 text-green-700 cursor-not-allowed`;
      case 'danger':
        return `${baseClasses} bg-red-100 text-red-600 hover:bg-red-200 border border-red-300`;
      default:
        return baseClasses;
    }
  };

  const handleButtonClick = () => {
    if (buttonContent.disabled) return;
    
    if (buttonContent.action === 'leave') {
      setIsLeaveModalOpen(true);
    } else if (buttonContent.action === 'join') {
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        disabled={buttonContent.disabled}
        className={getButtonClasses()}
      >
        {buttonContent.icon}
        <span>{buttonContent.text}</span>
      </button>

      {/* Modal de solicitud de afiliación */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Solicitar afiliación
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  Enviarás una solicitud de afiliación a <strong>{academyName}</strong>. 
                  Puedes incluir un mensaje opcional para presentarte.
                </p>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje opcional
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Cuéntanos un poco sobre ti, tu experiencia con la marinera, por qué quieres unirte a esta academia..."
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    maxLength={500}
                    disabled={loading}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/500 caracteres
                  </p>
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{error.message}</p>
                  </div>
                </div>
              )}

              {success && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <p className="text-sm text-green-600">
                      ¡Solicitud enviada exitosamente! La academia revisará tu solicitud.
                    </p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading || success}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : success ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Enviado</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar solicitud</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de abandonar academia */}
      {isLeaveModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Abandonar academia
              </h3>
              <button
                onClick={() => setIsLeaveModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLeaveAcademy} className="p-6">
              <div className="mb-4">
                <p className="text-gray-600 mb-4">
                  ¿Estás seguro de que quieres abandonar <strong>{academyName}</strong>? 
                  Esta acción actualizará tu historial de membresía.
                </p>

                <div>
                  <label htmlFor="leaveReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo (opcional)
                  </label>
                  <textarea
                    id="leaveReason"
                    value={leaveReason}
                    onChange={(e) => setLeaveReason(e.target.value)}
                    placeholder="Puedes compartir el motivo de tu salida..."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                    maxLength={300}
                    disabled={leavingAcademy}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {leaveReason.length}/300 caracteres
                  </p>
                </div>
              </div>

              {leaveError && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-red-500" />
                    <p className="text-sm text-red-600">{leaveError.message}</p>
                  </div>
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={() => setIsLeaveModalOpen(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  disabled={leavingAcademy}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={leavingAcademy}
                  className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
                >
                  {leavingAcademy ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Procesando...</span>
                    </>
                  ) : (
                    <>
                      <UserMinus className="w-4 h-4" />
                      <span>Abandonar academia</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}