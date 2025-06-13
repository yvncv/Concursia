"use client"

import React, { useState, useEffect, useRef, use } from 'react';
import useUsers from '@/app/hooks/useUsers';
import useUser from "@/app/hooks/useUser";
import useAcademy from "@/app/hooks/useAcademy";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import Image from 'next/image';
import { 
  LucideImage, 
  User as UserIcon, 
  Trophy, 
  MapPin, 
  Award, 
  Calendar,
  Building2,
  ExternalLink,
  Mail,
  Phone,
  Globe,
  Users
} from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import ImageCropModal from '@/app/register/modals/ImageCropModal';
import ChangeProfileImageModal from './modals/ChangeIProfileImageModal';
import PersonalInformation from './components/PersonalInformation';
import ContactInformation from './components/ContactInformation';
import PlaceInformation from './components/PlaceInformation';
import AcademyHistory from './components/AcademyHistory';

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { users, loadingUsers } = useUsers();
  const { user } = useUser();
  const { id } = use(params);
  const foundUser = users.find(u => u.id === id);
  const { academy, loadingAcademy } = useAcademy(foundUser?.marinera?.academyId);

  // FIXED: Usar uid en lugar de id para la comparación con Firebase Auth
  const canEdit = Boolean(foundUser && user && foundUser.id === user?.uid);

  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoverImage, setCoverImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [isChangeImageModalOpen, setIsChangeImageModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // reset when user changes
    setSelectedImage(null);
    setCroppedImage(null);
    setCoverImage(null);
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
      const defaultImageRef = foundUser?.gender == 'Masculino' ? storageRef(storage, 'users/dafault-male.JPG') : storageRef(storage, 'users/dafault-female.JPG');

      // Obtener la URL pública de la imagen por defecto
      const defaultImageUrl = await getDownloadURL(defaultImageRef);
      // Referencia al documento del usuario en Firestore
      const userRef = doc(db, "users", user?.uid);

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
      const imageRef = storageRef(storage, `users/${user?.uid}`);
      await uploadBytes(imageRef, blob);
      const publicUrl = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'users', user?.uid), { profileImage: publicUrl });
      setCroppedImage(null);
    } catch (e) {
      console.error('Error guardando imagen:', e);
    }
  };

  const handleSaveCoverImage = async () => {
    if (!user?.uid || !selectedCoverImage || !foundUser?.id) return;
    try {
      const res = await fetch(selectedCoverImage);
      const blob = await res.blob();
      const imageRef = storageRef(storage, `users/${foundUser.id}/cover`);
      await uploadBytes(imageRef, blob);
      const publicUrl = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'users', foundUser.id), { coverImage: publicUrl });
      setCoverImage(null);
    } catch (e) {
      console.error('Error guardando imagen de portada:', e);
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

  // Función para ir al perfil de la academia
  const handleViewAcademyProfile = () => {
    if (academy?.id) {
      window.open(`/academy/${academy.id}`, '_blank');
    }
  };

  if (loadingUsers) return <div className="text-center mt-20">Cargando perfil...</div>;
  if (!foundUser) return <div className="text-center mt-20">Usuario no encontrado.</div>;

  const capitalizeName = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());

  const safeUser = {
    ...foundUser,
    location: {
      department: foundUser.location?.department || "",
      province: foundUser.location?.province || "",
      district: foundUser.location?.district || "",
    }
  };

  // Calcular edad si existe fecha de nacimiento
  const calculateAge = () => {
    if (!foundUser.birthDate) return null;

    let birthDate: Date;

    // Verificar si es un Timestamp de Firebase
    if (foundUser.birthDate && typeof foundUser.birthDate === 'object' && 'toDate' in foundUser.birthDate) {
      birthDate = foundUser.birthDate.toDate();
    } else {
      // Si no es un Timestamp, intentar convertir directamente
      birthDate = new Date(foundUser.birthDate as any);
    }

    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();

    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      return age - 1;
    }
    return age;
  };

  const age = calculateAge();

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className={`relative h-[15rem] md:h-[30rem] bg-gradient-to-r ${foundUser?.gender === 'Masculino'
          ? 'bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600'
          : foundUser?.gender === 'Femenino'
            ? 'bg-gradient-to-r from-pink-500 via-purple-500 to-red-500'
            : 'bg-gradient-to-r from-red-400 via-orange-500 to-yellow-500'
        }`}>
        {foundUser.coverImage && (
          <Image
            src={typeof foundUser.coverImage === 'string'
              ? foundUser.coverImage
              : URL.createObjectURL(foundUser.coverImage as File)}
            alt="Portada del perfil"
            fill
            className="object-cover"
            unoptimized
          />
        )}

        {/* Overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-40" />

        {/* Edit Cover Button */}
        {canEdit && (
          <button
            className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 sm:p-3 rounded-full transition-all duration-200"
            aria-label="Cambiar imagen de portada"
          >
            <LucideImage className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        )}

        {/* User Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-2 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end space-y-2 sm:space-y-0 sm:space-x-6">
            {/* Profile Image */}
            <div className="relative group self-center sm:self-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-2 sm:border-4 border-white shadow-lg overflow-hidden bg-white">
                {croppedImage ? (
                  <Image
                    src={croppedImage}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : foundUser.profileImage ? (
                  <Image
                    src={typeof foundUser.profileImage === 'string'
                      ? foundUser.profileImage
                      : URL.createObjectURL(foundUser.profileImage as File)}
                    alt="Foto de perfil"
                    width={128}
                    height={128}
                    className="object-cover w-full h-full"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <UserIcon className="w-6 h-6 sm:w-8 sm:h-8 md:w-12 md:h-12 text-gray-400" />
                  </div>
                )}

                {canEdit && (
                  <div
                    className="absolute rounded-full inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                    onClick={() => setIsChangeImageModalOpen(true)}
                  >
                    <LucideImage className="text-white w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                  </div>
                )}
              </div>

              {/* Academy Badge - Pequeño ícono debajo de la foto */}
              {foundUser.marinera?.academyId && academy && !loadingAcademy && (
                <div 
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 cursor-pointer group/academy"
                  onClick={handleViewAcademyProfile}
                >
                  <div className="relative">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 rounded-full border-3 border-white shadow-lg overflow-hidden bg-white hover:scale-110 transition-transform duration-200">
                      {academy.profileImage ? (
                        <Image
                          src={typeof academy.profileImage === 'string' ? academy.profileImage : ''}
                          alt={academy.name}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                          {academy.name?.charAt(0) || "A"}
                        </div>
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 sm:px-3 py-1 bg-black bg-opacity-80 text-white text-xs rounded-lg opacity-0 group-hover/academy:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
                      Academia: {academy.name}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-2 border-transparent border-t-black border-t-opacity-80"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="text-white flex-1 text-center sm:text-left">
              <h1 className="text-xl sm:text-3xl md:text-4xl font-bold mb-1 sm:mb-2">
                {capitalizeName(foundUser.firstName + ' ' + foundUser.lastName)}
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-6 text-xs sm:text-base md:text-lg">
                <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                  <Trophy className="w-3 h-3 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-base">{foundUser.marinera?.participant?.category || 'Participante'}</span>
                </div>
                {age && (
                  <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                    <Calendar className="w-3 h-3 sm:w-5 sm:h-5" />
                    <span className="text-xs sm:text-base">{age} años</span>
                  </div>
                )}
                <div className="flex items-center justify-center sm:justify-start space-x-1 sm:space-x-2">
                  <MapPin className="w-3 h-3 sm:w-5 sm:h-5" />
                  <span className="text-xs sm:text-sm md:text-base">{foundUser.location?.district || 'Ubicación'}, {foundUser.location?.department || 'Perú'}</span>
                </div>
              </div>
              <div className="mt-1 sm:mt-2 flex flex-col sm:flex-row sm:items-center space-y-1 sm:space-y-0 sm:space-x-4">
                <span className="bg-white bg-opacity-20 px-2 py-1 sm:px-3 rounded-full text-xs self-center sm:self-auto">
                  {foundUser.roleId?.toUpperCase() || 'USUARIO'}
                </span>
                {foundUser.marinera?.academyId && (
                  <span className="text-blue-200 text-xs sm:text-sm">
                    Academia: {loadingAcademy ? 'Cargando...' : academy?.name || 'No disponible'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 md:space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full">
                  <Trophy className="w-4 h-4 sm:w-6 sm:h-6 text-blue-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {foundUser.marinera?.participant?.category || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Categoría</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 sm:p-3 rounded-full">
                  <UserIcon className="w-4 h-4 sm:w-6 sm:h-6 text-green-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {foundUser.gender === 'Masculino' ? 'M' : foundUser.gender === 'Femenino' ? 'F' : '-'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Género</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full">
                  <Award className="w-4 h-4 sm:w-6 sm:h-6 text-purple-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {foundUser.roleId === 'organizer' ? 'Org.' : foundUser.roleId === 'participant' ? 'Part.' : 'User'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Rol</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg sm:rounded-xl p-4 sm:p-6 shadow-sm border border-gray-200">
              <div className="flex items-center">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full">
                  <Calendar className="w-4 h-4 sm:w-6 sm:h-6 text-orange-600" />
                </div>
                <div className="ml-3 sm:ml-4">
                  <p className="text-lg sm:text-2xl font-bold text-gray-900">
                    {age || 'N/A'}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600">Años</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              <PersonalInformation foundUser={foundUser} canEdit={canEdit} />
              <ContactInformation foundUser={foundUser} canEdit={canEdit} />
              <PlaceInformation foundUser={safeUser} />
            </div>

            {/* Right Column - Additional Info */}
            <div className="space-y-6 md:space-y-8">
              {/* Academy History */}
              <AcademyHistory userId={foundUser.id} />
              
              {/* Activity Status */}
              <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Estado</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center space-x-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium text-green-800">Activo</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Miembro desde {foundUser.createdAt.toDate().getFullYear()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Buttons - Solo visible para propietarios */}
      {canEdit && (croppedImage || selectedCoverImage) && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 space-y-3">
          {croppedImage && (
            <button
              onClick={handleSaveProfileImage}
              className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm sm:text-base rounded-lg shadow-lg transition-colors"
            >
              Guardar Foto
            </button>
          )}
          {selectedCoverImage && (
            <button
              onClick={handleSaveCoverImage}
              className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white text-sm sm:text-base rounded-lg shadow-lg transition-colors"
            >
              Guardar Portada
            </button>
          )}
        </div>
      )}

      {/* Modals */}
      <ChangeProfileImageModal
        isOpen={isChangeImageModalOpen}
        onClose={() => setIsChangeImageModalOpen(false)}
        onFileSelect={handleFileSelect}
        onDelete={handleDeleteProfilePicture}
        currentImage={
          croppedImage || 
          (typeof foundUser.profileImage === 'string' 
            ? foundUser.profileImage 
            : foundUser.profileImage 
              ? URL.createObjectURL(foundUser.profileImage as File)
              : null
          )
        }
        userName={capitalizeName(foundUser.firstName + ' ' + foundUser.lastName)}
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