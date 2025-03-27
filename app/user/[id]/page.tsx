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
        <div className="min-h-screen bg-gradient-to-br from-white/25 to-white/50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto bg-white shadow-2xl rounded-3xl overflow-hidden">
            {/* Profile Header */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-8">
              <div className="flex items-center space-x-8">
                {/* Profile Image */}
                <div className="relative group">
                  <div className="w-40 h-40 rounded-full border-4 border-white shadow-lg overflow-hidden">
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
                  </div>
                </div>

                {/* User Name and Role */}
                <div>
                  <h1 className="text-4xl font-bold text-white">
                    {capitalizeName(`${foundUser.firstName} ${foundUser.lastName}`)}
                  </h1>
                  <p className="text-xl text-white/80 mt-2">
                    {foundUser.roleId.toUpperCase()}
                    {foundUser.academyId && ` • ${foundUser.academyName}`}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="grid md:grid-cols-2 gap-8 p-8">
              {/* Personal Information */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
                  Personal Information
                </h2>

                {[
                  { label: 'DNI', value: foundUser.dni },
                  { label: 'Birth Date', value: foundUser.birthDate.toDate().toISOString().split('T')[0] },
                  { label: 'Gender', value: foundUser.gender },
                  { label: 'Category', value: foundUser.category }
                ].map(({ label, value }) => (
                  <div key={label} className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">
                      {label}
                    </label>
                    <div className="bg-white rounded-xl p-3 shadow-sm">
                      <p className="text-gray-800 font-medium">{value}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Información de Contacto */}
              <div className="bg-gray-50 rounded-2xl p-6 shadow-md">
                <h2 className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-200 pb-4 mb-6">
                  Información de Contacto
                </h2>

                {[
                  { label: 'Correo Principal', id: 'emailPrimary', value: foundUser?.email[0], readOnly: true },
                  { label: 'Correo Secundario', id: 'emailSecondary', value: contactInfo.emailSecondary, showButton: !showEmailSecondary && contactInfo.emailSecondary === '', onClick: () => setShowEmailSecondary(true) },
                  { label: 'Teléfono Principal', id: 'phonePrimary', value: contactInfo.phonePrimary, showButton: !showPhonePrimary && contactInfo.phonePrimary === '', onClick: () => setShowPhonePrimary(true) },
                  { label: 'Teléfono Secundario', id: 'phoneSecondary', value: contactInfo.phoneSecondary, showButton: !showPhoneSecondary && contactInfo.phoneSecondary === '', onClick: () => setShowPhoneSecondary(true) }
                ].map(({ label, id, value, readOnly, showButton, onClick }) => (
                  <div key={id} className="mb-4">
                    <label className="block text-sm font-medium text-gray-600 mb-2">{label}</label>
                    {showButton ? (
                      <button
                        type="button"
                        onClick={onClick}
                        className="mt-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md"
                      >
                        Añadir {label}
                      </button>
                    ) : (
                      <div className="bg-white rounded-xl p-3 shadow-sm flex items-center">
                        <input
                          type={id.includes('email') ? 'email' : 'text'}
                          id={id}
                          value={value}
                          onChange={handleInputChange}
                          className="w-full bg-transparent text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-blue-400 focus:bg-white focus:outline-none transition-all"
                          readOnly={readOnly}
                        />
                        {canEdit && !readOnly && (
                          <button
                            type="button"
                            onClick={() => alert(`Editar ${label}`)}
                            className="ml-2 text-blue-500 hover:text-blue-700 transition"
                          >
                            ✏️
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}

                <div className="mt-8 text-center">
                  <button
                    type="submit"
                    className={`px-6 py-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all duration-300 shadow-md ${!hasChanges ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    disabled={!hasChanges}
                  >
                    Guardar Cambios
                  </button>
                </div>
              </div>

            </div>
          </div>

          {/* Modals for Image Change and Crop */}
          {isChangeImageModalOpen && (
            <ChangeProfileImageModal
              isOpen={isChangeImageModalOpen}
              onClose={() => setIsChangeImageModalOpen(false)}
              onFileSelect={handleFileSelect}
              onDelete={handleDeleteProfilePicture}
            />
          )}

          {selectedImage && (
            <ImageCropModal
              image={selectedImage}
              isOpen={isCropModalOpen}
              onClose={handleCloseModal}
              onConfirm={handleConfirmCrop}
            />
          )}
        </div>
      </form>
    </main>
  );
};

export default ProfilePage;


