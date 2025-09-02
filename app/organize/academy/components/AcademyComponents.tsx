"use client";

import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  TrendingUp, 
  Calendar,
  Clock,
  CheckCircle,
  UserCheck,
  Check,
  X,
  MessageSquare,
  User,
  Mail,
  Phone,
  MapPin,
  UserX,
  Search,
  Grid,
  List,
  Eye,
  AlertTriangle
} from 'lucide-react';

// Importar tus hooks
import { useAcademyJoinRequestsForOrganizer } from "@/app/hooks/academy/useAcademyJoinRequestsForOrganizer";
import { useManageAcademyJoinRequest } from "@/app/hooks/academy/useManageAcademyJoinRequest";
import { User as UserType } from "@/app/types/userType";

// Props interfaces
interface StatsHeaderProps {
  academyName: string;
  totalSolicitudes: number;
  totalAfiliados: number;
}

interface JoinRequestsSectionProps {
  academyId: string;
  academyName: string;
  users: UserType[];
}

interface AffiliatedStudentsSectionProps {
  students: UserType[];
  onRemove: (studentId: string, studentName: string) => void;
  loading?: boolean;
}

interface AcademyTabsProps {
  activeTab: "solicitudes" | "afiliados";
  setActiveTab: (tab: "solicitudes" | "afiliados") => void;
  totalSolicitudes: number;
  totalAfiliados: number;
}

// Función helper para calcular edad
const calculateAge = (birthDate: any) => {
  if (!birthDate) return null;
  
  let date: Date;
  
  // Manejar diferentes tipos de fecha
  if (typeof birthDate === 'object' && 'toDate' in birthDate && typeof birthDate.toDate === 'function') {
    // Es un Timestamp de Firestore
    date = birthDate.toDate();
  } else if (birthDate instanceof Date) {
    // Es un objeto Date
    date = birthDate;
  } else {
    // Intentar crear Date desde string u otro formato
    try {
      date = new Date(birthDate);
      if (isNaN(date.getTime())) return null;
    } catch {
      return null;
    }
  }
  
  const today = new Date();
  const age = today.getFullYear() - date.getFullYear();
  const monthDiff = today.getMonth() - date.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
    return age - 1;
  }
  return age;
};

// Componente: Header con estadísticas
export const AcademyStatsHeader: React.FC<StatsHeaderProps> = ({
  academyName,
  totalSolicitudes,
  totalAfiliados
}) => (
  <div className="mb-6 sm:mb-8">
    <div className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 border border-gray-100">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 sm:mb-6 gap-4 sm:gap-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Gestión de Academia
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">Administra {academyName} y las solicitudes de afiliación</p>
          </div>
        </div>
      </div>

      {/* Stats Cards - Solo 2 ahora */}
      <div className="grid grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 sm:p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-orange-600 text-xs sm:text-sm font-medium mb-2">Solicitudes Pendientes</p>
            <p className="text-2xl sm:text-3xl font-bold text-orange-700">{totalSolicitudes}</p>
          </div>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-20">
            <Clock className="w-8 h-8 sm:w-10 sm:h-10 text-orange-600" />
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6 relative overflow-hidden">
          <div className="relative z-10">
            <p className="text-blue-600 text-xs sm:text-sm font-medium mb-2">Alumnos Afiliados</p>
            <p className="text-2xl sm:text-3xl font-bold text-blue-700">{totalAfiliados}</p>
          </div>
          <div className="absolute top-3 right-3 sm:top-4 sm:right-4 opacity-20">
            <UserCheck className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Componente: Tabs mejorados
export const AcademyTabs: React.FC<AcademyTabsProps> = ({
  activeTab,
  setActiveTab,
  totalSolicitudes,
  totalAfiliados,
}) => {
  return (
    <div className="mb-4 sm:mb-6">
      <div className="bg-gray-100 p-1 rounded-2xl flex flex-col sm:flex-row">
        <button
          onClick={() => setActiveTab("solicitudes")}
          className={`flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 mb-1 sm:mb-0 sm:flex-1 ${
            activeTab === "solicitudes"
              ? "bg-white text-orange-600 shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <div className={`p-1.5 sm:p-2 rounded-lg ${
            activeTab === "solicitudes" ? "bg-orange-100" : "bg-transparent"
          }`}>
            <UserPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm sm:text-base">Solicitudes Pendientes</span>
            <p className="text-xs text-gray-500 hidden sm:block">
              {totalSolicitudes} esperando respuesta
            </p>
          </div>
          {totalSolicitudes > 0 && (
            <div className="bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[20px] text-center">
              {totalSolicitudes}
            </div>
          )}
        </button>

        <button
          onClick={() => setActiveTab("afiliados")}
          className={`flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-8 py-3 sm:py-4 rounded-xl transition-all duration-300 sm:flex-1 ${
            activeTab === "afiliados"
              ? "bg-white text-blue-600 shadow-md"
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          <div className={`p-1.5 sm:p-2 rounded-lg ${
            activeTab === "afiliados" ? "bg-blue-100" : "bg-transparent"
          }`}>
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-sm sm:text-base">Alumnos Afiliados</span>
            <p className="text-xs text-gray-500 hidden sm:block">
              {totalAfiliados} estudiantes activos
            </p>
          </div>
          <div className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold min-w-[20px] text-center">
            {totalAfiliados}
          </div>
        </button>
      </div>
    </div>
  );
};

// Componente: Sección de Solicitudes
export const AcademyJoinRequestsSection: React.FC<JoinRequestsSectionProps> = ({
  academyId,
  academyName,
  users
}) => {
  const { pendingRequests, loading: requestsLoading, error: requestsError } = useAcademyJoinRequestsForOrganizer(academyId);
  const { acceptRequest, rejectRequest, loading: actionLoading, error: actionError } = useManageAcademyJoinRequest();

  const handleApprove = async (requestId: string, userId: string) => {
    try {
      await acceptRequest(requestId, userId, academyId, academyName);
      console.log("✅ Solicitud aprobada exitosamente");
    } catch (error) {
      console.error("❌ Error al aprobar solicitud:", error);
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectRequest(requestId);
      console.log("✅ Solicitud rechazada exitosamente");
    } catch (error) {
      console.error("❌ Error al rechazar solicitud:", error);
    }
  };

  const getUserById = (userId: string) => {
    return users.find(user => user.id === userId);
  };

  if (requestsLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4" />
        <p className="text-gray-600">Cargando solicitudes...</p>
      </div>
    );
  }

  if (requestsError) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle className="w-8 h-8 text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Error al cargar solicitudes</h3>
        <p className="text-red-600 text-sm sm:text-base">{requestsError.message}</p>
      </div>
    );
  }

  if (pendingRequests.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <UserPlus className="w-10 h-10 sm:w-12 sm:h-12 text-orange-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">No hay solicitudes pendientes</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
          Las nuevas solicitudes de afiliación aparecerán aquí cuando los estudiantes envíen sus requests.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
          <h2 className="text-lg font-semibold text-gray-800">Solicitudes de Afiliación</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">{pendingRequests.length} solicitudes</span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="mx-4 sm:mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <p className="text-red-700 font-medium">Error:</p>
          </div>
          <p className="text-red-600 text-sm mt-1">{actionError.message}</p>
        </div>
      )}

      <div className="divide-y divide-gray-100">
        {pendingRequests.map((request) => {
          const user = getUserById(request.userId);
          const age = user?.birthDate ? calculateAge(user.birthDate) : null;

          if (!user) {
            return (
              <div key={request.id} className="p-4 sm:p-6 bg-gray-50">
                <p className="text-gray-500">Usuario no encontrado (ID: {request.userId})</p>
              </div>
            );
          }

          return (
            <div key={request.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mx-auto sm:mx-0">
                  {user.firstName?.charAt(0)}{user.lastName?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-3 sm:gap-0">
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {user.firstName} {user.lastName}
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {user.gender} {age && `• ${age} años`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {user.location?.district}, {user.location?.province}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {(() => {
                            if (!request.requestDate) return 'Fecha no disponible';
                            if (typeof request.requestDate === 'object' && 'toDate' in request.requestDate) {
                              return request.requestDate.toDate().toLocaleDateString('es-PE');
                            }
                            if (request.requestDate instanceof Date) {
                              return request.requestDate.toLocaleDateString('es-PE');
                            }
                            return 'Fecha no disponible';
                          })()}
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-center sm:justify-start">
                      <button 
                        onClick={() => handleApprove(request.id!, request.userId)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
                      >
                        <Check className="w-3 h-3" />
                        Aceptar
                      </button>
                      <button 
                        onClick={() => handleReject(request.id!)}
                        disabled={actionLoading}
                        className="flex items-center gap-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-lg text-sm transition-colors duration-200"
                      >
                        <X className="w-3 h-3" />
                        Rechazar
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
                      <Mail className="w-3 h-3 text-gray-400" />
                      <span className="text-gray-600">{user.email[0]}</span>
                    </div>
                    {user.phoneNumber && user.phoneNumber.length > 0 && (
                      <div className="flex items-center gap-2 text-sm justify-center sm:justify-start">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span className="text-gray-600">{user.phoneNumber[0]}</span>
                      </div>
                    )}
                  </div>

                  {user.marinera?.participant && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {user.marinera.participant.level}
                      </span>
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                        {user.marinera.participant.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {user.marinera.participant.participatedEvents?.length || 0} eventos participados
                      </span>
                    </div>
                  )}

                  {request.message && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-gray-700 italic">"{request.message}"</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Componente: Sección de Estudiantes Afiliados
export const AffiliatedStudentsSection: React.FC<AffiliatedStudentsSectionProps> = ({
  students,
  onRemove,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const filteredStudents = students.filter(student => 
    `${student.firstName} ${student.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.some(email => email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (students.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-12 text-center">
        <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
          <Users className="w-10 h-10 sm:w-12 sm:h-12 text-blue-600" />
        </div>
        <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2 sm:mb-3">No tienes estudiantes afiliados aún</h3>
        <p className="text-gray-600 text-sm sm:text-base mb-6 sm:mb-8 max-w-md mx-auto">
          Cuando aceptes solicitudes, los estudiantes aparecerán en esta sección.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100">
      <div className="p-4 sm:p-6 border-b border-gray-100">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
          <h2 className="text-lg font-semibold text-gray-800">Estudiantes Afiliados</h2>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
            <div className="relative flex-1 sm:flex-none">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar estudiante..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-auto pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="hidden sm:flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded transition-colors duration-200 ${
                  viewMode === 'list' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded transition-colors duration-200 ${
                  viewMode === 'grid' ? 'bg-white shadow-sm text-gray-800' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {filteredStudents.map((student) => {
          const age = student.birthDate ? calculateAge(student.birthDate) : null;
          
          // Manejar la fecha de afiliación de manera más robusta
          let joinedAt: Date;
          if (student.createdAt && typeof student.createdAt === 'object' && 'toDate' in student.createdAt) {
            joinedAt = student.createdAt.toDate();
          } else if (student.createdAt instanceof Date) {
            joinedAt = student.createdAt;
          } else {
            joinedAt = new Date(); // Fallback
          }

          return (
            <div key={student.id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-200">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 mx-auto sm:mx-0">
                  {student.firstName?.charAt(0)}{student.lastName?.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-0">
                    <div className="text-center sm:text-left">
                      <h3 className="text-lg font-semibold text-gray-800">
                        {student.firstName} {student.lastName}
                      </h3>
                      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 text-sm text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-3 h-3 text-green-500" />
                          Afiliado desde {joinedAt.toLocaleDateString('es-PE')}
                        </span>
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {student.gender} {age && `• ${age} años`}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {student.location?.district}
                        </span>
                      </div>
                    </div>

                    <div className="relative">
                      <button 
                        onClick={() => onRemove(student.id, `${student.firstName} ${student.lastName}`)}
                        disabled={loading}
                        className="flex items-center gap-1 text-red-600 hover:text-red-700 disabled:text-gray-400 border border-red-300 hover:border-red-400 disabled:border-gray-300 px-3 py-1.5 rounded-lg text-sm transition-colors duration-200 mx-auto sm:mx-0"
                      >
                        <UserX className="w-3 h-3" />
                        Expulsar
                      </button>
                    </div>
                  </div>

                  {student.marinera?.participant && (
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-3">
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {student.marinera.participant.level}
                      </span>
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {student.marinera.participant.category}
                      </span>
                      <span className="text-xs text-gray-500">
                        {student.marinera.participant.participatedEvents?.length || 0} eventos
                      </span>
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-4 mt-2 text-sm text-gray-600">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {student.email[0]}
                    </span>
                    {student.phoneNumber && student.phoneNumber.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {student.phoneNumber[0]}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredStudents.length === 0 && searchTerm && (
        <div className="p-6 sm:p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">No se encontraron estudiantes</h3>
          <p className="text-gray-600 text-sm sm:text-base">
            No hay estudiantes que coincidan con "{searchTerm}"
          </p>
        </div>
      )}
    </div>
  );
};