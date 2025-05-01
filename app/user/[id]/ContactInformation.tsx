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
        academyId: foundUser.academyId || ''
      });
    }
  }, [foundUser]);

  useEffect(() => {
    const changed =
      contactInfo.emailSecondary !== (foundUser.email[1] || '') ||
      contactInfo.phonePrimary !== (foundUser.phoneNumber[0] || '') ||
      contactInfo.phoneSecondary !== (foundUser.phoneNumber[1] || '') ||
      contactInfo.academyId !== (foundUser.academyId || '');
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
      if (contactInfo.academyId !== (foundUser.academyId || '')) {
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
    <div className="bg-gray-50 rounded-2xl p-6 shadow-md">
      <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
        Información de Contacto
      </h2>
      {/* Primary Email */}
      <div className="mb-4">
        <label htmlFor="emailPrimary" className="block text-sm font-medium text-gray-700">
          Correo Principal
        </label>
        <div className="flex items-center mt-1">
          <input
            id="emailPrimary"
            type="email"
            value={foundUser.email[0]}
            readOnly
            className="flex-1 px-4 py-2 bg-gray-200 rounded-2xl"
          />
          {canEdit && (
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="ml-2 px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Actualizar
            </button>
          )}
        </div>
      </div>

      {/* Email Modal */}
      {isEmailModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-80">
            <h3 className="text-lg font-medium mb-4">Actualizar Correo</h3>
            <form onSubmit={handleChangeEmail}>
              <input
                type="password"
                placeholder="Contraseña actual"
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className="w-full mb-3 px-3 py-2 border rounded"
                required
              />
              <input
                type="email"
                placeholder="Nuevo correo"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                className="w-full mb-4 px-3 py-2 border rounded"
                required
              />
              <div className="flex justify-end">
                <button type="button" onClick={() => setIsEmailModalOpen(false)} className="mr-2">
                  Cancelar
                </button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Secondary & Academy */}
      {[
        { label: 'Correo Secundario', id: 'emailSecondary', type: 'email' },
        { label: 'Teléfono Principal', id: 'phonePrimary', type: 'text' },
        { label: 'Teléfono Secundario', id: 'phoneSecondary', type: 'text' },
        // { label: 'Academia', id: 'academyId', type: 'text' }
      ].map(field => (
        <div key={field.id} className="mb-4">
          <label htmlFor={field.id} className="block text-sm font-medium text-gray-600 mb-1">
            {field.label}
          </label>
          <input
            id={field.id}
            type={field.type}
            value={(contactInfo as any)[field.id] || ''}
            onChange={handleInputChange}
            disabled={!canEdit}
            className="w-full px-3 py-2 bg-white border rounded"
          />
        </div>
      ))}

      <div className="text-center mt-6">
        <button
          onClick={handleUpdateContactInfo}
          disabled={!hasChanges}
          className={`px-6 py-2 rounded-lg text-white ${hasChanges ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default ContactInformation;