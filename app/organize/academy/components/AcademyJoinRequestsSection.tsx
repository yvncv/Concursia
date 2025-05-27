import React, { useState } from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  User, 
  Calendar, 
  MessageCircle,
  AlertCircle,
  Mail,
  MapPin,
  Trophy
} from 'lucide-react';
import { useAcademyJoinRequestsForOrganizer } from '@/app/hooks/academy/useAcademyJoinRequestsForOrganizer';
import { useManageAcademyJoinRequest } from '@/app/hooks/academy/useManageAcademyJoinRequest';
import { AcademyJoinRequest } from '@/app/types/academyJoinRequestType';
import { User as UserType } from '@/app/types/userType';

interface AcademyJoinRequestsSectionProps {
  academyId: string;
  academyName: string;
  users: UserType[];
}

export default function AcademyJoinRequestsSection({ 
  academyId, 
  academyName, 
  users 
}: AcademyJoinRequestsSectionProps) {
  console.log("🔍 ACADEMY JOIN REQUESTS SECTION:");
  console.log("- academyId recibido:", academyId);
  console.log("- academyName:", academyName);
  console.log("- users count:", users.length);
  
  const { 
    pendingRequests, 
    processedRequests, 
    loading: loadingRequests,
    error: requestsError
  } = useAcademyJoinRequestsForOrganizer(academyId);
  
  const { 
    acceptRequest, 
    rejectRequest, 
    loading: processingRequest, 
    error 
  } = useManageAcademyJoinRequest();

  console.log("📊 ESTADO DE SOLICITUDES:");
  console.log("- pendingRequests:", pendingRequests);
  console.log("- processedRequests:", processedRequests);
  console.log("- loadingRequests:", loadingRequests);
  console.log("- requestsError:", requestsError);

  const [activeTab, setActiveTab] = useState<'pending' | 'processed'>('pending');
  const [processingRequestId, setProcessingRequestId] = useState<string | null>(null);

  const handleAcceptRequest = async (request: AcademyJoinRequest) => {
    if (!request.id) return;
    
    setProcessingRequestId(request.id);
    try {
      await acceptRequest(request.id, request.userId, academyId, academyName);
    } catch (err) {
      console.error('Error accepting request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const handleRejectRequest = async (request: AcademyJoinRequest) => {
    if (!request.id) return;
    
    setProcessingRequestId(request.id);
    try {
      await rejectRequest(request.id);
    } catch (err) {
      console.error('Error rejecting request:', err);
    } finally {
      setProcessingRequestId(null);
    }
  };

  const getUserInfo = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const RequestCard = ({ request }: { request: AcademyJoinRequest }) => {
    const userInfo = getUserInfo(request.userId);
    const isProcessing = processingRequestId === request.id;

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
              {userInfo ? (
                `${userInfo.firstName?.charAt(0) || ''}${userInfo.lastName?.charAt(0) || ''}`
              ) : (
                <User className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {userInfo ? `${userInfo.firstName} ${userInfo.lastName}` : 'Usuario no encontrado'}
              </h3>
              <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                <div className="flex items-center space-x-1">
                  <Calendar className="w-4 h-4" />
                  <span>{formatDate(request.requestDate)}</span>
                </div>
                {request.status === 'pending' && (
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <span className="text-yellow-600 font-medium">Pendiente</span>
                  </div>
                )}
                {request.status === 'accepted' && (
                  <div className="flex items-center space-x-1">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    <span className="text-green-600 font-medium">Aceptada</span>
                  </div>
                )}
                {request.status === 'rejected' && (
                  <div className="flex items-center space-x-1">
                    <XCircle className="w-4 h-4 text-red-500" />
                    <span className="text-red-600 font-medium">Rechazada</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Información del usuario */}
        {userInfo && (
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-700">{userInfo.email.join(', ')}</span>
              </div>
              {userInfo.location && (
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {userInfo.location.district}, {userInfo.location.department}
                  </span>
                </div>
              )}
              {userInfo.marinera?.participant?.category && (
                <div className="flex items-center space-x-2">
                  <Trophy className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-700">
                    {userInfo.marinera.participant.category} - {userInfo.marinera.participant.level}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Mensaje de la solicitud */}
        {request.message && (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <div className="flex items-start space-x-2">
              <MessageCircle className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-900 mb-1">Mensaje del solicitante:</p>
                <p className="text-sm text-blue-800">{request.message}</p>
              </div>
            </div>
          </div>
        )}

        {/* Botones de acción para solicitudes pendientes */}
        {request.status === 'pending' && (
          <div className="flex space-x-3">
            <button
              onClick={() => handleAcceptRequest(request)}
              disabled={isProcessing || processingRequest}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Aceptar</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleRejectRequest(request)}
              disabled={isProcessing || processingRequest}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white rounded-lg transition-colors"
            >
              {isProcessing ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <XCircle className="w-4 h-4" />
                  <span>Rechazar</span>
                </>
              )}
            </button>
          </div>
        )}

        {/* Fecha de respuesta para solicitudes procesadas */}
        {request.status !== 'pending' && request.responseDate && (
          <div className="text-xs text-gray-500 mt-3">
            Respondido el {formatDate(request.responseDate)}
          </div>
        )}
      </div>
    );
  };

  if (loadingRequests) {
    return (
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100">
      {/* Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Solicitudes de Afiliación</h2>
              <p className="text-sm text-gray-600">Gestiona las solicitudes para unirse a tu academia</p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab('pending')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'pending'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Pendientes ({pendingRequests.length})
            </button>
            <button
              onClick={() => setActiveTab('processed')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'processed'
                  ? 'bg-orange-100 text-orange-700'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              Procesadas ({processedRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mx-6 mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-600">{error.message}</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6">
        {activeTab === 'pending' ? (
          pendingRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay solicitudes pendientes</h3>
              <p className="text-gray-600">Las nuevas solicitudes aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )
        ) : (
          processedRequests.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-800 mb-2">No hay solicitudes procesadas</h3>
              <p className="text-gray-600">Las solicitudes aceptadas o rechazadas aparecerán aquí.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {processedRequests.map((request) => (
                <RequestCard key={request.id} request={request} />
              ))}
            </div>
          )
        )}
      </div>
    </div>
  );
}