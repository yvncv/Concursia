"use client"

import { useState, useEffect, use } from 'react';
import useUsers from '@/app/hooks/useUsers';
import { auth, db, storage } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';
import { updateEmail, sendEmailVerification, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import useUser from '@/app/firebase/functions';
import Image from 'next/image';
import { useRef } from 'react';
import { LucideImage, User } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL, ref } from 'firebase/storage';
import ImageCropModal from '@/app/register/modals/ImageCropModal';
import ChangeProfileImageModal from './modals/ChangeIProfileImageModal';

const ProfilePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const { users, loadingUsers } = useUsers();
  const { user } = useUser();
  const { id } = use(params);

  // Estado para la imagen del usuario
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);

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

  // const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const { id, value } = e.target;
  //   setContactInfo(prev => ({
  //     ...prev,
  //     [id]: value
  //   }));
  // };

  const handleChangeEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!auth.currentUser) {
      alert('No hay usuario autenticado');
      return;
    }

    if (!user?.uid) return;

    try {
      // Validar el formato del correo
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Por favor ingrese un correo electrónico válido');
        return;
      }

      // Re-autenticación
      const currentEmail = auth.currentUser.email ?? '';
      const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);

      // Cambiar el correo en Authentication
      await updateEmail(auth.currentUser, newEmail);

      // Enviar un correo de verificación
      await sendEmailVerification(auth.currentUser);

      // Actualizar el correo en Firestore
      const userRef = doc(db, 'users', user.uid); // Suponiendo que el ID del documento es el UID del usuario autenticado
      const updateData = {
        email: [newEmail, user.email[1]]
      }

      await updateDoc(userRef, updateData);
      console.log('Perfil actualizado exitosamente');

      // Restablecer los estados del modal
      setIsEmailModalOpen(false);
      setNewEmail('');
      setCurrentPassword('');

      alert('Correo actualizado y sincronizado. Se ha enviado un correo de verificación.');
    } catch (error: unknown) {
      console.error('Error cambiando email:', error);

      // Manejo de errores específicos
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

    if (loadingUsers) {
      return <div className="text-center text-gray-600">Cargando perfil...</div>;
    }

    if (!user?.uid) return;

    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(newEmail)) {
        alert('Por favor ingrese un correo electrónico válido');
        return;
      }

      const currentEmail = user.email ?? '';
      const credential = EmailAuthProvider.credential(currentEmail, currentPassword);
      await reauthenticateWithCredential(user, credential);

      await updateEmail(user, newEmail);
      await sendEmailVerification(user);

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

  // const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  //   e.preventDefault(); // Añade esta línea
  //   if (e.target.files && e.target.files[0]) {
  //     const file = e.target.files[0];
  //     const imageUrl = URL.createObjectURL(file);
  //     setSelectedImage(imageUrl);
  //     setIsCropModalOpen(true);
  //     setIsChangeImageModalOpen(false); // Cierra el modal de selección
  //   }
  // };

  const handleFileSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsCropModalOpen(true); // Abre el modal de recorte
    setIsChangeImageModalOpen(false); // Cierra el modal de selección
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.uid) return;
    try {
      // Crear referencia a la imagen por defecto en Firebase Storage
      const defaultImageRef = user.gender == 'Masculino' ? ref(storage, 'users/dafault-male.JPG') : ref(storage, 'users/dafault-female.JPG');

      // Obtener la URL pública de la imagen por defecto
      const defaultImageUrl = await getDownloadURL(defaultImageRef);
      // Referencia al documento del usuario en Firestore
      const userRef = doc(db, "users", user.uid);

      // Actualizar la URL de la imagen en Firestore
      await updateDoc(userRef, { profileImage: defaultImageUrl });

      console.log('Perfil actualizado exitosamente');
      setHasChanges(false);
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
    setIsChangeImageModalOpen(false);
  };

  const handleConfirmCrop = (croppedImageUrl: string) => {
    setCroppedImage(croppedImageUrl);
    setIsCropModalOpen(false);
  };

  // Función para guardar la imagen en Firebase Storage y actualizar Firestore.
  const handleSaveProfileImage = async () => {
    if (!user?.uid || !croppedImage) return;
    try {
      // Sube la imagen y obtiene la URL
      const imageUrl = await uploadProfileImage(croppedImage, user.uid);
      // Actualiza el documento del usuario en Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { profileImage: imageUrl });
      console.log("Imagen de perfil guardada exitosamente en Firebase Storage");
      // Limpia croppedImage para que desaparezca el botón
      setCroppedImage(null);
    } catch (error) {
      console.error("Error al guardar imagen de perfil:", error);
    }
  };

  const handleCloseModal = () => {
    setIsCropModalOpen(false);
    // Opcionalmente limpiar la selección si se cancela
    if (!croppedImage) {
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const uploadProfileImage = async (imageFile: any, userId: any) => {
    try {
      // Convert base64 to blob if needed
      let imageToUpload = imageFile;

      if (typeof imageFile === 'string' && imageFile.startsWith('data:')) {
        // Convert base64 to blob
        const response = await fetch(imageFile);
        imageToUpload = await response.blob();
      }

      // Create reference to the user's profile image in storage
      const imageRef = storageRef(storage, `users/${userId}`);

      // Upload the image
      await uploadBytes(imageRef, imageToUpload);

      // Get and return the download URL
      const downloadURL = await getDownloadURL(imageRef);
      return downloadURL;
    } catch (error) {
      console.error("Error uploading profile image:", error);

      if (error instanceof Error) {
        throw new Error(`Error uploading profile image: ${error.message}`);
      } else {
        throw new Error("Error uploading profile image: An unknown error occurred");
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
        academyId: contactInfo.academyId,
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
  const capitalizeName = (name: any) => name.toLowerCase().replace(/\b\w/g, (char: any) => char.toUpperCase());

  return (
    <main className="min-h-screen">
      <form onSubmit={handleUpdateProfile}>
        <div className="w-4/5 mx-auto my-4 bg-white/80 rounded-lg shadow-xl p-8">


          <div className='flex space-x-5 items-center'>
            <div className="flex flex-col items-center">
              {/* Contenedor de la imagen con overlay en hover */}
              <div className="relative group w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-rose-300 shadow-lg">
                {croppedImage ? (
                  <Image
                    src={croppedImage}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    width={1000}
                    height={1000}
                  />
                ) : foundUser.profileImage ? (
                  <Image
                    src={typeof foundUser.profileImage === "string"
                      ? foundUser.profileImage
                      : URL.createObjectURL(foundUser.profileImage as File)}
                    alt="Foto de perfil"
                    className="w-full h-full object-cover"
                    width={1000}
                    height={1000}
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <User size={44} className="text-gray-400" />
                  </div>
                )}

                {/* Overlay visible al hover */}
                {canEdit &&
                  <div onClick={() => setIsChangeImageModalOpen(true)} className="absolute inset-0 bg-black bg-opacity-50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:cursor-pointer">
                    {/* Label para seleccionar foto */}
                    <label
                      htmlFor="profile-photo"
                      className="cursor-pointer text-white flex flex-col items-center gap-2 mb-2 text-xs text-center"
                    >
                      <LucideImage size={20} className="text-white" />
                      Seleccionar nueva imagen
                    </label>
                  </div>
                }
              </div>

              {/* Input oculto para seleccionar imagen
              <input
                type="file"
                id="profile-photo"
                className="hidden"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              /> */}

              {/* Modal para cambiar la imagen */}
              <ChangeProfileImageModal
                isOpen={isChangeImageModalOpen}
                onClose={() => setIsChangeImageModalOpen(false)}
                onFileSelect={handleFileSelect}
                onDelete={handleDeleteProfilePicture}
              />

              {/* Modal de recorte */}
              {selectedImage && (
                <ImageCropModal
                  image={selectedImage}
                  isOpen={isCropModalOpen}
                  onClose={handleCloseModal}
                  onConfirm={handleConfirmCrop}
                />
              )}
            </div>
            <div className="ml-6">
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800">{capitalizeName(`${user?.firstName} ${user?.lastName}`)}</h1>
              <strong className="text-lg text-rojo">{capitalizeFirstLetter(foundUser.roleId)}</strong> {foundUser.academyId && (<span> from <strong className="text-lg text-rojo">{foundUser.academyName}</strong></span>)}
            </div>
            <div className="flex flex-col items-center">
            </div>
          </div>
          {/* Botón para guardar imagen, si hay croppedImage */}
          {croppedImage && (
            <button
              type="button"
              onClick={handleSaveProfileImage}
              className="ml-3 block text-center bg-gradient-to-r from-red-500 to-red-600 text-white py-1 md:py-2 md:px-4 rounded-lg font-medium transition-all duration-300 hover:shadow-md hover:from-red-600 hover:to-red-700 active:scale-[0.98]" >
              Guardar
            </button>
          )}

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


