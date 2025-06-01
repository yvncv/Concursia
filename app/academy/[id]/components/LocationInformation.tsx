import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Academy } from '@/app/types/academyType';
import { MapPin, Navigation, Home, Building, Globe } from 'lucide-react';

interface Props {
  academy: Academy;
  canEdit: boolean;
}

const LocationInformation: React.FC<Props> = ({ academy, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [locationInfo, setLocationInfo] = useState({
    street: academy.location?.street || '',
    district: academy.location?.district || '',
    province: academy.location?.province || '',
    department: academy.location?.department || '',
    placeName: academy.location?.placeName || '',
    latitude: academy.location?.coordinates?.latitude || '',
    longitude: academy.location?.coordinates?.longitude || ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setLocationInfo({
      street: academy.location?.street || '',
      district: academy.location?.district || '',
      province: academy.location?.province || '',
      department: academy.location?.department || '',
      placeName: academy.location?.placeName || '',
      latitude: academy.location?.coordinates?.latitude || '',
      longitude: academy.location?.coordinates?.longitude || ''
    });
  }, [academy]);

  useEffect(() => {
    if (!canEdit) {
      setHasChanges(false);
      return;
    }

    const changed =
      locationInfo.street !== (academy.location?.street || '') ||
      locationInfo.district !== (academy.location?.district || '') ||
      locationInfo.province !== (academy.location?.province || '') ||
      locationInfo.department !== (academy.location?.department || '') ||
      locationInfo.placeName !== (academy.location?.placeName || '') ||
      locationInfo.latitude !== (academy.location?.coordinates?.latitude || '') ||
      locationInfo.longitude !== (academy.location?.coordinates?.longitude || '');
    
    setHasChanges(changed);
  }, [locationInfo, academy, canEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLocationInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!academy.id) return;
    
    try {
      const academyRef = doc(db, 'academies', academy.id);
      await updateDoc(academyRef, {
        location: {
          street: locationInfo.street,
          district: locationInfo.district,
          province: locationInfo.province,
          department: locationInfo.department,
          placeName: locationInfo.placeName,
          coordinates: {
            latitude: locationInfo.latitude,
            longitude: locationInfo.longitude
          }
        },
        updatedAt: new Date()
      });
      
      setIsEditing(false);
      setHasChanges(false);
      alert('Información de ubicación actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      alert('Error al guardar cambios');
    }
  };

  const handleCancel = () => {
    setLocationInfo({
      street: academy.location?.street || '',
      district: academy.location?.district || '',
      province: academy.location?.province || '',
      department: academy.location?.department || '',
      placeName: academy.location?.placeName || '',
      latitude: academy.location?.coordinates?.latitude || '',
      longitude: academy.location?.coordinates?.longitude || ''
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const capitalize = (text: string) => {
    if (!text) return '';
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  const getGoogleMapsUrl = () => {
    if (locationInfo.latitude && locationInfo.longitude) {
      return `https://www.google.com/maps?q=${locationInfo.latitude},${locationInfo.longitude}`;
    }
    const address = [
      locationInfo.street,
      locationInfo.district,
      locationInfo.province,
      locationInfo.department
    ].filter(Boolean).join(', ');
    
    return address ? `https://www.google.com/maps/search/${encodeURIComponent(address)}` : '';
  };

  const locationFields = [
    {
      name: 'placeName',
      label: 'Nombre del Local',
      icon: Building,
      value: locationInfo.placeName,
      placeholder: 'Academia de Danza Marinera',
      color: 'blue',
      colSpan: 'md:col-span-2'
    },
    {
      name: 'street',
      label: 'Dirección',
      icon: Home,
      value: locationInfo.street,
      placeholder: 'Av. Principal 123',
      color: 'green',
      colSpan: 'md:col-span-2'
    },
    {
      name: 'district',
      label: 'Distrito',
      icon: MapPin,
      value: locationInfo.district,
      placeholder: 'Trujillo',
      color: 'purple'
    },
    {
      name: 'province',
      label: 'Provincia',
      icon: Navigation,
      value: locationInfo.province,
      placeholder: 'Trujillo',
      color: 'orange'
    },
    {
      name: 'department',
      label: 'Departamento',
      icon: Globe,
      value: locationInfo.department,
      placeholder: 'La Libertad',
      color: 'red'
    },
    {
      name: 'latitude',
      label: 'Latitud',
      icon: Navigation,
      value: locationInfo.latitude,
      placeholder: '-8.1116',
      color: 'indigo'
    },
    {
      name: 'longitude',
      label: 'Longitud',
      icon: Navigation,
      value: locationInfo.longitude,
      placeholder: '-79.0287',
      color: 'indigo'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-100 text-blue-700',
      green: 'bg-green-50 border-green-100 text-green-700',
      purple: 'bg-purple-50 border-purple-100 text-purple-700',
      orange: 'bg-orange-50 border-orange-100 text-orange-700',
      red: 'bg-red-50 border-red-100 text-red-700',
      indigo: 'bg-indigo-50 border-indigo-100 text-indigo-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-purple-500 after:-bottom-2">
          Ubicación
        </h2>
        <div className="flex items-center space-x-3">
          <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-medium">
            {canEdit ? (isEditing ? 'Editando' : 'Editable') : 'Solo Lectura'}
          </span>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Privacy notice for visitors */}
      {!canEdit && (
        <div className="mb-6 p-3 bg-purple-50 border border-purple-200 rounded-lg">
          <div className="flex items-center">
            <MapPin className="h-5 w-5 text-purple-600 mr-2" />
            <span className="text-sm text-purple-800">Información de ubicación pública de la academia</span>
          </div>
        </div>
      )}

      {/* Map Preview */}
      {(locationInfo.latitude && locationInfo.longitude) && (
        <div className="mb-6 h-48 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
          <iframe
            src={`https://www.google.com/maps/embed/v1/place?key=YOUR_API_KEY&q=${locationInfo.latitude},${locationInfo.longitude}`}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="grayscale hover:grayscale-0 transition-all duration-300"
          />
        </div>
      )}

      {/* Location Fields Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {locationFields.map((field) => (
          <div key={field.name} className={`group ${field.colSpan || ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full inline-block mr-2"></span>
              {field.label}
            </label>

            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <field.icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  name={field.name}
                  value={field.value}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-300 focus:border-purple-400 transition-all outline-none"
                />
              </div>
            ) : (
              <div className={`rounded-xl p-4 border transition-all group-hover:shadow-sm ${
                field.value ? getColorClasses(field.color) : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center">
                  <field.icon className={`w-5 h-5 mr-3 ${
                    field.value ? 'text-current' : 'text-gray-400'
                  }`} />
                  <div className="flex-1">
                    {field.value ? (
                      <p className="font-medium">{capitalize(field.value)}</p>
                    ) : (
                      <p className="text-gray-500 font-medium">No especificado</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Full Address Summary */}
      {!isEditing && (locationInfo.street || locationInfo.district) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
          <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
            <MapPin className="w-4 h-4 mr-2 text-purple-600" />
            Dirección Completa
          </h4>
          <p className="text-gray-800 font-medium">
            {[
              locationInfo.placeName,
              locationInfo.street,
              capitalize(locationInfo.district),
              capitalize(locationInfo.province),
              capitalize(locationInfo.department)
            ].filter(Boolean).join(', ')}
          </p>
        </div>
      )}

      {/* Location Actions - Solo para visitantes */}
      {!canEdit && getGoogleMapsUrl() && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-3">
            <a
              href={getGoogleMapsUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ver en Google Maps
            </a>
            {(locationInfo.latitude && locationInfo.longitude) && (
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${locationInfo.latitude}, ${locationInfo.longitude}`);
                  alert('Coordenadas copiadas al portapapeles');
                }}
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Navigation className="w-4 h-4 mr-2" />
                Copiar Coordenadas
              </button>
            )}
          </div>
        </div>
      )}

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
                ? 'bg-purple-600 hover:bg-purple-700'
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

export default LocationInformation;