"use client"

import React, { useState, useEffect, useRef, use } from 'react';
import useAcademies from '@/app/hooks/useAcademies';
import useUser from "@/app/hooks/useUser";
import useUsers from '@/app/hooks/useUsers';
import useAcademy from "@/app/hooks/useAcademy";
import { doc, updateDoc } from 'firebase/firestore';
import { db, storage } from '../../firebase/config';
import Image from 'next/image';
import { LucideImage, Building2, Users, Award, MapPin } from 'lucide-react';
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage';
import AcademyInformation from './components/AcademyInformation';
import ContactInformation from './components/ContactInformation';
import LocationInformation from './components/LocationInformation';
import AcademyJoinRequestButton from './components/AcademyJoinRequestButton';
import Map from '@/app/ui/map/mapa';

export default function AcademyPage({ params }: { params: Promise<{ id: string }> }) {
  const { academies, loadingAcademies } = useAcademies();
  const { users } = useUsers();
  const { user } = useUser();
  const { id } = use(params);
  const foundAcademy = academies.find(a => a.id === id);

  // Verificar si el usuario actual es el organizador de esta academia
  const canEdit = Boolean(foundAcademy && user && foundAcademy.organizerId === user?.uid);

  // Obtener información del organizador
  const organizer = users.find(u => u.id === foundAcademy?.organizerId);

  // Obtener estudiantes de esta academia
  const students = users.filter(u => u.marinera?.academyId === foundAcademy?.name);

  // Verificar si el usuario actual ya pertenece a una academia
  const currentUserData = users.find(u => u.id === user?.uid);
  const userAlreadyHasAcademy = Boolean(currentUserData?.marinera?.academyId);

  // Image states
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedCoverImage, setCoverImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState<string | null>(null);

  const handleSaveProfileImage = async () => {
    if (!user?.uid || !croppedImage || !foundAcademy?.id) return;
    try {
      const res = await fetch(croppedImage);
      const blob = await res.blob();
      const imageRef = storageRef(storage, `academies/${foundAcademy.id}/profile`);
      await uploadBytes(imageRef, blob);
      const publicUrl = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'academies', foundAcademy.id), { profileImage: publicUrl });
      setCroppedImage(null);
    } catch (e) {
      console.error('Error guardando imagen:', e);
    }
  };

  const handleSaveCoverImage = async () => {
    if (!user?.uid || !selectedCoverImage || !foundAcademy?.id) return;
    try {
      const res = await fetch(selectedCoverImage);
      const blob = await res.blob();
      const imageRef = storageRef(storage, `academies/${foundAcademy.id}/cover`);
      await uploadBytes(imageRef, blob);
      const publicUrl = await getDownloadURL(imageRef);
      await updateDoc(doc(db, 'academies', foundAcademy.id), { coverImage: publicUrl });
      setCoverImage(null);
    } catch (e) {
      console.error('Error guardando imagen de portada:', e);
    }
  };

  if (loadingAcademies) return <div className="text-center mt-20">Cargando academia...</div>;
  if (!foundAcademy) return <div className="text-center mt-20">Academia no encontrada.</div>;

  const capitalizeName = (str: string) => str.replace(/\b\w/g, c => c.toUpperCase());

  return (
    <main className="flex flex-col min-h-screen bg-gray-50">
      {/* Cover Image Section */}
      <div className="relative h-[22rem] md:h-[30rem] bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 overflow-hidden">
        {foundAcademy.coverImage && (
          <Image
            src={typeof foundAcademy.coverImage === 'string'
              ? foundAcademy.coverImage
              : URL.createObjectURL(foundAcademy.coverImage as File)}
            alt="Portada de la academia"
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

        {/* Academy Header Info */}
        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6 md:p-8">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row sm:items-end space-y-4 sm:space-y-0 sm:space-x-4 md:space-x-6">
              {/* Profile Image */}
              <div className="relative group flex-shrink-0 self-center sm:self-auto">
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-2 sm:border-4 border-white shadow-lg overflow-hidden bg-white">
                  {foundAcademy.profileImage ? (
                    <Image
                      src={typeof foundAcademy.profileImage === 'string'
                        ? foundAcademy.profileImage
                        : URL.createObjectURL(foundAcademy.profileImage as File)}
                      alt="Logo de la academia"
                      width={128}
                      height={128}
                      className="object-cover w-full h-full"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <Building2 className="w-8 h-8 sm:w-10 sm:h-10 md:w-14 md:h-14 lg:w-16 lg:h-16 text-gray-400" />
                    </div>
                  )}

                  {canEdit && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                      <LucideImage className="text-white w-5 h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8" />
                    </div>
                  )}
                </div>
              </div>

              {/* Academy Info */}
              <div className="text-white flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">{capitalizeName(foundAcademy.name)}</h1>

                {organizer && (
                  <p className="mb-3 sm:mb-4 font-bold text-sm sm:text-base md:text-lg">
                    Dirigida por: {organizer.firstName} {organizer.lastName}
                  </p>
                )}

                <div className="space-y-2 text-sm sm:text-base md:text-lg">
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Users className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>{students.length} estudiantes</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <MapPin className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="truncate">{foundAcademy.location?.district}, {foundAcademy.location?.department}</span>
                  </div>
                  <div className="flex items-center justify-center sm:justify-start space-x-2">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span>Danza Marinera</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Join Request Button - Solo visible si no es el organizador */}
            {!canEdit && (
              <div className="flex justify-center sm:justify-start sm:ml-4 flex-shrink-0">
                <AcademyJoinRequestButton
                  academyId={foundAcademy.id!}
                  academyName={foundAcademy.name}
                  userId={user?.uid}
                  userAlreadyHasAcademy={userAlreadyHasAcademy}
                  userCurrentAcademyId={currentUserData?.marinera?.academyId}
                  userCurrentAcademyName={currentUserData?.marinera?.academyName}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="bg-blue-100 p-2 sm:p-3 rounded-full self-center sm:self-auto">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-blue-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">{students.length}</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Estudiantes</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="bg-green-100 p-2 sm:p-3 rounded-full self-center sm:self-auto">
                  <Award className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">5+</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Años exp.</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="bg-purple-100 p-2 sm:p-3 rounded-full self-center sm:self-auto">
                  <Building2 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">1</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Sede</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl p-3 sm:p-4 md:p-6 shadow-sm border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
                <div className="bg-orange-100 p-2 sm:p-3 rounded-full self-center sm:self-auto">
                  <MapPin className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-orange-600" />
                </div>
                <div className="text-center sm:text-left">
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900">Local</p>
                  <p className="text-xs sm:text-sm md:text-base text-gray-600">Ubicación</p>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
              <AcademyInformation academy={foundAcademy} canEdit={canEdit} organizer={organizer} />
              <ContactInformation academy={foundAcademy} canEdit={canEdit} />
              <LocationInformation academy={foundAcademy} canEdit={canEdit} />
            </div>

            {/* Right Column - Students & Additional Info */}
            <div className="space-y-6 sm:space-y-8">
              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-4">Actividad Reciente</h3>
                <div className="space-y-3 sm:space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Nuevo estudiante registrado</span>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">Perfil actualizado</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Buttons - Solo visible para organizadores */}
      {canEdit && (croppedImage || selectedCoverImage) && (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 space-y-3 z-50">
          {croppedImage && (
            <button
              onClick={handleSaveProfileImage}
              className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-lg transition-colors text-sm sm:text-base"
            >
              Guardar Logo
            </button>
          )}
          {selectedCoverImage && (
            <button
              onClick={handleSaveCoverImage}
              className="block w-full px-4 py-2 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg shadow-lg transition-colors text-sm sm:text-base"
            >
              Guardar Portada
            </button>
          )}
        </div>
      )}
    </main>
  );
}