import React, { useState, useEffect } from 'react';
import { auth, db } from '@/app/firebase/config';
import useAcademy from "@/app/hooks/useAcademy";
import { doc, updateDoc } from 'firebase/firestore';
import {
  updateEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { User } from '@/app/types/userType';
import { Mail, Phone, Globe, MessageCircle, Facebook, Instagram, Youtube, GraduationCap } from 'lucide-react';

interface Props {
  foundUser: User;
  canEdit: boolean;
}

const ContactInformation: React.FC<Props> = ({ foundUser, canEdit }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const { academy, loadingAcademy } = useAcademy(foundUser?.marinera?.academyId);

  const [contactInfo, setContactInfo] = useState({
    emailSecondary: '',
    phonePrimary: '',
    phoneSecondary: '',
    facebook: '',
    instagram: '',
    tiktok: '',
    youtube: '',
    whatsapp: '',
    twitter: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (foundUser) {
      setContactInfo({
        emailSecondary: foundUser.email[1] || '',
        phonePrimary: foundUser.phoneNumber[0] || '',
        phoneSecondary: foundUser.phoneNumber[1] || '',
        facebook: foundUser.socialMedia?.facebook || '',
        instagram: foundUser.socialMedia?.instagram || '',
        tiktok: foundUser.socialMedia?.tiktok || '',
        youtube: foundUser.socialMedia?.youtube || '',
        whatsapp: foundUser.socialMedia?.whatsapp || '',
        twitter: foundUser.socialMedia?.twitter || ''
      });
    }
  }, [foundUser]);

  useEffect(() => {
    // Solo verificar cambios si el usuario puede editar
    if (!canEdit) {
      setHasChanges(false);
      return;
    }

    const changed =
      contactInfo.emailSecondary !== (foundUser.email[1] || '') ||
      contactInfo.phonePrimary !== (foundUser.phoneNumber[0] || '') ||
      contactInfo.phoneSecondary !== (foundUser.phoneNumber[1] || '') ||
      contactInfo.facebook !== (foundUser.socialMedia?.facebook || '') ||
      contactInfo.instagram !== (foundUser.socialMedia?.instagram || '') ||
      contactInfo.tiktok !== (foundUser.socialMedia?.tiktok || '') ||
      contactInfo.youtube !== (foundUser.socialMedia?.youtube || '') ||
      contactInfo.whatsapp !== (foundUser.socialMedia?.whatsapp || '') ||
      contactInfo.twitter !== (foundUser.socialMedia?.twitter || '');
    setHasChanges(changed);
  }, [contactInfo, foundUser, canEdit]);

  // Handle updating primary email
  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('No hay usuario autenticado');
      return;
    }
    if (!foundUser.id) return;

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Por favor ingrese un correo electrónico válido');
        return;
      }

      const currentEmail = auth.currentUser.email ?? '';
      const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updateEmail(auth.currentUser, newEmail);
      await sendEmailVerification(auth.currentUser);

      const userRef = doc(db, 'users', foundUser.id);
      await updateDoc(userRef, { email: [newEmail, foundUser.email[1] || ''] });

      setIsEmailModalOpen(false);
      setNewEmail('');
      setCurrentPassword('');
      alert('Correo principal actualizado y verificación enviada');
    } catch (error) {
      console.error('Error cambiando email:', error);
      alert('Error actualizando correo');
    }
  };

  // Handle updating all contact info including secondary and social media
  const handleUpdateContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser.id) return;
    try {
      const userRef = doc(db, 'users', foundUser.id);
      const updateData: any = {
        email: [foundUser.email[0], contactInfo.emailSecondary],
        phoneNumber: [contactInfo.phonePrimary, contactInfo.phoneSecondary],
        socialMedia: {
          facebook: contactInfo.facebook,
          instagram: contactInfo.instagram,
          tiktok: contactInfo.tiktok,
          youtube: contactInfo.youtube,
          whatsapp: contactInfo.whatsapp,
          twitter: contactInfo.twitter
        }
      };
      await updateDoc(userRef, updateData);
      setHasChanges(false);
      alert('Datos de contacto actualizados exitosamente');
    } catch (error) {
      console.error('Error al actualizar datos de contacto:', error);
      alert('Error al guardar cambios');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setContactInfo(prev => ({ ...prev, [id]: value }));
  };

  const contactFields = [
    {
      id: 'emailSecondary',
      label: 'Correo Secundario',
      type: 'email',
      icon: Mail,
      placeholder: 'correo.secundario@email.com',
      color: 'blue'
    },
    {
      id: 'phonePrimary',
      label: 'Teléfono Principal',
      type: 'tel',
      icon: Phone,
      placeholder: '+51 999 999 999',
      color: 'green'
    },
    {
      id: 'phoneSecondary',
      label: 'Teléfono Secundario',
      type: 'tel',
      icon: Phone,
      placeholder: '+51 888 888 888',
      color: 'green'
    }
  ];

  const socialMediaFields = [
    {
      id: 'facebook',
      label: 'Facebook',
      type: 'url',
      icon: Facebook,
      placeholder: 'https://facebook.com/usuario',
      color: 'blue'
    },
    {
      id: 'instagram',
      label: 'Instagram',
      type: 'text',
      icon: Instagram,
      placeholder: '@usuario',
      color: 'pink'
    },
    {
      id: 'tiktok',
      label: 'TikTok',
      type: 'text',
      icon: MessageCircle,
      placeholder: '@usuario',
      color: 'gray'
    },
    {
      id: 'youtube',
      label: 'YouTube',
      type: 'url',
      icon: Youtube,
      placeholder: 'https://youtube.com/@usuario',
      color: 'red'
    },
    {
      id: 'whatsapp',
      label: 'WhatsApp',
      type: 'tel',
      icon: Phone,
      placeholder: '+51 999 999 999',
      color: 'green'
    },
    {
      id: 'twitter',
      label: 'Twitter/X',
      type: 'text',
      icon: MessageCircle,
      placeholder: '@usuario',
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
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:-bottom-2">
          Información de Contacto
        </h2>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          {canEdit ? 'Editable' : 'Solo Lectura'}
        </span>
      </div>

      {/* Privacy notice for visitors */}
      {!canEdit && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center">
            <Mail className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm text-blue-800">Información de contacto pública del usuario</span>
          </div>
        </div>
      )}

      {/* Primary Email */}
      <div className="mb-6">
        <label htmlFor="emailPrimary" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
          <span className="w-2 h-2 bg-blue-500 rounded-full inline-block mr-2"></span>
          Correo Principal
        </label>
        <div className="flex items-center">
          <div className="flex-1 relative">
            <input
              id="emailPrimary"
              type="email"
              value={foundUser.email[0]}
              readOnly
              className="w-full px-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 font-medium focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">Verificado</span>
            </div>
          </div>
          {canEdit && (
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="ml-3 px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition-colors shadow-sm flex items-center justify-center min-w-[120px]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Academia Information - Solo lectura */}
      {foundUser.marinera?.academyId && (
        <div className="mb-6 group relative">
          <label className="block text-sm font-medium text-gray-700 flex items-center mb-2">
            <span className="w-2 h-2 bg-purple-500 rounded-full inline-block mr-2"></span>
            Academia
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <GraduationCap className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={loadingAcademy ? 'Cargando...' : academy?.name || 'Academia no encontrada'}
              readOnly
              className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-xl text-gray-800 font-medium cursor-help hover:bg-gray-50 transition-colors"
            />
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">Afiliado</span>
            </div>
            
            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
              <div className="text-center">
                <div className="font-medium">Perteneces a esta academia</div>
                <div className="text-xs text-gray-300 mt-1">
                  Si deseas cambiar, busca la nueva academia y envía una solicitud de afiliación
                </div>
              </div>
              {/* Flecha del tooltip */}
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
      )}

      {/* Email Modal - Solo para usuarios que pueden editar */}
      {canEdit && isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white p-8 rounded-2xl w-96 shadow-xl">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Actualizar Correo Electrónico</h3>
            <div className="w-16 h-1 bg-blue-500 mb-6"></div>
            <form onSubmit={handleChangeEmail}>
              <div className="mb-4">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Contraseña actual</label>
                <input
                  id="password"
                  type="password"
                  placeholder="Ingresa tu contraseña actual"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  className="w-full mb-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none"
                  required
                />
              </div>
              <div className="mb-6">
                <label htmlFor="newEmail" className="block text-sm font-medium text-gray-700 mb-1">Nuevo correo</label>
                <input
                  id="newEmail"
                  type="email"
                  placeholder="Ingresa tu nuovo correo"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full mb-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Recibirás un correo de verificación al completar el cambio.</p>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-5 py-2 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-100 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Contact Fields Grid - Información básica */}
      <div className="space-y-6 mb-8">
        {/* Correo Secundario - Ancho completo */}
        <div className="transition-all duration-200 hover:translate-y-[-2px]">
          <label htmlFor="emailSecondary" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
            <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
            Correo Secundario
            {!canEdit && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
            <input
              id="emailSecondary"
              type="email"
              value={contactInfo.emailSecondary || ''}
              onChange={canEdit ? handleInputChange : undefined}
              disabled={!canEdit}
              placeholder={canEdit ? 'correo.secundario@email.com' : 'No disponible'}
              className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 
                   focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none
                   ${canEdit 
                     ? 'bg-white hover:shadow-sm' 
                     : 'bg-gray-50 text-gray-600 cursor-not-allowed'
                   }`}
            />
          </div>
        </div>

        {/* Teléfonos - Grid de 2 columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="transition-all duration-200 hover:translate-y-[-2px]">
            <label htmlFor="phonePrimary" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
              Teléfono Principal
              {!canEdit && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phonePrimary"
                type="tel"
                value={contactInfo.phonePrimary || ''}
                onChange={canEdit ? handleInputChange : undefined}
                disabled={!canEdit}
                placeholder={canEdit ? '+51 999 999 999' : 'No disponible'}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 
                     focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none
                     ${canEdit 
                       ? 'bg-white hover:shadow-sm' 
                       : 'bg-gray-50 text-gray-600 cursor-not-allowed'
                     }`}
              />
            </div>
          </div>

          <div className="transition-all duration-200 hover:translate-y-[-2px]">
            <label htmlFor="phoneSecondary" className="block text-sm font-medium text-gray-700 flex items-center mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
              Teléfono Secundario
              {!canEdit && (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Phone className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="phoneSecondary"
                type="tel"
                value={contactInfo.phoneSecondary || ''}
                onChange={canEdit ? handleInputChange : undefined}
                disabled={!canEdit}
                placeholder={canEdit ? '+51 888 888 888' : 'No disponible'}
                className={`w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-gray-800 
                     focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none
                     ${canEdit 
                       ? 'bg-white hover:shadow-sm' 
                       : 'bg-gray-50 text-gray-600 cursor-not-allowed'
                     }`}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
          <MessageCircle className="w-5 h-5 mr-2 text-pink-600" />
          Redes Sociales
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {socialMediaFields.map((field) => (
            <div key={field.id} className="group">
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                <span className="w-2 h-2 bg-pink-400 rounded-full inline-block mr-2"></span>
                {field.label}
              </label>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <field.icon className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type={field.type}
                  id={field.id}
                  value={(contactInfo as any)[field.id] || ''}
                  onChange={canEdit ? handleInputChange : undefined}
                  disabled={!canEdit}
                  placeholder={canEdit ? field.placeholder : 'No configurado'}
                  className={`w-full pl-9 pr-4 py-2.5 border border-gray-300 rounded-lg transition-all outline-none text-sm
                    ${canEdit 
                      ? 'focus:ring-2 focus:ring-pink-300 focus:border-pink-400' 
                      : 'bg-gray-50 text-gray-600 cursor-not-allowed'
                    }`}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Contact Actions - Solo para visitantes */}
      {!canEdit && (contactInfo.phonePrimary || contactInfo.facebook || contactInfo.instagram) && (
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Contacto Rápido</h4>
          <div className="flex flex-wrap gap-3">
            {contactInfo.phonePrimary && (
              <a
                href={`tel:${contactInfo.phonePrimary.replace(/\s/g, '')}`}
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

      {/* Save button - Solo visible para usuarios que pueden editar */}
      {canEdit && (
        <div className="mt-8 flex justify-center">
          <button
            onClick={handleUpdateContactInfo}
            disabled={!hasChanges}
            className={`px-8 py-3 rounded-xl text-white font-medium transition-all duration-200 
                  ${hasChanges
                ? 'bg-green-600 hover:bg-green-700 shadow-sm hover:shadow'
                : 'bg-gray-400 cursor-not-allowed opacity-70'}`}
          >
            {hasChanges ? (
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Cambios
              </span>
            ) : 'No hay cambios'}
          </button>
        </div>
      )}

      {/* Information for visitors */}
      {!canEdit && (
        <div className="mt-6 pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Esta información está en modo de solo lectura
          </p>
        </div>
      )}
    </div>
  );
};

export default ContactInformation;