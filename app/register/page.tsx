"use client";

import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db, storage } from "@/app/firebase/config";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TusuyImage from "@/public/TusuyPeru.jpg";
import Hombre from "@/public/hombre.png";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";
import { Search, User, Image as LucideImage, X, Check, Lightbulb } from "lucide-react";
import { collection, query, where, getDocs } from "firebase/firestore";
import ImageCropModal from "./modals/ImageCropModal";

interface LocationData {
  department?: string;
  province?: string;
  district?: string;
}

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dni, setDni] = useState("");
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [category, setCategory] = useState("");
  const [birthDate, setBirthDate] = useState<string>('');
  const [gender, setGender] = useState<string>('');
  const [step, setStep] = useState(1);
  const [emailExistsError, setEmailExistsError] = useState("");
  const [dniExistsError, setDniExistsError] = useState("");
  const [loadingImage, setLoadingImage] = useState(false);
  const router = useRouter();


  const [locationData, setLocationData] = useState<LocationData>({
    department: "",
    province: "",
    district: ""
  });

  const [loadingDni, setLoadingDni] = useState(false);
  const [dniError, setDniError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNumber = (telephoneNumber: string) => /^(9\d{8}|[1-8]\d{7})$/.test(telephoneNumber);

  useEffect(() => {
    if (birthDate) {
      const birthYear = new Date(birthDate).getFullYear();
      determineCategory(birthYear);
    }
  }, [birthDate]);

  const checkEmailExistsInFirestore = async (emailToCheck: any) => {
    try {
      const usersRef = collection(db, "users");
      // Usamos 'array-contains' porque los emails están guardados como array
      const q = query(usersRef, where("email", "array-contains", emailToCheck));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error al verificar email:", error);
      return false;
    }
  };

  const checkDniExistsInFirestore = async (dniToCheck: any) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("dni", "==", dniToCheck));
      const querySnapshot = await getDocs(q);

      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error al verificar DNI:", error);
      return false;
    }
  };

  const handleEmailBlur = async () => {
    if (email && validateEmail(email)) {
      const exists = await checkEmailExistsInFirestore(email);
      if (exists) {
        setEmailExistsError("Este correo electrónico ya está registrado. Por favor, utiliza otro.");
      } else {
        setEmailExistsError("");
      }
    }
  };

  const determineCategory = (birthYear: number) => {
    if (birthYear >= 2021) setCategory('Baby');
    else if (birthYear >= 2018) setCategory('Pre-Infante');
    else if (birthYear >= 2015) setCategory('Infante');
    else if (birthYear >= 2011) setCategory('Infantil');
    else if (birthYear >= 2007) setCategory('Junior');
    else if (birthYear >= 2003) setCategory('Juvenil');
    else if (birthYear >= 1990) setCategory('Adulto');
    else if (birthYear >= 1975) setCategory('Senior');
    else if (birthYear >= 1963) setCategory('Master');
    else setCategory('Oro');
  };

  const capitalizeText = (text: string) => {
    if (!text) return '';

    // Lista de palabras que no se deben capitalizar (artículos, preposiciones, etc.)
    const nonCapitalizedWords = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u'];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        // Siempre capitalizar la primera palabra
        if (index === 0 || !nonCapitalizedWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  const handleSubmitStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError1("Por favor ingresa un correo válido.");
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      setLoading(false);
      return;
    }
    setStep(2);
  };

  const handleSubmitStep2 = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateNumber(phoneNumber)) {
      setError2("Por favor ingresa un número de teléfono válido.");
      return;
    }

    const dniExists = await checkDniExistsInFirestore(dni);
    if (dniExists) {
      setDniExistsError("Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión.");
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      let profileImageUrl = await getDownloadURL(gender == 'Masculino' ? storageRef(storage, 'users/dafault-male.JPG') : storageRef(storage, 'users/dafault-female.JPG'));
      if (croppedImage) {
        profileImageUrl = await uploadProfileImage(croppedImage, user?.uid);
      }

      await setDoc(doc(db, "users", user?.uid), {
        id: user?.uid,
        roleId: "user",
        dni,
        firstName,
        lastName,
        birthDate: Timestamp.fromDate(new Date(`${birthDate}T00:00:00`)),
        gender,
        marinera: {
          participant: { // campo con informacion del usuario si es participante
            category: category,// eventos en los que participó
          }, // id de la academia a la que pertenece // eventos a los que asistió
        },
        email: [email],
        phoneNumber: [phoneNumber],
        location: {
          department: locationData.department,
          province: locationData.province,
          district: locationData.district
        },
        profileImage: profileImageUrl,
        createdAt: new Date(),
      });
      alert("Registro exitoso");
      router.push("/calendario");
    } catch (err) {
      console.error("Error al registrarse:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDniSearch = () => {
    if (dni.length === 8) {
      fetchReniecData(dni);
    } else {
      setDniError("El DNI debe tener 8 dígitos.");
    }
  };

  // Función para manejar la pulsación de Enter en el campo DNI
  const handleDniKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleDniSearch();
    }
  };

  useEffect(() => {
    if (dni.length === 8) {
      fetchReniecData(dni);
    }
  }, [dni]);

  const fetchReniecData = async (dni: string) => {
    setLoadingDni(true);
    setDniError("");
    setDniExistsError("");

    try {
      const dniExists = await checkDniExistsInFirestore(dni);
      if (dniExists) {
        setDniExistsError("Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión.");
        setLoadingDni(false);
        return;
      }
      const response = await axios.post(
        "https://api.consultasperu.com/api/v1/query",
        {
          token: "24068bb2bf38ddc53748557196cf438c54f6d7b227623c99dbad83599d70b505",
          type_document: "dni",
          document_number: dni
        }
      );

      if (response.data.success && response.data.data) {
        setFirstName(capitalizeText(response.data.data.name) || '');
        setLastName(capitalizeText(response.data.data.surname) || '');
        setBirthDate(response.data.data.date_of_birth || '');

        setLocationData({
          department: capitalizeText(response.data.data.department) || "",
          province: capitalizeText(response.data.data.province) || "",
          district: capitalizeText(response.data.data.district) || ""
        });
      } else {
        setDniError("No se encontró el DNI.");
      }
    } catch (error) {
      setDniError("Error al consultar el DNI.");
    } finally {
      setLoadingDni(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();

    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      // Validaciones
      if (!validateImageType(file)) {
        alert('Por favor selecciona una imagen válida (JPG, PNG, WEBP)');
        return;
      }

      if (!validateFileSize(file, 10)) { // Máximo 10MB
        alert('La imagen es demasiado grande. Por favor selecciona una imagen menor a 10MB');
        return;
      }

      try {
        setLoadingImage(true);

        // Redimensionar si es necesario
        const optimizedFile = await resizeImage(file, 1024, 1024);

        // Crear URL para el modal
        const imageUrl = URL.createObjectURL(optimizedFile);
        setSelectedImage(imageUrl);
        setIsModalOpen(true);

      } catch (error) {
        console.error('Error procesando imagen:', error);
        alert('Error al procesar la imagen. Por favor intenta con otra.');
      } finally {
        setLoadingImage(false);
      }
    }
  };

  const handleConfirmCrop = (croppedImageUrl: any) => {
    setCroppedImage(croppedImageUrl);
    setIsModalOpen(false);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    // Opcionalmente limpiar la selección si se cancela
    if (!croppedImage) {
      setSelectedImage(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const validateImageType = (file: File): boolean => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    return allowedTypes.includes(file.type);
  };

  const validateFileSize = (file: File, maxSizeMB: number): boolean => {
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    return file.size <= maxSizeBytes;
  };

  const resizeImage = (file: File, maxWidth: number = 1024, maxHeight: number = 1024): Promise<File> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new window.Image();

      img.onload = () => {
        let { width, height } = img;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            const resizedFile = new File([blob], file.name, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          }
        }, 'image/jpeg', 0.85);
      };

      img.src = URL.createObjectURL(file);
    });
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

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Contenedor del formulario */}
        <div className="md:w-1/2 p-8">
          <button
            onClick={() => router.push("/calendario")}
            className="text-rose-500 hover:underline mb-4"
          >
            ← Inicio
          </button>
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Regístrate aquí</h1>
          <div className="flex justify-center space-x-4 mb-6">
            {[1, 2, 3].map((num) => (
              <button
                key={num}
                onClick={() => step >= num && setStep(num)}
                className={`w-8 h-8 flex items-center justify-center rounded-full font-semibold text-white 
                  ${step >= num ? "bg-red-500" : "bg-gray-400"} 
                  ${step < num ? "cursor-not-allowed" : ""}`}
                disabled={step < num}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Paso 1: Información básica */}
          {step === 1 ? (
            <form onSubmit={handleSubmitStep1} className="space-y-4">
              {error1 && <p className="text-red-500">{error1}</p>}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onBlur={handleEmailBlur}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Correo electrónico"
                  required
                />
                {emailExistsError && <p className="text-red-500 text-sm mt-1">{emailExistsError}</p>}
              </div>
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Contraseña"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">Confirmar Contraseña</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Confirmar Contraseña"
                  required
                />
              </div>
              {passwordError && <p className="text-red-500">{passwordError}</p>}
              <button
                type="submit"
                className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
                disabled={!email || !password || !confirmPassword}
              >
                {loading ? "Cargando..." : "Siguiente"}
              </button>
              <button
                type="button"
                onClick={() => router.push("/login")}
                className="w-full text-sm text-rose-500 hover:underline mt-2"
              >
                ¿Ya tienes una cuenta? Inicia Sesión.
              </button>
            </form>
          ) : step === 2 ? (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              {error2 && <p className="text-red-500">{error2}</p>}
              <div>
                <label htmlFor="dni" className="block text-sm font-medium text-gray-700">DNI</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    onKeyPress={handleDniKeyPress}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Número de DNI"
                    maxLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDniSearch}
                    className="mt-1 flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                    aria-label="Buscar DNI"
                  >
                    <Search size={20} />
                  </button>
                </div>
                {loadingDni && <p className="text-blue-500">Buscando datos...</p>}
                {dniError && <p className="text-red-500">{dniError}</p>}
                {dniExistsError && <p className="text-red-500">{dniExistsError}</p>}
              </div>
              <div className="flex gap-x-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName || ''}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Juan"
                    readOnly
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName || ''}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Perez Prado"
                    readOnly
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  min={`${new Date().getFullYear() - 120}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`}
                  max={`${new Date().getFullYear() - 1}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`}
                  value={birthDate || ''}
                  readOnly
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                />
              </div>

              <div>
                <label htmlFor="gender" className="block text-sm font-medium text-gray-700">Género</label>
                <select
                  id="gender"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                >
                  <option value="">Selecciona tu género</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                </select>
              </div>
              <div>
                <label htmlFor="contactoTelefono" className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  id="contactoTelefono"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Tu número de contacto"
                />
              </div>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
              >
                Siguiente
              </button>
            </form>
          ) : step === 3 ? (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">Foto de Perfil</h2>
                <p className="text-gray-600 text-sm">Sube una foto clara para tu perfil</p>
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
                      <User size={44} className="text-gray-400" />
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
                <h3 className="text-lg font-medium text-gray-700 mb-3">Guía para foto de perfil</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Imagen de guía */}
                  <div className="bg-rose-100 rounded-lg p-3 shadow-sm">
                    <div className="aspect-square bg-rose-50 rounded-lg overflow-hidden flex items-center justify-center">
                      <div className="w-full h-full bg-white flex items-center justify-center">
                        <Image src={Hombre} alt="Tusuy Perú" className="pt-4" />
                      </div>
                    </div>
                    <p className="text-center text-sm mt-2 font-medium text-rose-600">Ejemplo ideal</p>
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

              {/* Botones de navegación */}
              <div className="flex justify-between mt-8">
                <button
                  type="submit"
                  className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
                  disabled={loading}
                >
                  {loading ? "Cargando..." : "Registrarse"}
                </button>
              </div>
            </form>
          ) : null}
        </div>
        <div className="hidden md:block md:w-1/2">
          <Image src={TusuyImage} alt="Tusuy Perú" className="w-full h-full object-cover" loader={({ src }) => src} />
        </div>
      </div>
    </div>
  );
}