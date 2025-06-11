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
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import {
  Search,
  User,
  Image as LucideImage,
  X,
  Check,
  Lightbulb,
  CircleCheckBig,
} from "lucide-react";
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
  const [firstName, setFirstName] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [category, setCategory] = useState("");
  const [birthDate, setBirthDate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [step, setStep] = useState(1);
  const [emailExistsError, setEmailExistsError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [dniExistsError, setDniExistsError] = useState("");
  const [dniConsultado, setDniConsultado] = useState(false);
  const [dniConsultadoValue, setDniConsultadoValue] = useState("");
  const router = useRouter();

  const [locationData, setLocationData] = useState<LocationData>({
    department: "",
    province: "",
    district: "",
  });

  const [loadingDni, setLoadingDni] = useState(false);
  const [dniError, setDniError] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [apiData, setApiData] = useState<{
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
  } | null>(null);
  const [isValidated, setIsValidated] = useState(false);
  const [validationError, setValidationError] = useState("");

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNumber = (telephoneNumber: string) =>
    /^(9\d{8}|[1-8]\d{7})$/.test(telephoneNumber);

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

  useEffect(() => {
    const handleEmailBlur = async () => {
      if (email && validateEmail(email)) {
        const exists = await checkEmailExistsInFirestore(email);
        if (exists) {
          setEmailExistsError("Este correo electrónico ya está registrado. Por favor, utiliza otro.");
          setEmailExists(true);
        } else {
          setEmailExistsError("");
          setEmailExists(false);
        }
      }
    };

    handleEmailBlur();
  }, [email]);

  const determineCategory = (birthYear: number) => {
    if (birthYear >= 2021) setCategory("Baby");
    else if (birthYear >= 2018) setCategory("Pre-Infante");
    else if (birthYear >= 2015) setCategory("Infante");
    else if (birthYear >= 2011) setCategory("Infantil");
    else if (birthYear >= 2007) setCategory("Junior");
    else if (birthYear >= 2003) setCategory("Juvenil");
    else if (birthYear >= 1990) setCategory("Adulto");
    else if (birthYear >= 1975) setCategory("Senior");
    else if (birthYear >= 1963) setCategory("Master");
    else setCategory("Oro");
  };

  const capitalizeText = (text: string) => {
    if (!text) return "";

    // Lista de palabras que no se deben capitalizar (artículos, preposiciones, etc.)
    const nonCapitalizedWords = [
      "de",
      "del",
      "la",
      "las",
      "el",
      "los",
      "y",
      "e",
      "o",
      "u",
    ];

    return text
      .toLowerCase()
      .split(" ")
      .map((word, index) => {
        // Siempre capitalizar la primera palabra
        if (index === 0 || !nonCapitalizedWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(" ");
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

    // Validar que la contraseña sea fuerte antes de continuar
    if (passwordStrength.level !== "Fuerte") {
      setPasswordError(
        "La contraseña debe tener al menos 6 caracteres y un número."
      );
      return;
    }
    setPasswordError(""); // Limpiar errores si todo está bien
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
      setDniExistsError(
        "Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión."
      );
      return;
    }

    setPasswordError("");
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      let profileImageUrl = await getDownloadURL(
        gender == "Masculino"
          ? storageRef(storage, "users/dafault-male.JPG")
          : storageRef(storage, "users/dafault-female.JPG")
      );
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
          participant: {
            // campo con informacion del usuario si es participante
            category: category, // eventos en los que participó
          }, // id de la academia a la que pertenece // eventos a los que asistió
        },
        email: [email],
        phoneNumber: [phoneNumber],
        location: {
          department: locationData.department,
          province: locationData.province,
          district: locationData.district,
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
    if (e.key === "Enter") {
      e.preventDefault();
      handleDniSearch();
    }
  };

  const fetchReniecData = async (dni: string) => {
    setLoadingDni(true);
    setDniError("");
    setDniExistsError("");
    setIsValidated(false);
    setValidationError("");

    try {
      const dniExists = await checkDniExistsInFirestore(dni);
      if (dniExists) {
        setDniExistsError(
          "Este DNI ya está registrado. Por favor, intenta con otro o inicia sesión."
        );
        setLoadingDni(false);
        return;
      }

      const response = await axios.post(
        "https://api.consultasperu.com/api/v1/query",
        {
          token:
            "24068bb2bf38ddc53748557196cf438c54f6d7b227623c99dbad83599d70b505",
          type_document: "dni",
          document_number: dni,
        }
      );

      if (response.data.success && response.data.data) {
        console.log("Datos obtenidos de RENIEC:", response.data.data);
        // En lugar de establecer los campos directamente, guardamos los datos para validación
        setApiData({
          firstName: response.data.data.full_name
            .split(",")[1]
            .trim()
            .toUpperCase(),
          lastName: response.data.data.full_name
            .split(",")[0]
            .trim()
            .toUpperCase(),
          birthDate: response.data.data.date_of_birth || "",
          gender: response.data.data.gender,
        });
        setDniConsultado(true);
        setDniConsultadoValue(dni);

        // No actualizamos los campos automáticamente
        // Los datos serán validados cuando el usuario haga clic en el botón de validación
      } else {
        setDniConsultado(false);
        setDniConsultadoValue("");
        setDniError("No se encontró el DNI.");
      }
    } catch (error) {
      setDniError("Error al consultar el DNI.");
    } finally {
      setLoadingDni(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault(); // Añade esta línea
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const imageUrl = URL.createObjectURL(file);
      setSelectedImage(imageUrl);
      setIsModalOpen(true);
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
        fileInputRef.current.value = "";
      }
    }
  };

  const uploadProfileImage = async (imageFile: any, userId: any) => {
    try {
      // Convert base64 to blob if needed
      let imageToUpload = imageFile;

      if (typeof imageFile === "string" && imageFile.startsWith("data:")) {
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
        throw new Error(
          "Error uploading profile image: An unknown error occurred"
        );
      }
    }
  };

  const [passwordStrength, setPasswordStrength] = useState<{
    level: string;
    color: string;
    bg: string;
  }>({ level: "", color: "", bg: "" });
  const [passwordHint, setPasswordHint] = useState("");

  const evaluatePassword = (pwd: string) => {
    let level = "";
    let color = "";
    let hint = "";
    let bg = "";

    const hasNumber = /\d/.test(pwd);
    const hasUpperCase = /[A-Z]/.test(pwd);
    const hasLowerCase = /[a-z]/.test(pwd);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pwd);

    if (pwd.length === 0) {
      level = "";
      color = "";
      bg = "";
      hint = "";
    } else if (pwd.length < 8 || !hasNumber || !hasUpperCase || !hasLowerCase) {
      level = "Débil";
      color = "text-red-700";
      bg = "bg-red-400";
      hint = "Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número.";
    } else if (pwd.length >= 8 && hasNumber && hasUpperCase && hasLowerCase && !hasSpecialChar) {
      level = "Media";
      color = "text-yellow-700";
      bg = "bg-yellow-400";
      hint = "Agrega al menos un carácter especial para mayor seguridad.";
    } else if (pwd.length >= 8 && hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar) {
      level = "Fuerte";
      color = "text-green-700";
      bg = "bg-green-500";
      hint = "¡Contraseña fuerte!";
    }

    setPasswordStrength({ level, color, bg });
    setPasswordHint(hint);
  };

  const validateIdentity = () => {
    if (!apiData) {
      setValidationError("Por favor, ingresa primero tu DNI para validar tus datos.");
      return;
    }

    if (dni !== dniConsultadoValue) {
      setIsValidated(false);
      setValidationError("El DNI ingresado ha sido modificado. Vuelve a consultar los datos.");
      return;
    }

    const userFirstName = firstName.trim().toUpperCase();
    const userLastName = lastName.trim().toUpperCase();

    if (
      userFirstName === apiData.firstName &&
      userLastName === apiData.lastName
    ) {
      setIsValidated(true);
      setDniConsultado(true);
      setBirthDate(apiData.birthDate);
      setGender(apiData.gender);
      setValidationError("");
    } else {
      setIsValidated(false);
      setDniConsultado(true);
      setValidationError("Los datos ingresados no coinciden con los registrados en RENIEC.");
    }
  };

  const handleDniClean = () => {
    setApiData(null);
    setIsValidated(false);
    setDniConsultado(false);
    setDniConsultadoValue("");
    setDniError("");
    setValidationError("");
    setDni("");
  }

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
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
            Regístrate aquí
          </h1>
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
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Correo electrónico
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full border-1 ${email != "" && validateEmail(email) && (!emailExistsError ? "border-green-500 shadow-[0_0_10px_#22c55e]" : "border-red-500 shadow-[0_0_10px_#ef4444]")} mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none`}
                  placeholder="Correo electrónico"
                  required
                />
                {emailExistsError && (
                  <p className="text-red-500 text-sm mt-1">
                    {emailExistsError}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Contraseña
                </label>
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    evaluatePassword(e.target.value);
                  }}
                  className={`w-full border-1 ${password != "" && (passwordStrength.level === "Fuerte" ? "text-green-700 shadow-[0_0_10px_#22c55e]" : passwordStrength.level === "Media" ? "text-yellow-700 shadow-[0_0_10px_#facc14]" : "text-red-700 shadow-[0_0_10px_#ef4444]")} mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none`}
                  placeholder="Contraseña"
                  required
                />
                {/* Indicador de seguridad */}
                {password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden">
                      <div
                        className={`h-2 rounded ${passwordStrength.bg}`}
                        style={{
                          width:
                            passwordStrength.level === "Fuerte"
                              ? "100%"
                              : passwordStrength.level === "Media"
                                ? "60%"
                                : passwordStrength.level === "Débil"
                                  ? "30%"
                                  : "0%",
                        }}
                      />
                    </div>
                    <span
                      className={`text-sm font-semibold ${passwordStrength.level === "Fuerte"
                        ? "text-green-600"
                        : passwordStrength.level === "Media"
                          ? "text-yellow-600"
                          : passwordStrength.level === "Débil"
                            ? "text-red-600"
                            : ""
                        }`}
                    >
                      {passwordStrength.level}
                    </span>
                  </div>
                )}
                {/* Mensaje de ayuda */}
                {passwordHint && (
                  <p className={`text-xs ${passwordStrength.color} mt-1`}>{passwordHint}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700"
                >
                  Confirmar Contraseña
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full border-1 ${confirmPassword != "" && (passwordStrength.level === "Fuerte" && confirmPassword === password ? "text-green-500 shadow-[0_0_10px_#22c55e]" : "text-red-500 shadow-[0_0_10px_#ef4444]")} mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none`}
                  placeholder="Confirmar Contraseña"
                  required
                />
              </div>
              {passwordError && <p className="text-red-500">{passwordError}</p>}
              <button
                type="submit"
                className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
                disabled={
                  !email ||
                  !password ||
                  !confirmPassword ||
                  emailExists ||
                  passwordStrength.level !== "Fuerte"
                }
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

              {/* DNI section with search button */}
              <div>
                <label
                  htmlFor="dni"
                  className="block text-sm font-medium text-gray-700"
                >
                  DNI
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    id="dni"
                    value={dni}
                    disabled={dniConsultado || isValidated}
                    onChange={(e) => setDni(e.target.value)}
                    onKeyPress={handleDniKeyPress}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Número de DNI"
                    maxLength={8}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleDniClean}
                    className="mt-1 flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
                    aria-label="Buscar DNI"
                  >
                    <X size={20} />
                  </button>
                </div>
                {loadingDni && (
                  <p className="text-gray-500 text-center mt-1">Buscando datos...</p>
                )}
                {dniError && <p className="text-red-500 text-center mt-1">{dniError}</p>}
                {dniExistsError && (
                  <p className="text-red-500 text-center mt-1">{dniExistsError}</p>
                )}
              </div>

              {/* Ahora los campos son editables */}
              <div className={apiData == null ? "hidden" : ""}>

                <div className="flex gap-x-2">
                  <div>
                    <label
                      htmlFor="firstName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Nombre
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      value={capitalizeText(firstName)}
                      disabled={!apiData || isValidated}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                      placeholder="Tu nombre"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="lastName"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Apellido(s)
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      value={capitalizeText(lastName)}
                      disabled={!apiData || isValidated}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                      placeholder="Tus apellidos"
                      required
                    />
                  </div>
                </div>
                <p className="text-gray-700 text-sm justify-center align-middle text-center mt-1">*Por favor, ingrese nombres y apellidos completos*</p>
              </div>

              {/* Botón de validación */}
              <button
                type="button"
                onClick={!apiData ? handleDniSearch : validateIdentity}
                className={`w-full px-4 py-2 ${!apiData
                  ? "bg-red-500 hover:bg-red-600"
                  : isValidated
                    ? "bg-green-500 cursor-not-allowed opacity-75"
                    : "bg-green-500 hover:bg-green-600"
                  } text-white rounded-md transition-colors`}
                disabled={
                  !dni ||
                  (!apiData && dni.length !== 8) ||
                  (apiData && (!firstName || !lastName)) ||
                  isValidated
                }
              >
                {loadingDni
                  ? "Consultando DNI..."
                  : !apiData
                    ? "Consultar DNI"
                    : isValidated
                      ? "Datos validados ✓"
                      : "Validar datos"}
              </button>

              {validationError && (
                <p className="text-red-500 text-sm text-center">{validationError}</p>
              )}
              {isValidated && (
                <p className="text-green-500 text-sm text-center">
                  Datos validados correctamente ✓
                </p>
              )}

              {/* El resto de los campos solo son accesibles si los datos están validados */}
              {isValidated && (
                <>
                  <div>
                    <label
                      htmlFor="birthDate"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Fecha de nacimiento
                    </label>
                    <input
                      type="date"
                      id="birthDate"
                      min={`${new Date().getFullYear() - 120}-${(
                        new Date().getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${new Date()
                          .getDate()
                          .toString()
                          .padStart(2, "0")}`}
                      max={`${new Date().getFullYear() - 1}-${(
                        new Date().getMonth() + 1
                      )
                        .toString()
                        .padStart(2, "0")}-${new Date()
                          .getDate()
                          .toString()
                          .padStart(2, "0")}`}
                      value={birthDate}
                      onChange={(e) => setBirthDate(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="gender"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Género
                    </label>
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
                    <label
                      htmlFor="contactoTelefono"
                      className="block text-sm font-medium text-gray-700"
                    >
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="contactoTelefono"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                      placeholder="Tu número de contacto"
                      maxLength={9}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
                    disabled={!gender || !phoneNumber}
                  >
                    Siguiente
                  </button>
                </>
              )}
            </form>
          ) : step === 3 ? (
            <form onSubmit={handleSubmitStep2} className="space-y-4">
              <div className="text-center mb-6">
                <h2 className="text-xl font-semibold text-gray-800">
                  Foto de Perfil
                </h2>
                <p className="text-gray-600 text-sm">
                  Sube una foto clara para tu perfil
                </p>
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
                  Seleccionar foto
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
                        <Image src={Hombre} alt="Tusuy Perú" className="pt-4" />
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
          <Image
            src={TusuyImage}
            alt="Tusuy Perú"
            className="w-full h-full object-cover"
            loader={({ src }) => src}
          />
        </div>
      </div>
    </div>
  );
}
