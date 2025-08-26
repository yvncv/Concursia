// app/register/steps/Step3ProfileImage.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import Hombre from "@/public/hombre.png";
import { User } from "@/app/types/userType";
import toast from 'react-hot-toast';
import {
  User as LucideUser,
  Image as LucideImage,
  Check,
  X,
  Lightbulb,
  AlertCircle,
} from "lucide-react";
import ImageCropModal from "../modals/ImageCropModal";
import TermsModal from "@/app/ui/terms-and-conditions/TermsModal";
import { useImageUpload } from "@/app/hooks/useImageUpload";

interface Step3Props {
  formData: {
    email: string;
    password: string;
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    location: User['location'];
    guardian?: {
      dni: string;
      firstName: string;
      lastName: string;
      relationship: string;
      authorized: boolean;
    };
  };
  onComplete: (data: { 
    profileImage: string | null;
    acceptedTerms: boolean;
  }) => void;
  onBack: () => void;
}

export default function Step3ProfileImage({ formData, onComplete, onBack }: Step3Props) {
  // Hook para manejo de imagen
  const {
    loading: loadingImage,
    selectedImage,
    croppedImage,
    isModalOpen,
    fileInputRef,
    handleFileChange,
    handleConfirmCrop,
    handleCloseModal
  } = useImageUpload();

  // Estados locales
  const [loading, setLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Calcular si es menor de edad
  const calculateAge = (birthDate: string): number => {
    if (!birthDate) return 0;
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const isMinor = calculateAge(formData.birthDate) < 18;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!acceptedTerms) {
      alert('Debes aceptar los términos y condiciones para continuar');
      return;
    }

    setLoading(true);

    // Simular delay para UX
    setTimeout(() => {
      onComplete({
        profileImage: croppedImage,
        acceptedTerms
      });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Foto de Perfil
      </h1>



      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold text-gray-800">
            Foto de Perfil
          </h2>
          <p className="text-gray-600 text-sm">
            Sube una foto clara para tu perfil
            {isMinor && (
              <span className="block mt-1 text-orange-600 font-medium">
                La foto debe ser del participante (menor de edad), no del apoderado
              </span>
            )}
          </p>
          <div className="mt-2 flex items-center justify-center gap-2 text-sm text-red-600">
            <AlertCircle size={16} />
            <span className="font-medium">La foto de perfil es obligatoria</span>
          </div>
        </div>

        <div className="flex flex-col items-center">
          {/* Visualización de imagen */}
          <div className="relative w-32 h-32 mb-4 rounded-full overflow-hidden border-4 border-rose-300 shadow-lg">
            {croppedImage ? (
              <Image
                src={croppedImage}
                alt="Foto de perfil"
                className="w-full h-full object-cover"
                width={1000}
                height={1000}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <LucideUser size={44} className="text-gray-400" />
              </div>
            )}
          </div>

          {/* Input para subir imagen */}
          <label
            htmlFor="profile-photo"
            className="cursor-pointer bg-rose-100 hover:bg-rose-200 text-rose-600 py-2 px-4 rounded-lg flex items-center gap-2 transition-colors"
          >
            <LucideImage size={20} className="text-rose-600" />
            {loadingImage ? 'Procesando...' : 'Seleccionar foto'}
          </label>
          <input
            type="file"
            id="profile-photo"
            className="hidden"
            accept="image/*"
            ref={fileInputRef}
            onChange={handleFileChange}
          />
        </div>

        {selectedImage && (
          <ImageCropModal
            image={selectedImage}
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleConfirmCrop}
          />
        )}

        {/* Guía de foto */}
        <div className="mt-8 bg-gray-50 rounded-xl p-6">
          <h3 className="text-lg font-medium text-gray-700 mb-3">
            Guía para foto de perfil
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {/* Imagen de guía */}
            <div className="bg-rose-100 rounded-lg p-3 shadow-sm">
              <div className="aspect-square bg-rose-50 rounded-lg overflow-hidden flex items-center justify-center">
                <div className="w-full h-full bg-white flex items-center justify-center">
                  <Image src={Hombre} alt="Ejemplo ideal" className="pt-4" />
                </div>
              </div>
              <p className="text-center text-sm mt-2 font-medium text-rose-600">
                Ejemplo ideal
              </p>
            </div>

            {/* Instrucciones */}
            <div className="bg-white rounded-lg p-3 shadow-sm">
              <ul className="text-sm text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <Check size={20} className="text-green-500" />
                  Foto frontal
                </li>
                <li className="flex items-start gap-2">
                  <Check size={20} className="text-green-500" />
                  Espacio luminoso
                </li>
                <li className="flex items-start gap-2">
                  <X size={20} className="text-red-500" />
                  No lentes ni gorras
                </li>
                <li className="flex items-start gap-2">
                  <Lightbulb size={20} className="text-yellow-500" />
                  Fondo blanco
                </li>
              </ul>
            </div>
          </div>
        </div>



        {/* Checkbox de términos y condiciones */}
        <div className="flex items-start space-x-4 mt-6 mb-6 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl border border-orange-200 transition-all duration-300 hover:shadow-md">
          {/* Custom Checkbox */}
          <div className="relative mt-1">
            <input
              type="checkbox"
              id="terms"
              checked={acceptedTerms}
              onChange={(e) => setAcceptedTerms(e.target.checked)}
              className="sr-only"
            />
            <label
              htmlFor="terms"
              className={`flex items-center justify-center w-5 h-5 rounded cursor-pointer transition-all duration-300 ${
                acceptedTerms
                  ? 'bg-gradient-to-r from-orange-500 to-red-500 shadow-lg scale-110'
                  : 'bg-white border-2 border-orange-300 hover:border-orange-400 hover:shadow-md'
              }`}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              {acceptedTerms && (
                <svg
                  className="w-3 h-3 text-white animate-pulse"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </label>
          </div>

          {/* Label with Terms Link */}
          <div className="flex-1">
            <label
              htmlFor="terms"
              className="text-sm text-gray-700 leading-relaxed cursor-pointer select-none"
            >
              Acepto los{' '}
              <button
                type="button"
                onClick={() => setShowTermsModal(true)}
                className={`font-semibold underline decoration-2 underline-offset-2 transition-all duration-300 ${
                  isHovered || acceptedTerms
                    ? 'text-red-600 decoration-red-400 hover:decoration-red-600'
                    : 'text-orange-600 decoration-orange-400 hover:decoration-orange-600'
                } hover:scale-105 hover:text-red-700`}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                términos y condiciones
              </button>
              {' '}del servicio
            </label>

            {/* Subtle animation indicator */}
            {!acceptedTerms && (
              <div className="mt-1 text-xs text-orange-600 opacity-70 animate-pulse">
                ⚠️ Requerido para continuar
              </div>
            )}

            {acceptedTerms && (
              <div className="mt-1 text-xs text-green-600 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></span>
                ✅ Términos aceptados
              </div>
            )}
          </div>
        </div>

        {/* Indicador de estado del formulario */}
        {!croppedImage && (
          <div className="text-center mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-red-600">
              <AlertCircle size={16} />
              <span className="text-sm font-medium">
                Sube tu foto de perfil para continuar
              </span>
            </div>
          </div>
        )}

        {croppedImage && acceptedTerms && (
          <div className="text-center mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <Check size={16} />
              <span className="text-sm font-medium">
                ¡Todo listo para completar tu registro!
              </span>
            </div>
          </div>
        )}

        {/* Botones de navegación */}
        <div className="flex justify-between mt-8">
          <button
            type="button"
            onClick={onBack}
            className="w-1/3 bg-gray-500 hover:bg-gray-600 text-white py-4 px-4 rounded-2xl transition-all"
          >
            Atrás
          </button>
          
          <button
            type="submit"
            className="w-1/2 bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:from-gray-400 disabled:to-gray-500"
            disabled={loading || !acceptedTerms || !croppedImage}
          >
            {loading ? "Registrando..." : "Completar Registro"}
          </button>
        </div>

        {/* Modal de términos y condiciones */}
        <TermsModal
          isOpen={showTermsModal}
          onClose={() => setShowTermsModal(false)}
        />
      </form>
    </>
  );
}