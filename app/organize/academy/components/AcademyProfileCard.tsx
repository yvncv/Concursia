"use client";

import React from "react";
import { 
  Facebook, 
  Instagram, 
  MessageCircle, 
  Music, 
  Mail, 
  Phone, 
  MapPin, 
  Globe, 
  Edit3,
  Building2,
  Youtube,
  Twitter,
  ExternalLink
} from "lucide-react";
import { Academy } from "@/app/types/academyType";
import { User as UserType } from "@/app/types/userType";

type Props = {
  academy: Academy;
  organizer?: UserType;
  onEdit?: () => void;
};

const AcademyProfileCard: React.FC<Props> = ({ academy, organizer, onEdit }) => {
  // Función para obtener la URL de la imagen
  const getImageUrl = (image: string | File | undefined) => {
    if (!image) return null;
    if (typeof image === 'string') return image;
    return URL.createObjectURL(image);
  };

  // Función para ir al perfil público
  const handleViewPublicProfile = () => {
    window.open(`/academy/${academy.id}`, '_blank');
  };

  const coverImageUrl = getImageUrl(academy.coverImage);
  const profileImageUrl = getImageUrl(academy.profileImage);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header con gradiente */}
      <div className="relative">
        {/* Imagen de portada o gradiente por defecto */}
        <div className="h-24 sm:h-32 bg-gradient-to-br from-blue-500 via-purple-600 to-indigo-700 relative">
          {coverImageUrl && (
            <img 
              src={coverImageUrl} 
              alt="Portada de academia"
              className="w-full h-full object-cover"
            />
          )}
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          
          {/* Botón de editar */}
          {onEdit && (
            <button
              onClick={onEdit}
              className="absolute top-2 sm:top-4 right-2 sm:right-4 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 p-1.5 sm:p-2 rounded-lg transition-all duration-200 hover:bg-white"
            >
              <Edit3 className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          )}
        </div>

        {/* Avatar de la academia */}
        <div className="absolute -bottom-6 sm:-bottom-8 left-4 sm:left-6">
          <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white p-0.5 sm:p-1 shadow-lg">
            {profileImageUrl ? (
              <img 
                src={profileImageUrl} 
                alt={academy.name}
                className="w-full h-full rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg sm:text-xl font-bold">
                {academy.name?.charAt(0) || "A"}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="pt-8 sm:pt-12 p-4 sm:p-6">
        {/* Título y descripción */}
        <div className="mb-4 sm:mb-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2 gap-2 sm:gap-0">
            <h3 className="text-lg sm:text-xl font-bold text-gray-800 leading-tight">
              {academy.name}
            </h3>
            <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded-full self-start">
              <Building2 className="w-3 h-3" />
              Academia
            </div>
          </div>
          <p className="text-gray-600 text-sm leading-relaxed">
            {academy.description || "Academia especializada en danzas folklóricas peruanas"}
          </p>
        </div>

        {/* Información de contacto */}
        <div className="space-y-3 mb-4 sm:mb-6">
          {/* Email */}
          {academy.email && (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs font-medium mb-1">Email</p>
                <p className="text-gray-800 truncate text-sm">
                  {Array.isArray(academy.email) ? academy.email.join(", ") : academy.email}
                </p>
              </div>
            </div>
          )}

          {/* Teléfono */}
          {academy.phoneNumber && (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Phone className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs font-medium mb-1">Teléfono</p>
                <p className="text-gray-800 text-sm">
                  {Array.isArray(academy.phoneNumber) ? academy.phoneNumber.join(", ") : academy.phoneNumber}
                </p>
              </div>
            </div>
          )}

          {/* Ubicación */}
          {academy.location && (
            <div className="flex items-start gap-2 sm:gap-3 text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <MapPin className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs font-medium mb-1">Ubicación</p>
                <p className="text-gray-800 leading-relaxed text-sm">
                  {academy.location.placeName && (
                    <span className="font-medium">{academy.location.placeName}<br /></span>
                  )}
                  {academy.location.street}, {academy.location.district}<br />
                  {academy.location.province}, {academy.location.department}
                </p>
              </div>
            </div>
          )}

          {/* Website */}
          {academy.website && (
            <div className="flex items-center gap-2 sm:gap-3 text-sm">
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-indigo-50 rounded-lg flex items-center justify-center flex-shrink-0">
                <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-gray-500 text-xs font-medium mb-1">Sitio web</p>
                <a 
                  href={academy.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 hover:underline truncate block text-sm"
                >
                  {academy.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Redes sociales */}
        {academy.socialMedia && Object.values(academy.socialMedia).some(link => link) && (
          <div className="mb-4 sm:mb-6">
            <p className="text-sm font-semibold text-gray-700 mb-3">Redes Sociales</p>
            <div className="flex flex-wrap gap-2">
              {academy.socialMedia.facebook && (
                <a 
                  href={academy.socialMedia.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 hover:bg-blue-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <Facebook className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {academy.socialMedia.instagram && (
                <a 
                  href={academy.socialMedia.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-pink-50 hover:bg-pink-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <Instagram className="w-4 h-4 sm:w-5 sm:h-5 text-pink-600 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {academy.socialMedia.whatsapp && (
                <a 
                  href={`https://wa.me/${academy.socialMedia.whatsapp.replace(/\D/g, '')}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 hover:bg-green-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {academy.socialMedia.tiktok && (
                <a 
                  href={academy.socialMedia.tiktok} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-gray-50 hover:bg-gray-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <Music className="w-4 h-4 sm:w-5 sm:h-5 text-gray-800 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {academy.socialMedia.youtube && (
                <a 
                  href={academy.socialMedia.youtube} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-red-50 hover:bg-red-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <Youtube className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
              {academy.socialMedia.twitter && (
                <a 
                  href={academy.socialMedia.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-8 h-8 sm:w-10 sm:h-10 bg-sky-50 hover:bg-sky-100 rounded-lg flex items-center justify-center transition-colors duration-200 group"
                >
                  <Twitter className="w-4 h-4 sm:w-5 sm:h-5 text-sky-600 group-hover:scale-110 transition-transform duration-200" />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Información del organizador */}
        {organizer && (
          <div className="mb-4 sm:mb-6 pt-4 border-t border-gray-100">
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-purple-600" />
              Organizador
            </p>
            <div className="flex items-center gap-3 mb-3">
              {/* Avatar del organizador */}
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs sm:text-sm font-bold flex-shrink-0">
                {organizer.firstName?.charAt(0)}{organizer.lastName?.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-gray-800 text-sm">
                  {organizer.firstName} {organizer.lastName}
                </p>
                <p className="text-xs text-purple-600 font-medium">Administrador Principal</p>
              </div>
            </div>
            
            {/* Contacto del organizador */}
            <div className="space-y-2">
              {organizer.email && organizer.email.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 truncate text-xs sm:text-sm">{organizer.email[0]}</span>
                </div>
              )}
              {organizer.phoneNumber && organizer.phoneNumber.length > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-3 h-3 text-gray-400 flex-shrink-0" />
                  <span className="text-gray-600 text-xs sm:text-sm">{organizer.phoneNumber[0]}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button 
            onClick={handleViewPublicProfile}
            className="flex items-center justify-center gap-1 sm:gap-2 text-gray-600 hover:text-gray-800 border border-gray-300 hover:border-gray-400 text-xs sm:text-sm py-2 px-3 rounded-lg transition-colors duration-200 flex-1 sm:flex-none"
          >
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">Ver Público</span>
            <span className="sm:hidden">Público</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AcademyProfileCard;