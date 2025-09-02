// app/register/page.tsx
"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/app/firebase/config";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MarineraImage from "@/public/concursia-fondo.png";
import toast from 'react-hot-toast';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { User } from "@/app/types/userType";
import { encryptValue, hashValue } from "@/app/utils/security/securityHelpers";

// Import steps
import Step1BasicInfo from "./steps/Step1BasicInfo";
import Step2PersonalInfo from "./steps/Step2PersonalInfo";
import StepGuardianInfo from "./steps/StepGuardianInfo";
import Step3ProfileImage from "./steps/Step3ProfileImage";

interface FormData {
  // Step 1
  email: string;
  password: string;

  // Step 2
  dni: string;
  firstName: string;
  lastName: string;
  birthDate: string;
  gender: string;
  phoneNumber: string;
  location: User['location'];

  // NUEVO: Datos del apoderado para menores
  guardian?: {
    dni: string;
    firstName: string;
    lastName: string;
    relationship: string;
    authorized: boolean;
  };

  // Step 3
  profileImage: string | null;
  acceptedTerms: boolean;
}

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<FormData>>({});
  const [loading, setLoading] = useState(false);
  const [isMinor, setIsMinor] = useState(false); // Nuevo estado para rastrear si es menor
  const router = useRouter();

  // Función para calcular edad
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

  const handleStep1Complete = (data: { email: string; password: string }) => {
    setFormData(prev => ({ ...prev, ...data }));
    setStep(2);
  };

  const handleStep2Complete = (data: {
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    location: User['location'];
  }) => {
    setFormData(prev => ({ ...prev, ...data }));

    // Verificar si es menor de edad
    const age = calculateAge(data.birthDate);
    const isUnder16 = age < 16;
    setIsMinor(isUnder16);

    // Si es menor, ir al step del apoderado, sino al step 3
    if (isUnder16) {
      setStep(2.5); // Step intermedio para apoderado
    } else {
      setStep(3);
    }
  };

  const handleGuardianComplete = (guardianData: {
    dni: string;
    firstName: string;
    lastName: string;
    relationship: string;
    authorized: boolean;
  }) => {
    setFormData(prev => ({ ...prev, guardian: guardianData }));
    setStep(3);
  };

  const uploadProfileImage = async (imageFile: string, userId: string): Promise<string> => {
    try {
      // Convert base64 to blob
      let imageToUpload: Blob;
      if (imageFile.startsWith("data:")) {
        const response = await fetch(imageFile);
        imageToUpload = await response.blob();
      } else {
        throw new Error("Invalid image format");
      }

      // Create reference to the user's profile image in storage
      const imageRef = storageRef(storage, `users/${userId}`);

      // Upload the image
      await uploadBytes(imageRef, imageToUpload);

      // Get and return the download URL
      return await getDownloadURL(imageRef);
    } catch (error) {
      console.error("Error uploading profile image:", error);
      throw new Error("Error al subir la imagen de perfil");
    }
  };

  const handleRegistrationComplete = async (data: {
    profileImage: string | null;
    acceptedTerms: boolean;
  }) => {
    // Calcular si es menor para la validación
    const age = calculateAge(formData.birthDate || "");
    const isMinor = age < 18;
    // Solo validar foto si no es menor de edad
    if (!isMinor && !data.profileImage) {
      toast.error('La foto de perfil es obligatoria para completar el registro');
      return;
    }

    setLoading(true);

    // Toast de carga
    const loadingToast = toast.loading('Creando tu cuenta...');

    try {
      const completeData = { ...formData, ...data } as FormData;

      if (!completeData.acceptedTerms) {
        toast.dismiss(loadingToast);
        toast.error('Debes aceptar los términos y condiciones para continuar');
        setLoading(false);
        return;
      }

      // Create user account
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        completeData.email,
        completeData.password
      );
      const user = userCredential.user;

      // Upload profile image
      let profileImageUrl = "";
      if (completeData.profileImage) {
        profileImageUrl = await uploadProfileImage(completeData.profileImage, user.uid);
      }

      // Preparar datos del usuario
      const userData: any = {
        id: user.uid,
        roleId: "user",
        dni: encryptValue(completeData.dni),
        dniHash: hashValue(completeData.dni),
        firstName: completeData.firstName,
        lastName: completeData.lastName,
        birthDate: Timestamp.fromDate(new Date(`${completeData.birthDate}T00:00:00`)),
        gender: completeData.gender,
        marinera: {
          participant: {
            level: "",
            participatedEvents: [],
          },
        },
        email: [completeData.email],
        phoneNumber: [completeData.phoneNumber],
        location: {
          department: completeData.location?.department || "",
          province: completeData.location?.province || "",
          district: completeData.location?.district || "",
        },
        profileImage: profileImageUrl,
        createdAt: new Date(),
      };

      // Agregar datos del apoderado si existe
      if (completeData.guardian) {
        userData.guardian = {
          dni: encryptValue(completeData.guardian.dni),
          dniHash: hashValue(completeData.guardian.dni),
          firstName: completeData.guardian.firstName,
          lastName: completeData.guardian.lastName,
          relationship: completeData.guardian.relationship,
          authorized: completeData.guardian.authorized,
          authorizedAt: Timestamp.now(),
        };
      }

      // Save user data to Firestore
      await setDoc(doc(db, "users", user.uid), userData);

      // Dismiss loading toast y mostrar éxito
      toast.dismiss(loadingToast);
      toast.success('¡Registro completado exitosamente! Bienvenido a Concursia', {
        duration: 5000,
        icon: '🎉',
      });

      // Esperar un poco antes de redirigir para que el usuario vea el toast
      setTimeout(() => {
        router.push("/calendario");
      }, 1500);

    } catch (error) {
      console.error("Error al registrarse:", error);
      toast.dismiss(loadingToast);

      // Manejar diferentes tipos de errores
      if (error instanceof Error) {
        if (error.message.includes('email-already-in-use')) {
          toast.error('Este correo electrónico ya está registrado');
        } else if (error.message.includes('weak-password')) {
          toast.error('La contraseña debe tener al menos 6 caracteres');
        } else if (error.message.includes('invalid-email')) {
          toast.error('El formato del correo electrónico no es válido');
        } else {
          toast.error('Error al registrarse. Por favor intenta nuevamente.');
        }
      } else {
        toast.error('Error inesperado. Por favor intenta nuevamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBackToStep = (targetStep: number) => {
    // Si están tratando de volver desde el step del apoderado al step 2
    if (targetStep === 2 && step === 2.5) {
      setStep(2);
    }
    // Si están tratando de volver desde step 3 y es menor, ir al step del apoderado
    else if (targetStep === 2 && step === 3 && isMinor) {
      setStep(2.5);
    }
    // Si están tratando de volver desde step 3 y es mayor, ir directamente al step 2
    else if (targetStep === 2 && step === 3 && !isMinor) {
      setStep(2);
    }
    else {
      setStep(targetStep);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Contenedor del formulario */}
        <div className="md:w-1/2 p-8">
          {/* Step indicator */}
          <div className="flex justify-center space-x-4 mb-6">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => {
                  // Lógica especial para navegación
                  if (num === 2 && step === 2.5) return; // No permitir click en 2 si está en apoderado
                  if (num <= step || (num === 2 && step === 3)) handleBackToStep(num);
                }}
                className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-white 
                  ${(step >= num || (num === 2 && step === 2.5) || (num === 2 && step === 3)) ? "bg-red-500" : "bg-gray-400"} 
                  ${(step < num && !(num === 2 && step === 2.5)) ? "cursor-not-allowed" : "cursor-pointer hover:opacity-80"}
                  transition-all`}
                disabled={step < num && !(num === 2 && step === 2.5)}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Conditional step rendering */}
          {step === 1 && (
            <Step1BasicInfo onNext={handleStep1Complete} />
          )}

          {step === 2 && (
            <Step2PersonalInfo
              onNext={handleStep2Complete}
              onBack={() => setStep(1)}
            />
          )}

          {step === 2.5 && (
            <StepGuardianInfo
              participantData={{
                dni: formData.dni || "",
                firstName: formData.firstName || "",
                lastName: formData.lastName || "",
                birthDate: formData.birthDate || "",
              }}
              onNext={handleGuardianComplete}
              onBack={() => setStep(2)}
            />
          )}

          {step === 3 && (
            <Step3ProfileImage
              formData={formData as FormData}
              onComplete={handleRegistrationComplete}
              onBack={() => isMinor ? setStep(2.5) : setStep(2)}
            />
          )}

          {/* Loading overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white p-6 rounded-lg shadow-lg">
                <div className="flex items-center space-x-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500"></div>
                  <span className="text-gray-700">Creando tu cuenta...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Imagen lateral */}
        <div className="hidden md:block md:w-1/2">
          <Image
            src={MarineraImage}
            alt="Marinera"
            className="w-full h-full object-cover"
            loader={({ src }) => src}
          />
        </div>
      </div>
    </div>
  );
}