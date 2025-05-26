import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/app/firebase/config';
import { Academy } from '@/app/types/academyType';
import { Mail, Phone, Globe, MessageCircle, Facebook, Instagram, Youtube } from 'lucide-react';

interface Props {
  academy: Academy;
  canEdit: boolean;
}

const ContactInformation: React.FC<Props> = ({ academy, canEdit }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [contactInfo, setContactInfo] = useState({
    email: Array.isArray(academy.email) ? academy.email[0] || '' : academy.email || '',
    emailSecondary: Array.isArray(academy.email) ? academy.email[1] || '' : '',
    phoneNumber: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[0] || '' : academy.phoneNumber || '',
    phoneSecondary: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[1] || '' : '',
    website: academy.website || '',
    facebook: academy.socialMedia?.facebook || '',
    instagram: academy.socialMedia?.instagram || '',
    tiktok: academy.socialMedia?.tiktok || '',
    youtube: academy.socialMedia?.youtube || '',
    whatsapp: academy.socialMedia?.whatsapp || '',
    twitter: academy.socialMedia?.twitter || ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    setContactInfo({
      email: Array.isArray(academy.email) ? academy.email[0] || '' : academy.email || '',
      emailSecondary: Array.isArray(academy.email) ? academy.email[1] || '' : '',
      phoneNumber: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[0] || '' : academy.phoneNumber || '',
      phoneSecondary: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[1] || '' : '',
      website: academy.website || '',
      facebook: academy.socialMedia?.facebook || '',
      instagram: academy.socialMedia?.instagram || '',
      tiktok: academy.socialMedia?.tiktok || '',
      youtube: academy.socialMedia?.youtube || '',
      whatsapp: academy.socialMedia?.whatsapp || '',
      twitter: academy.socialMedia?.twitter || ''
    });
  }, [academy]);

  useEffect(() => {
    if (!canEdit) {
      setHasChanges(false);
      return;
    }

    const primaryEmail = Array.isArray(academy.email) ? academy.email[0] || '' : academy.email || '';
    const secondaryEmail = Array.isArray(academy.email) ? academy.email[1] || '' : '';
    const primaryPhone = Array.isArray(academy.phoneNumber) ? academy.phoneNumber[0] || '' : academy.phoneNumber || '';
    const secondaryPhone = Array.isArray(academy.phoneNumber) ? academy.phoneNumber[1] || '' : '';

    const changed =
      contactInfo.email !== primaryEmail ||
      contactInfo.emailSecondary !== secondaryEmail ||
      contactInfo.phoneNumber !== primaryPhone ||
      contactInfo.phoneSecondary !== secondaryPhone ||
      contactInfo.website !== (academy.website || '') ||
      contactInfo.facebook !== (academy.socialMedia?.facebook || '') ||
      contactInfo.instagram !== (academy.socialMedia?.instagram || '') ||
      contactInfo.tiktok !== (academy.socialMedia?.tiktok || '') ||
      contactInfo.youtube !== (academy.socialMedia?.youtube || '') ||
      contactInfo.whatsapp !== (academy.socialMedia?.whatsapp || '') ||
      contactInfo.twitter !== (academy.socialMedia?.twitter || '');
    
    setHasChanges(changed);
  }, [contactInfo, academy, canEdit]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    if (!academy.id) return;
    
    try {
      const academyRef = doc(db, 'academies', academy.id);
      await updateDoc(academyRef, {
        email: [contactInfo.email, contactInfo.emailSecondary].filter(Boolean),
        phoneNumber: [contactInfo.phoneNumber, contactInfo.phoneSecondary].filter(Boolean),
        website: contactInfo.website,
        socialMedia: {
          facebook: contactInfo.facebook,
          instagram: contactInfo.instagram,
          tiktok: contactInfo.tiktok,
          youtube: contactInfo.youtube,
          whatsapp: contactInfo.whatsapp,
          twitter: contactInfo.twitter
        },
        updatedAt: new Date()
      });
      
      setIsEditing(false);
      setHasChanges(false);
      alert('Información de contacto actualizada exitosamente');
    } catch (error) {
      console.error('Error al actualizar contacto:', error);
      alert('Error al guardar cambios');
    }
  };

  const handleCancel = () => {
    setContactInfo({
      email: Array.isArray(academy.email) ? academy.email[0] || '' : academy.email || '',
      emailSecondary: Array.isArray(academy.email) ? academy.email[1] || '' : '',
      phoneNumber: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[0] || '' : academy.phoneNumber || '',
      phoneSecondary: Array.isArray(academy.phoneNumber) ? academy.phoneNumber[1] || '' : '',
      website: academy.website || '',
      facebook: academy.socialMedia?.facebook || '',
      instagram: academy.socialMedia?.instagram || '',
      tiktok: academy.socialMedia?.tiktok || '',
      youtube: academy.socialMedia?.youtube || '',
      whatsapp: academy.socialMedia?.whatsapp || '',
      twitter: academy.socialMedia?.twitter || ''
    });
    setIsEditing(false);
    setHasChanges(false);
  };

  const contactFields = [
    {
      name: 'email',
      label: 'Correo Principal',
      type: 'email',
      icon: Mail,
      value: contactInfo.email,
      placeholder: 'correo@academia.com',
      color: 'blue'
    },
    {
      name: 'emailSecondary',
      label: 'Correo Secundario',
      type: 'email',
      icon: Mail,
      value: contactInfo.emailSecondary,
      placeholder: 'contacto@academia.com',
      color: 'blue'
    },
    {
      name: 'phoneNumber',
      label: 'Teléfono Principal',
      type: 'tel',
      icon: Phone,
      value: contactInfo.phoneNumber,
      placeholder: '+51 999 999 999',
      color: 'green'
    },
    {
      name: 'phoneSecondary',
      label: 'Teléfono Secundario',
      type: 'tel',
      icon: Phone,
      value: contactInfo.phoneSecondary,
      placeholder: '+51 888 888 888',
      color: 'green'
    },
    {
      name: 'website',
      label: 'Sitio Web',
      type: 'url',
      icon: Globe,
      value: contactInfo.website,
      placeholder: 'https://academia.com',
      color: 'purple'
    }
  ];

  const socialMediaFields = [
    {
      name: 'facebook',
      label: 'Facebook',
      type: 'url',
      icon: Facebook,
      value: contactInfo.facebook,
      placeholder: 'https://facebook.com/academia',
      color: 'blue'
    },
    {
      name: 'instagram',
      label: 'Instagram',
      type: 'text',
      icon: Instagram,
      value: contactInfo.instagram,
      placeholder: '@academia_marinera',
      color: 'pink'
    },
    {
      name: 'tiktok',
      label: 'TikTok',
      type: 'text',
      icon: MessageCircle,
      value: contactInfo.tiktok,
      placeholder: '@academia_marinera',
      color: 'gray'
    },
    {
      name: 'youtube',
      label: 'YouTube',
      type: 'url',
      icon: Youtube,
      value: contactInfo.youtube,
      placeholder: 'https://youtube.com/@academia',
      color: 'red'
    },
    {
      name: 'whatsapp',
      label: 'WhatsApp',
      type: 'tel',
      icon: Phone,
      value: contactInfo.whatsapp,
      placeholder: '+51 999 999 999',
      color: 'green'
    },
    {
      name: 'twitter',
      label: 'Twitter/X',
      type: 'text',
      icon: MessageCircle,
      value: contactInfo.twitter,
      placeholder: '@academia_marinera',
      color: 'blue'
    }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-100 text-blue-700',
      green: 'bg-green-50 border-green-100 text-green-700',
      purple: 'bg-purple-50 border-purple-100 text-purple-700',
      pink: 'bg-pink-50 border-pink-100 text-pink-700',
      red: 'bg-red-50 border-red-100 text-red-700',
      gray: 'bg-gray-50 border-gray-100 text-gray-700'
    };
    return colors[color] || colors.blue;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-green-500 after:-bottom-2">
          Información de Contacto
        </h2>
        <div className="flex items-center space-x-3">
          <span className="bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-medium">
            {canEdit ? (isEditing ? 'Editando' : 'Editable') : 'Solo Lectura'}
          </span>
          {canEdit && !isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      {/* Privacy notice for visitors */}
      {!canEdit && (
        <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-green-600 mr-2" />
            <span className="text-sm text-green-800">Información de contacto pública de la academia</span>
          </div>
        </div>
      )}

      {/* Contact Fields Grid - Información básica */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {contactFields.map((field) => (
          <div key={field.name} className="group">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
              <span className="w-2 h-2 bg-gray-400 rounded-full inline-block mr-2"></span>
              {field.label}
              {!canEdit && field.value && (
                <span className="ml-2 text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                  Público
                </span>
              )}
            </label>

            {isEditing ? (
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <field.icon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={field.type}
                  name={field.name}
                  value={field.value}
                  onChange={handleInputChange}
                  placeholder={field.placeholder}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-300 focus:border-green-400 transition-all outline-none"
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
                      <>
                        <p className="font-medium">{field.value}</p>
                        {field.name.includes('email') && field.value && (
                          <a 
                            href={`mailto:${field.value}`}
                            className="text-xs text-current opacity-75 hover:opacity-100 transition-opacity"
                          >
                            Enviar correo
                          </a>
                        )}
                        {field.name.includes('phone') && field.value && (
                          <a 
                            href={`tel:${field.value.replace(/\s/g, '')}`}
                            className="text-xs text-current opacity-75 hover:opacity-100 transition-opacity"
                          >
                            Llamar
                          </a>
                        )}
                        {field.name === 'website' && field.value && (
                          <a 
                            href={field.value.startsWith('http') ? field.value : `https://${field.value}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-current opacity-75 hover:opacity-100 transition-opacity"
                          >
                            Visitar sitio
                          </a>
                        )}
                      </>
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

      {/* Social Media Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
          Redes Sociales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialMediaFields.map((field) => (
            <div key={field.name} className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full inline-block mr-2"></span>
                {field.label}
              </label>

              {isEditing ? (
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <field.icon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type={field.type}
                    name={field.name}
                    value={field.value}
                    onChange={handleInputChange}
                    placeholder={field.placeholder}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-300 focus:border-pink-400 transition-all outline-none text-sm"
                  />
                </div>
              ) : (
                <div className={`rounded-lg p-3 border transition-all group-hover:shadow-sm ${
                  field.value ? getColorClasses(field.color) : 'bg-gray-50 border-gray-100'
                }`}>
                  <div className="flex items-center">
                    <field.icon className={`w-4 h-4 mr-2 ${
                      field.value ? 'text-current' : 'text-gray-400'
                    }`} />
                    <div className="flex-1">
                      {field.value ? (
                        <p className="font-medium text-sm">{field.value}</p>
                      ) : (
                        <p className="text-gray-500 font-medium text-sm">No configurado</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Contact Actions - Solo para visitantes */}
      {!canEdit && (contactInfo.email || contactInfo.phoneNumber || contactInfo.facebook || contactInfo.instagram) && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Contacto Rápido</h4>
          <div className="flex flex-wrap gap-3">
            {contactInfo.email && (
              <a
                href={`mailto:${contactInfo.email}`}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Mail className="w-4 h-4 mr-2" />
                Email
              </a>
            )}
            {contactInfo.phoneNumber && (
              <a
                href={`tel:${contactInfo.phoneNumber.replace(/\s/g, '')}`}
                className="inline-flex items-center px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                <Phone className="w-4 h-4 mr-2" />
                Llamar
              </a>
            )}
            {contactInfo.whatsapp && (
              <a
                href={`https://wa.me/${contactInfo.whatsapp.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-colors text-sm"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                WhatsApp
              </a>
            )}
            {contactInfo.website && (
              <a
                href={contactInfo.website.startsWith('http') ? contactInfo.website : `https://${contactInfo.website}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Globe className="w-4 h-4 mr-2" />
                Sitio Web
              </a>
            )}
            {contactInfo.facebook && (
              <a
                href={contactInfo.facebook.startsWith('http') ? contactInfo.facebook : `https://facebook.com/${contactInfo.facebook.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg transition-colors text-sm"
              >
                <Facebook className="w-4 h-4 mr-1" />
                Facebook
              </a>
            )}
            {contactInfo.instagram && (
              <a
                href={`https://instagram.com/${contactInfo.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors text-sm"
              >
                <Instagram className="w-4 h-4 mr-1" />
                Instagram
              </a>
            )}
            {contactInfo.youtube && (
              <a
                href={contactInfo.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors text-sm"
              >
                <Youtube className="w-4 h-4 mr-1" />
                YouTube
              </a>
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

export default ContactInformation;