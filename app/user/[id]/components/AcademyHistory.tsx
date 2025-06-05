import React from 'react';
import { GraduationCap, Calendar, MapPin, Clock, User, AlertCircle } from 'lucide-react';
import { useAcademyHistory } from '@/app/hooks/academy/useAcademyHistory'; // Ajusta la ruta según tu estructura

interface AcademyHistoryProps {
  userId?: string;
}

export default function AcademyHistory({ userId }: AcademyHistoryProps) {
  const { academyHistory, loading, error, totalAcademies, totalYears } = useAcademyHistory(userId);

  if (!userId) return null;

  const formatDateRange = (joinedAt: Date, leftAt?: Date) => {
    const formatDate = (date: Date) => {
      return date.toLocaleDateString('es-ES', { 
        month: 'short', 
        year: 'numeric' 
      });
    };

    const start = formatDate(joinedAt);
    const end = leftAt ? formatDate(leftAt) : 'Presente';
    
    return `${start} - ${end}`;
  };

  const calculateDuration = (joinedAt: Date, leftAt?: Date) => {
    const endDate = leftAt || new Date();
    const diffTime = Math.abs(endDate.getTime() - joinedAt.getTime());
    const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44));
    
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'mes' : 'meses'}`;
    } else {
      const years = Math.floor(diffMonths / 12);
      const remainingMonths = diffMonths % 12;
      
      if (remainingMonths === 0) {
        return `${years} ${years === 1 ? 'año' : 'años'}`;
      } else {
        return `${years}a ${remainingMonths}m`;
      }
    }
  };

  const getStatusIcon = (record: any) => {
    if (record.isActive) {
      return <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />;
    } else if (record.removedBy) {
      return <AlertCircle className="w-3 h-3 text-red-500" />;
    } else {
      return <div className="w-3 h-3 bg-gray-400 rounded-full" />;
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
          Trayectoria
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
        <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
          <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
          Trayectoria
        </h3>
        <div className="text-center py-8">
          <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-2" />
          <p className="text-gray-500 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <GraduationCap className="w-5 h-5 mr-2 text-gray-600" />
        Trayectoria
      </h3>

      {academyHistory.length === 0 ? (
        <div className="text-center py-8">
          <GraduationCap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">Aún no hay historial de academias</p>
        </div>
      ) : (
        <>
          {/* Timeline de academias */}
          <div className="space-y-4 mb-6">
            {academyHistory.map((record, index) => {
              
              return (
                <div key={record.id} className="relative">
                  {/* Línea de conexión */}
                  {index < academyHistory.length - 1 && (
                    <div className="absolute left-6 top-12 w-0.5 h-8 bg-gray-200"></div>
                  )}
                  
                  <div className="flex items-start space-x-4">
                    {/* Punto de timeline */}
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-50 rounded-full border-2 border-gray-200 flex items-center justify-center">
                      {getStatusIcon(record)}
                    </div>
                    
                    {/* Contenido */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-medium text-gray-900 truncate">
                          {record.academyName}
                        </h4>
                      </div>
                      
                      <div className="flex items-center text-xs text-gray-500 space-x-3">
                        <span className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          {formatDateRange(record.joinedAt, record.leftAt)}
                        </span>
                        <span className="flex items-center">
                          <Clock className="w-3 h-3 mr-1" />
                          {calculateDuration(record.joinedAt, record.leftAt)}
                        </span>
                      </div>
                      
                      {/* Mostrar motivo de salida si existe */}
                      {record.reason && !record.isActive && (
                        <p className="text-xs text-gray-400 mt-1 italic">
                          {record.removedBy ? 'Removido' : 'Motivo'}: {record.reason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Estadísticas resumidas */}
          <div className="border-t border-gray-200 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-blue-600">{totalAcademies}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {totalAcademies === 1 ? 'Academia' : 'Academias'}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1">
                  <span className="text-2xl font-bold text-green-600">{totalYears}</span>
                </div>
                <p className="text-xs text-gray-500">
                  {totalYears === 1 ? 'Año' : 'Años'}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}