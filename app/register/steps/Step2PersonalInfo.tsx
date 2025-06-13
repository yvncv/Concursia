// app/register/steps/Step2PersonalInfo.tsx
"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { User } from "@/app/types/userType";
import { useDNIValidation } from "@/app/hooks/useDNIValidation";

interface Step2Props {
  onNext: (data: {
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
    gender: string;
    phoneNumber: string;
    category: string;
    location: User['location'];
  }) => void;
  onBack: () => void;
}

export default function Step2PersonalInfo({ onNext, onBack }: Step2Props) {
  // Hook para validación de DNI
  const {
    dni,
    loading: loadingDni,
    error: dniError,
    existsError: dniExistsError,
    apiData,
    isValidated,
    validationError,
    setDni,
    searchDNI,
    validateIdentity,
    cleanDNI,
    handleKeyPress: handleDniKeyPress
  } = useDNIValidation();

  // Estados locales del formulario
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [gender, setGender] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [locationData, setLocationData] = useState<User['location']>({
    department: "",
    province: "",
    district: "",
  });

  // Validaciones
  const validateNumber = (telephoneNumber: string) => /^(9\d{8}|[1-8]\d{7})$/.test(telephoneNumber);

  // Determinar categoría basada en edad actual
  const determineCategory = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    
    // Ajustar si el cumpleaños no ha pasado este año
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    // Categorías basadas en edad actual
    if (age <= 2) return "Baby";           // 0-2 años
    else if (age <= 6) return "Pre-Infante";    // 3-6 años
    else if (age <= 9) return "Infante";        // 7-9 años
    else if (age <= 13) return "Infantil";      // 10-13 años
    else if (age <= 17) return "Junior";        // 14-17 años
    else if (age <= 34) return "Juvenil";       // 18-34 años
    else if (age <= 49) return "Adulto";        // 35-49 años
    else if (age <= 61) return "Senior";        // 50-61 años
    else return "Master";                       // 62+ años
  };

  // Capitalizar texto
  const capitalizeText = (text: string) => {
    if (!text) return '';

    const nonCapitalizedWords = ['de', 'del', 'la', 'las', 'el', 'los', 'y', 'e', 'o', 'u'];

    return text
      .toLowerCase()
      .split(' ')
      .map((word, index) => {
        if (index === 0 || !nonCapitalizedWords.includes(word)) {
          return word.charAt(0).toUpperCase() + word.slice(1);
        }
        return word;
      })
      .join(' ');
  };

  // Determinar categoría cuando cambia la fecha de nacimiento
  useEffect(() => {
    if (birthDate) {
      setCategory(determineCategory(birthDate));
    }
  }, [birthDate]);

  // Auto-rellenar datos cuando se valida la identidad
  useEffect(() => {
    if (isValidated && apiData) {
      setBirthDate(apiData.birthDate);
      setGender(apiData.gender);
      
      // Actualizar ubicación con datos de RENIEC (solo si existe)
      if (apiData.location) {
        setLocationData({
          department: apiData.location.department || "",
          province: apiData.location.province || "",
          district: apiData.location.district || "",
        });
      }
    }
  }, [isValidated, apiData]);

  const handleValidateIdentity = () => {
    validateIdentity(firstName, lastName);
  };

  const handleDniClean = () => {
    cleanDNI();
    setFirstName("");
    setLastName("");
    setBirthDate("");
    setGender("");
    // Limpiar también la ubicación
    setLocationData({
      department: "",
      province: "",
      district: "",
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!validateNumber(phoneNumber)) {
      setError("Por favor ingresa un número de teléfono válido.");
      return;
    }

    if (!isValidated) {
      setError("Por favor valida tu identidad primero.");
      return;
    }

    setLoading(true);

    // Simular delay para UX
    setTimeout(() => {
      onNext({
        dni,
        firstName,
        lastName,
        birthDate,
        gender,
        phoneNumber,
        category,
        location: locationData
      });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Información Personal
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* DNI section with search button */}
        <div>
          <label htmlFor="dni" className="block text-sm font-medium text-gray-700">
            DNI
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="dni"
              value={dni}
              disabled={apiData !== null || isValidated}
              onChange={(e) => setDni(e.target.value)}
              onKeyPress={handleDniKeyPress}
              className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
              placeholder="Número de DNI"
              maxLength={8}
              required
            />
            <button
              type="button"
              onClick={handleDniClean}
              className="mt-1 flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
              aria-label="Limpiar DNI"
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

        {/* Campos de nombre y apellido */}
        <div className={apiData == null ? "hidden" : ""}>
          <div className="flex gap-x-2">
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                Nombre
              </label>
              <input
                type="text"
                id="firstName"
                value={capitalizeText(firstName)}
                disabled={!apiData || isValidated}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Apellido(s)
              </label>
              <input
                type="text"
                id="lastName"
                value={capitalizeText(lastName)}
                disabled={!apiData || isValidated}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
                placeholder="Tus apellidos"
                required
              />
            </div>
          </div>
          <p className="text-gray-700 text-sm justify-center align-middle text-center mt-1">
            *Por favor, ingrese nombres y apellidos completos*
          </p>
        </div>

        {/* Botón de validación */}
        <button
          type="button"
          onClick={!apiData ? searchDNI : handleValidateIdentity}
          className={`w-full px-4 py-2 ${
            !apiData
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
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
                Fecha de nacimiento
              </label>
              <input
                type="date"
                id="birthDate"
                min={`${new Date().getFullYear() - 120}-${(new Date().getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`}
                max={`${new Date().getFullYear() - 1}-${(new Date().getMonth() + 1)
                  .toString()
                  .padStart(2, "0")}-${new Date().getDate().toString().padStart(2, "0")}`}
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                required
              />
              {category && (
                <p className="text-sm text-gray-600 mt-1">
                  Edad: {(() => {
                    const today = new Date();
                    const birth = new Date(birthDate);
                    let age = today.getFullYear() - birth.getFullYear();
                    const monthDiff = today.getMonth() - birth.getMonth();
                    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
                      age--;
                    }
                    return age;
                  })()} años - Categoría: {category}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="gender" className="block text-sm font-medium text-gray-700">
                Género
              </label>
              <select
                id="gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                required
              >
                <option value="">Selecciona tu género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
              </select>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700">
                Teléfono
              </label>
              <input
                type="tel"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                placeholder="Tu número de contacto"
                maxLength={9}
                required
              />
            </div>

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
                className="w-1/2 bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!gender || !phoneNumber || loading}
              >
                {loading ? "Cargando..." : "Siguiente"}
              </button>
            </div>
          </>
        )}
      </form>
    </>
  );
}