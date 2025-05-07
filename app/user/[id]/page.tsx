"use client"

import React, { useState, useEffect, useRef, use } from 'react';
import useUsers from '@/app/hooks/useUsers';
import useUser from "@/app/hooks/useUser";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import Image from 'next/image';
import { LucideImage } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageCropModal from '@/app/register/modals/ImageCropModal';
import ChangeProfileImageModal from './modals/ChangeIProfileImageModal';
import PersonalInformation from './components/PersonalInformation';
import ContactInformation from './components/ContactInformation';
import PlaceInformation from './components/PlaceInformation';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { users, loadingUsers } = useUsers();
  const { user } = useUser();
  const { id } = use(params);
  const foundUser = users.find(u => u.id === id);
  const canEdit = Boolean(foundUser && user && foundUser.id === user.id);

  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // reset when user changes
    setSelectedImage(null);
    setCroppedImage(null);
  }, [foundUser]);

  const handleFileSelect = (file: File) => {
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setIsCropModalOpen(true);
    setIsChangeImageModalOpen(false);
  };

  const handleDeleteProfilePicture = async () => {
    if (!user?.uid) return;
    try {
      // Crear referencia a la imagen por defecto en Firebase Storage
      const defaultImageRef = user.gender == 'Masculino' ? storageRef(storage, 'users/dafault-male.JPG') : storageRef(storage, 'users/dafault-female.JPG');

      // Obtener la URL pública de la imagen por defecto
      const defaultImageUrl = await getDownloadURL(defaultImageRef);
      // Referencia al documento del usuario en Firestore
      const userRef = doc(db, "users", user.uid);

      // Actualizar la URL de la imagen en Firestore
      await updateDoc(userRef, { profileImage: defaultImageUrl });

      console.log('Perfil actualizado exitosamente');
    } catch (error) {
      console.error("Error al actualizar el perfil:", error);
    }
    setIsChangeImageModalOpen(false);
  };

  const handleConfirmCrop = (croppedUrl: string) => {
    setCroppedImage(croppedUrl);
    setIsCropModalOpen(false);
  };

  const handleSaveProfileImage = async () => {
    if (!user?.uid || !croppedImage) return;
    try {
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      const imageRef = storageRef(storage, `users/${user.uid}`);
      await uploadBytes(imageRef, blob);
      const publicUrl = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'users', user.uid), { profileImage: publicUrl });
      setCroppedImage(null);
    } catch (e) {
      console.error('Error guardando imagen:', e);
    }
  };

  const handleCloseModal = () => {
    setIsCropModalOpen(false);
    if (!croppedImage) {
      setSelectedImage(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    // child components handle their own submits
  };

  if (loadingUsers) return <div className="text-center mt-20">Cargando perfil...</div>;
  if (!foundUser) return <div className="text-center mt-20">Usuario no encontrado.</div>;

  const capitalizeName = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="flex flex-col h-screen">
      {/* Header */}
      <div
        className={`top-0 z-10 items-center p-8 flex md:flex-row flex-col justify-around ${user?.gender === 'Masculino' ? 'bg-gradient-to-r from-blue-500 to-purple-700' // Male gradient
          : user?.gender === 'Femenino'
            ? 'bg-gradient-to-r from-pink-500 to-purple-600' // Female gradient
            : 'bg-gradient-to-r from-red-400 to-orange-600' // Default gradient
          } m-3 rounded-md`}
      >
        <div className="flex flex-col md:flex-row items-center space-x-8">
          <div className="relative group w-15 h-15 md:w-40 md:h-40 rounded-full border-4 shadow-lg overflow-hidden">
            {croppedImage ? (
              <Image
                src={croppedImage}
                alt="Foto de perfil"
                className="object-cover"
                width={160}
                height={160}
                unoptimized
              />
            ) : foundUser.profileImage ? (
              <Image
                src={typeof foundUser.profileImage === 'string'
                  ? foundUser.profileImage
                  : URL.createObjectURL(foundUser.profileImage as File)}
                alt="Foto de perfil"
                className="object-cover"
                width={160}
                height={160}
                unoptimized
              />
            ) : (
              <Image
                src={user.gender === 'Masculino' ? '/default-male.JPG' : '/default-female.JPG'}
                alt="Foto de perfil"
                className="object-cover"
                width={160}
                height={160}
                unoptimized
              />
            )}
            {canEdit && (
              <div
                className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer"
                onClick={() => setIsChangeImageModalOpen(true)}
              >
                <LucideImage className="text-white" size={24} />
              </div>
            )}
          </div>
          <div className="text-white mt-4 md:mt-0">
            <h1 className="bg-black/40 p-3 rounded-md md:text-4xl font-bold">{capitalizeName(foundUser.firstName + ' ' + foundUser.lastName)}</h1>
            <p className="bg-black/40 p-3 rounded-md md:text-xl mt-2">{foundUser.roleId.toUpperCase()}{foundUser.academyId && ` • ${foundUser.academyName}`}</p>
          </div>
        </div>

        {croppedImage && (
          <button
            onClick={handleSaveProfileImage}
            className="px-4 py-2 bg-red-600 rounded text-white mt-4 md:mt-0"
          >
            Guardar Imagen
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        <form onSubmit={handleUpdateProfile} className="max-w-5xl mx-auto space-y-8">
          <PersonalInformation foundUser={foundUser} />
          <ContactInformation foundUser={foundUser} canEdit={canEdit} />
          <PlaceInformation foundUser={foundUser} />
        </form>
      </div>

      {/* Modals */}
      <ChangeProfileImageModal
        isOpen={isChangeImageModalOpen}
        onClose={() => setIsChangeImageModalOpen(false)}
        onFileSelect={handleFileSelect}
        onDelete={handleDeleteProfilePicture}
      />
      {selectedImage && (
        <ImageCropModal
          image={selectedImage}
          isOpen={isCropModalOpen}
          onClose={handleCloseModal}
          onConfirm={handleConfirmCrop}
        />
      )}
    </main>

  );
}