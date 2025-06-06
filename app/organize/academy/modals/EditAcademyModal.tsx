"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  Upload,
  MapPin,
  Globe,
  Facebook,
  Instagram,
  Youtube,
  Music,
  MessageCircle,
  Twitter,
  Save,
  Loader2
} from "lucide-react";
import { Academy } from "@/app/types/academyType";
import { useEditAcademy } from "@/app/hooks/academy/useEditAcademy";

interface EditAcademyModalProps {
  isOpen: boolean;
  onClose: () => void;
  academy: Academy;
  onSuccess?: () => void;
}

const EditAcademyModal: React.FC<EditAcademyModalProps> = ({
  isOpen,
  onClose,
  academy,
  onSuccess
}) => {
  const { editAcademy, loading } = useEditAcademy();

  // Estados para los campos del formulario
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website: "",
    email: {
      primary: "",
      secondary: ""
    },
    phoneNumber: {
      primary: "",
      secondary: ""
    },
    location: {
      placeName: "",
      street: "",
      district: "",
      province: "",
      department: "",
      coordinates: {
        latitude: "",
        longitude: ""
      }
    },
    socialMedia: {
      facebook: "",
      instagram: "",
      youtube: "",
      tiktok: "",
      whatsapp: "",
      twitter: ""
    }
  });

  const [images, setImages] = useState({
    profileImage: null as File | null,
    coverImage: null as File | null
  });

  const [imagePreviews, setImagePreviews] = useState({
    profileImage: "",
    coverImage: ""
  });

  const profileImageRef = useRef<HTMLInputElement>(null);
  const coverImageRef = useRef<HTMLInputElement>(null);

  // Inicializar el formulario con los datos de la academia
  useEffect(() => {
    if (academy && isOpen) {
      setFormData({
        name: academy.name || "",
        description: academy.description || "",
        website: academy.website || "",
        email: {
          primary: Array.isArray(academy.email) ? academy.email[0] || "" : academy.email || "",
          secondary: Array.isArray(academy.email) ? academy.email[1] || "" : ""
        },
        phoneNumber: {
          primary: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[0] || "" : academy.phoneNumber || "",
          secondary: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[1] || "" : ""
        },
        location: {
          placeName: academy.location?.placeName || "",
          street: academy.location?.street || "",
          district: academy.location?.district || "",
          province: academy.location?.province || "",
          department: academy.location?.department || "",
          coordinates: {
            latitude: academy.location?.coordinates?.latitude || "",
            longitude: academy.location?.coordinates?.longitude || ""
          }
        },
        socialMedia: {
          facebook: academy.socialMedia?.facebook || "",
          instagram: academy.socialMedia?.instagram || "",
          youtube: academy.socialMedia?.youtube || "",
          tiktok: academy.socialMedia?.tiktok || "",
          whatsapp: academy.socialMedia?.whatsapp || "",
          twitter: academy.socialMedia?.twitter || ""
        }
      });

      // Establecer previews de imágenes existentes
      setImagePreviews({
        profileImage: typeof academy.profileImage === 'string' ? academy.profileImage : "",
        coverImage: typeof academy.coverImage === 'string' ? academy.coverImage || "" : ""
      });
    }
  }, [academy, isOpen]);

  const handleInputChange = (
    field: string,
    value: string,
    nestedField?: string,
    subField?: string
  ) => {
    setFormData(prev => {
      const fieldValue = prev[field as keyof typeof prev];

      if (nestedField && subField) {
        return {
          ...prev,
          [field]: {
            ...(fieldValue as Record<string, any>),
            [nestedField]: {
              ...((fieldValue as Record<string, any>)[nestedField] ?? {}),
              [subField]: value
            }
          }
        };
      } else if (nestedField) {
        return {
          ...prev,
          [field]: {
            ...(fieldValue as Record<string, any>),
            [nestedField]: value
          }
        };
      } else {
        return {
          ...prev,
          [field]: value
        };
      }
    });
  };

  const handleImageChange = (type: 'profileImage' | 'coverImage', file: File | null) => {
    if (file) {
      setImages(prev => ({
        ...prev,
        [type]: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => ({
          ...prev,
          [type]: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Preparar los datos para enviar
      const updateData: Partial<Academy> = {
        name: formData.name,
        description: formData.description,
        website: formData.website,
        email: formData.email.secondary
          ? [formData.email.primary, formData.email.secondary]
          : formData.email.primary,
        phoneNumber: formData.phoneNumber.secondary
          ? [formData.phoneNumber.primary, formData.phoneNumber.secondary]
          : formData.phoneNumber.primary,
        location: formData.location,
        socialMedia: formData.socialMedia
      };

      // Agregar imágenes si se seleccionaron nuevas
      if (images.profileImage) {
        updateData.profileImage = images.profileImage;
      }
      if (images.coverImage) {
        updateData.coverImage = images.coverImage;
      }

      await editAcademy(academy.id, updateData);
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error al actualizar la academia:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-800">Editar Perfil de Academia</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Imagen de Portada */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen de Portada
            </label>
            <div
              className="relative h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => coverImageRef.current?.click()}
            >
              {imagePreviews.coverImage ? (
                <img
                  src={imagePreviews.coverImage}
                  alt="Portada"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Upload className="w-8 h-8 text-gray-400" />
                </div>
              )}
            </div>
            <input
              ref={coverImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('coverImage', e.target.files?.[0] || null)}
            />
          </div>

          {/* Imagen de Perfil */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Imagen de Perfil
            </label>
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 bg-gray-100 border-2 border-dashed border-gray-300 rounded-full cursor-pointer hover:bg-gray-50 transition-colors flex items-center justify-center"
                onClick={() => profileImageRef.current?.click()}
              >
                {imagePreviews.profileImage ? (
                  <img
                    src={imagePreviews.profileImage}
                    alt="Perfil"
                    className="w-full h-full object-cover rounded-full"
                  />
                ) : (
                  <Upload className="w-6 h-6 text-gray-400" />
                )}
              </div>
              <button
                type="button"
                onClick={() => profileImageRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Upload className="w-4 h-4" />
                Cambiar Foto
              </button>
            </div>
            <input
              ref={profileImageRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleImageChange('profileImage', e.target.files?.[0] || null)}
            />
          </div>

          {/* Información Básica */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Nombre de la Academia
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Nombre de la academia"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Sitio Web
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://www.tusitio.com"
              />
            </div>
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Describe tu academia..."
            />
          </div>

          {/* Información de Contacto */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Información de Contacto</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Principal
                </label>
                <input
                  type="email"
                  value={formData.email.primary}
                  onChange={(e) => handleInputChange('email', e.target.value, 'primary')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@ejemplo.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Secundario
                </label>
                <input
                  type="email"
                  value={formData.email.secondary}
                  onChange={(e) => handleInputChange('email', e.target.value, 'secondary')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="contacto@ejemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Principal
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber.primary}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value, 'primary')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="953 613 427"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono Secundario
                </label>
                <input
                  type="tel"
                  value={formData.phoneNumber.secondary}
                  onChange={(e) => handleInputChange('phoneNumber', e.target.value, 'secondary')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="01 234 5678"
                />
              </div>
            </div>
          </div>

          {/* Redes Sociales */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Redes Sociales</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  Facebook
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.facebook}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value, 'facebook')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://facebook.com/tusuy.peru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Instagram className="w-4 h-4 text-pink-600" />
                  Instagram
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.instagram}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value, 'instagram')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@tusuy.peru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Youtube className="w-4 h-4 text-red-600" />
                  YouTube
                </label>
                <input
                  type="url"
                  value={formData.socialMedia.youtube}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value, 'youtube')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://youtube.com/@tusuy.peru"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Music className="w-4 h-4 text-gray-800" />
                  TikTok
                </label>
                <input
                  type="text"
                  value={formData.socialMedia.tiktok}
                  onChange={(e) => handleInputChange('socialMedia', e.target.value, 'tiktok')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="@tusuy.peru"
                />
              </div>
            </div>
          </div>

          {/* Ubicación */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-purple-600" />
              Ubicación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Lugar
                </label>
                <input
                  type="text"
                  value={formData.location.placeName}
                  onChange={(e) => handleInputChange('location', e.target.value, 'placeName')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Mangomarca - Urb. Apit"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Dirección
                </label>
                <input
                  type="text"
                  value={formData.location.street}
                  onChange={(e) => handleInputChange('location', e.target.value, 'street')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Av. Santuario Cdra. 24"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Distrito
                </label>
                <input
                  type="text"
                  value={formData.location.district}
                  onChange={(e) => handleInputChange('location', e.target.value, 'district')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="San Juan de Lurigancho"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia
                </label>
                <input
                  type="text"
                  value={formData.location.province}
                  onChange={(e) => handleInputChange('location', e.target.value, 'province')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Lima"
                />
              </div>
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar Cambios
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditAcademyModal;