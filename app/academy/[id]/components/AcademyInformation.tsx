import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Academy } from '@/app/types/academyType';
import { User } from '@/app/types/userType';
import { Building2, User as UserIcon, Calendar, Award } from 'lucide-react';

interface Props {
  academy: Academy;
  canEdit: boolean;
  organizer?: User;
}

const AcademyInformation: React.FC<Props> = ({ academy, canEdit, organizer }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [academyInfo, setAcademyInfo] = useState({
    name: academy.name || '',
    description: academy.description || ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setAcademyInfo({
      name: academy.name || '',
      description: academy.description || ''
    });
  }, [academy]);

  useEffect(() => {
    const changed = 
      academyInfo.name !== (academy.name || '') ||
      academyInfo.description !== (academy.description || '');
    setHasChanges(changed);
  }, [academyInfo, academy]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAcademyInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!academy.id) return;
    
    try {
      const academyRef = doc(db, 'academies', academy.id);
      await updateDoc(academyRef, {
        name: academyInfo.name,
        description: academyInfo.description,
        updatedAt: new Date()
      });
      
      setIsEditing(false);
      setHasChanges(false);
      alert('Información actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar la academia:', error);
      alert('Error al guardar cambios');
    }
  };

  const handleCancel = () => {
    setAcademyInfo({
      name: academy.name || '',
      description: academy.description || ''
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:-bottom-2">
          Información de la Academia
        </h2>
        <div className="flex items-center space-x-3">
          <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
            {canEdit ? (isEditing ? 'Editando' : 'Editable') : 'Solo Lectura'}
          </span>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Privacy notice for visitors */}
      {!canEdit && (
        <div className="mb-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Building2 className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">Información pública de la academia</span>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {/* Academy Name */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
            Nombre de la Academia
          </label>
          {isEditing ? (
            <input
              type="text"
              name="name"
              value={academyInfo.name}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none"
              placeholder="Nombre de la academia"
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center">
                <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                <p className="text-gray-800 font-medium">{academy.name || 'No especificado'}</p>
              </div>
            </div>
          )}
        </div>

        {/* Description */}
        <div className="group">
          <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
            <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
            Descripción
          </label>
          {isEditing ? (
            <textarea
              name="description"
              value={academyInfo.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none resize-none"
              placeholder="Describe tu academia, metodología, experiencia..."
            />
          ) : (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-gray-800 leading-relaxed">
                {academy.description || 'No hay descripción disponible.'}
              </p>
            </div>
          )}
        </div>

        {/* Academy Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Organizer Info */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 border border-blue-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-purple-400 rounded-full inline-block mr-2"></span>
              Organizador
            </label>
            <div className="flex items-center">
              <UserIcon className="w-5 h-5 text-purple-500 mr-3" />
              <div>
                <p className="text-gray-800 font-medium">
                  {organizer ? `${organizer.firstName} ${organizer.lastName}` : 'No especificado'}
                </p>
                {organizer && (
                  <p className="text-sm text-gray-600">{organizer.roleId}</p>
                )}
              </div>
            </div>
          </div>

          {/* Creation Date */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-4 border border-green-100">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-green-400 rounded-full inline-block mr-2"></span>
              Fecha de Creación
            </label>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-green-500 mr-3" />
              <p className="text-gray-800 font-medium">{formatDate(academy.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Specialties */}
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
          <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
            <span className="w-2 h-2 bg-orange-400 rounded-full inline-block mr-2"></span>
            Especialidades
          </label>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm font-medium flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Marinera Norteña
            </span>
            <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Danza Tradicional
            </span>
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium flex items-center">
              <Award className="w-4 h-4 mr-1" />
              Competencias
            </span>
          </div>
        </div>
      </div>

      {/* Edit Controls */}
      {isEditing && (
        <div className="mt-8 flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            onClick={handleCancel}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className={`px-6 py-2 rounded-lg text-white font-medium transition-colors ${
              hasChanges
                ? 'bg-green-600 hover:bg-green-700'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Guardar Cambios
          </button>
        </div>
      )}
    </div>
  );
};

export default AcademyInformation;