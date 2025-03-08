"use client"

import { useState, useEffect, use } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { useRouter } from 'next/navigation';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import useUser from '@/app/firebase/functions';

const ProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const { users, loadingUsers } = useUsers();
  const { user } = useUser();
  const { id } = use(params);

  const foundUser = users.find((user) => user.id === id);

  // Estado para la información de contacto
  const [contactInfo, setContactInfo] = useState({
    emailSecondary: '',
    phonePrimary: '',
    phoneSecondary: '',
    academyId: ''
  });

  // Estados para mostrar los campos de añadir
  const [showEmailSecondary, setShowEmailSecondary] = useState(false);
  const [showPhonePrimary, setShowPhonePrimary] = useState(false);
  const [showPhoneSecondary, setShowPhoneSecondary] = useState(false);

  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (user) {
      setContactInfo({
        emailSecondary: user.email[1] || '',
        phonePrimary: user.phoneNumber[0] || '',
        phoneSecondary: user.phoneNumber[1] || '',
        academyId: user.academyId || ''
      });
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setContactInfo(prev => {
      const updatedContactInfo = { ...prev, [id]: value };
      setHasChanges(
        updatedContactInfo.emailSecondary !== user?.email[1] ||
        updatedContactInfo.phonePrimary !== user?.phoneNumber[0] ||
        updatedContactInfo.phoneSecondary !== user?.phoneNumber[1]
      );
      return updatedContactInfo;
    });
  };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    if (!user?.uid) return;

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

      const userRef = doc(db, 'users', user.uid);
      const updateData = {
        email: [newEmail, user.email[1]]
      };

      await updateDoc(userRef, updateData);
      console.log('Perfil actualizado exitosamente');

      setIsEmailModalOpen(false);
      setNewEmail('');
      setCurrentPassword('');
      alert('Correo actualizado y sincronizado. Se ha enviado un correo de verificación.');
    } catch (error) {
      console.error('Error cambiando email:', error);
      if (error instanceof Error) {
        switch (error.message) {
          case 'auth/invalid-email':
            alert('Correo electrónico inválido');
            break;
          case 'auth/email-already-in-use':
            alert('Este correo electrónico ya está en uso');
            break;
          case 'auth/requires-recent-login':
            alert('Por favor, vuelve a iniciar sesión e intenta nuevamente');
            break;
          default:
            alert('Hubo un error al cambiar el correo. Intenta nuevamente.');
        }
      }
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user?.uid) return;

    try {
      const userRef = doc(db, "users", user.uid);

      const updateData = {
        email: [user.email[0], contactInfo.emailSecondary],
        phoneNumber: [contactInfo.phonePrimary, contactInfo.phoneSecondary],
        academyId: contactInfo.academyId
      };

      await updateDoc(userRef, updateData);
      console.log('Perfil actualizado exitosamente');
      setHasChanges(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
  };

  if (loadingUsers) {
    return <div className="text-center text-gray-600">Cargando perfil...</div>;
  }

  if (!foundUser) {
    return <div className="text-center text-gray-600">No se ha encontrado el usuario.</div>;
  }

  function capitalizeFirstLetter(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const canEdit = foundUser?.id === user?.id;

  return (
    <main className="min-h-screen">
      <form onSubmit={handleUpdateProfile}>
        <div className="w-4/5 mx-auto my-4 bg-white/80 rounded-lg shadow-xl p-8">
          <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 items-center mb-8">
            <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-semibold">
              {foundUser.firstName[0]}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{`${user?.firstName} ${user?.lastName}`}</h1>
              <strong className="text-lg text-rojo">{capitalizeFirstLetter(foundUser.roleId)}</strong>
              {foundUser.academyId && (
                <span> from <strong className="text-lg text-rojo">{foundUser.academyName}</strong></span>
              )}
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Información Personal</h2>
              <div className="mt-4 mb-4">
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                <input
                  type="text"
                  value={foundUser.dni}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="flex gap-x-2">
                <div className="w-full">
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    value={foundUser.firstName}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                    readOnly
                  />
                </div>
                <div className="w-full">
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                  <input
                    type="text"
                    value={foundUser.lastName}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                    readOnly
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de Nacimiento</label>
                <input
                  type="date"
                  value={foundUser.birthDate.toDate().toISOString().split('T')[0]}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                <input
                  type="text"
                  value={foundUser.gender}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  readOnly
                />
              </div>
              <div className="mt-4">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">Categoría</label>
                <input
                  type="text"
                  value={foundUser.category}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  readOnly
                />
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de Contacto</h2>
              <div className="mt-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Correo Principal
                </label>
                <div className="flex items-center mt-1">
                  <input
                    type="email"
                    id="emailPrimary"
                    value={foundUser?.email[0]}
                    onChange={handleInputChange}
                    className="flex-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                    readOnly
                  />
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => setIsEmailModalOpen(true)}
                      className="ml-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                    >
                      Actualizar
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="emailSecondary" className="block text-sm font-medium text-gray-700">
                  Correo Secundario
                </label>
                {showEmailSecondary || contactInfo.emailSecondary !== '' ? (
                  <input
                    type="email"
                    id="emailSecondary"
                    value={contactInfo.emailSecondary}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowEmailSecondary(true)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Añadir Correo Secundario
                  </button>
                )}
              </div>
              {isEmailModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                  <div className="bg-white p-8 rounded-lg w-96">
                    <h2 className="text-xl font-semibold mb-4">Actualizar Correo Electrónico</h2>
                    <div>
                      <div className="mb-4">
                        <label htmlFor="currentPassword" className="block mb-2">Contraseña Actual</label>
                        <input
                          type="password"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label htmlFor="newEmail" className="block mb-2">Nuevo Correo Electrónico</label>
                        <input
                          type="email"
                          value={newEmail}
                          onChange={(e) => setNewEmail(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg"
                          required
                        />
                      </div>
                      <div className="flex justify-between">
                        <button
                          onClick={() => setIsEmailModalOpen(false)}
                          className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleChangeEmail}
                          className="bg-blue-500 text-white px-4 py-2 rounded-lg"
                        >
                          Actualizar Correo
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div className="mt-4">
                <label htmlFor="phonePrimary" className="block text-sm font-medium text-gray-700">
                  Teléfono Principal
                </label>
                {showPhonePrimary || contactInfo.phonePrimary !== '' ? (
                  <input
                    type="text"
                    id="phonePrimary"
                    value={contactInfo.phonePrimary}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhonePrimary(true)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Añadir Teléfono Principal
                  </button>
                )}
              </div>
              <div className="mt-4">
                <label htmlFor="phoneSecondary" className="block text-sm font-medium text-gray-700">
                  Teléfono Secundario
                </label>
                {showPhoneSecondary || contactInfo.phoneSecondary !== '' ? (
                  <input
                    type="text"
                    id="phoneSecondary"
                    value={contactInfo.phoneSecondary}
                    onChange={handleInputChange}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-gray-200 placeholder:text-gray-500 focus:ring-0 focus:shadow-none transition-all outline-none"
                  />
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowPhoneSecondary(true)}
                    className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition duration-300"
                  >
                    Añadir Teléfono Secundario
                  </button>
                )}
              </div>
              <div className="mt-8 text-center">
                <button
                  type="submit"
                  className={`px-6 py-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition duration-300 ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={!hasChanges}
                >
                  Guardar Cambios
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
};

export default ProfilePage;
