import React, { useState, useEffect } from 'react';
import { auth, db } from '@/app/firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import {
  updateEmail,
  sendEmailVerification,
  reauthenticateWithCredential,
  EmailAuthProvider
} from 'firebase/auth';
import { User } from '@/app/types/userType';

interface Props {
  foundUser: User;
  canEdit: boolean;
}

const ContactInformation: React.FC<Props> = ({ foundUser, canEdit }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const [contactInfo, setContactInfo] = useState({
    emailSecondary: '',
    phonePrimary: '',
    phoneSecondary: '',
    academyId: ''
  });
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (foundUser) {
      setContactInfo({
        emailSecondary: foundUser.email[1] || '',
        phonePrimary: foundUser.phoneNumber[0] || '',
        phoneSecondary: foundUser.phoneNumber[1] || '',
        academyId: foundUser.marinera?.academyId || ''
      });
    }
  }, [foundUser]);

  useEffect(() => {
    const changed =
      contactInfo.emailSecondary !== (foundUser.email[1] || '') ||
      contactInfo.phonePrimary !== (foundUser.phoneNumber[0] || '') ||
      contactInfo.phoneSecondary !== (foundUser.phoneNumber[1] || '') ||
      contactInfo.academyId !== (foundUser.marinera?.academyId || '');
    setHasChanges(changed);
  }, [contactInfo, foundUser]);

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

  // Handle updating all contact info including secondary and academyId
  const handleUpdateContactInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!foundUser.id) return;
    try {
      const userRef = doc(db, 'users', foundUser.id);
      const updateData: any = {
        email: [foundUser.email[0], contactInfo.emailSecondary],
        phoneNumber: [contactInfo.phonePrimary, contactInfo.phoneSecondary]
      };
      if (contactInfo.academyId !== (foundUser.marinera?.academyId || '')) {
        updateData.academyId = contactInfo.academyId;
      }
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

  return (
    <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-6 shadow-lg border border-blue-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-semibold text-gray-800 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-20 after:h-1 after:bg-blue-500 after:-bottom-2">
          Información de Contacto
        </h2>
        <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
          Comunicaciones
        </span>
      </div>

      {/* Primary Email */}
      <div className="mb-5">
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

      {/* Email Modal */}
      {isEmailModalOpen && (
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
                  placeholder="Ingresa tu nuevo correo"
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

      {/* Secondary Contact Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {[
          { label: 'Correo Secundario', id: 'emailSecondary', type: 'email', icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
          { label: 'Teléfono Principal', id: 'phonePrimary', type: 'text', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
          { label: 'Teléfono Secundario', id: 'phoneSecondary', type: 'text', icon: 'M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z' },
        ].map(field => (
          <div key={field.id} className="mb-4 transition-all duration-200 hover:translate-y-[-2px]">
            <label htmlFor={field.id} className="block text-sm font-medium text-gray-700 flex items-center mb-2">
              <span className="w-2 h-2 bg-blue-400 rounded-full inline-block mr-2"></span>
              {field.label}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={field.icon} />
                </svg>
              </div>
              <input
                id={field.id}
                type={field.type}
                value={(contactInfo as any)[field.id] || ''}
                onChange={handleInputChange}
                disabled={!canEdit}
                placeholder={`Ingresa ${field.label.toLowerCase()}`}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-gray-800 
                     focus:ring-2 focus:ring-blue-300 focus:border-blue-400 transition-all outline-none
                     disabled:bg-gray-100 disabled:text-gray-500"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
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
    </div>
  );
};

export default ContactInformation;