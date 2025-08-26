// app/register/steps/StepGuardianInfo.tsx
"use client";

import { useState, useEffect } from "react";
import { X, AlertTriangle, Shield, Users, Baby, Check } from "lucide-react";
import { useDNIValidation } from "@/app/hooks/useDNIValidation";

interface StepGuardianInfoProps {
  participantData: {
    dni: string;
    firstName: string;
    lastName: string;
    birthDate: string;
  };
  onNext: (guardianData: {
    dni: string;
    firstName: string;
    lastName: string;
    relationship: string;
    authorized: boolean;
  }) => void;
  onBack: () => void;
}

export default function StepGuardianInfo({ participantData, onNext, onBack }: StepGuardianInfoProps) {
  // Hook para validación de DNI del apoderado
  const {
    dni: guardianDni,
    loading: loadingGuardianDni,
    error: guardianDniError,
    existsError: guardianDniExistsError,
    apiData: guardianApiData,
    isValidated: guardianIsValidated,
    validationError: guardianValidationError,
    retryCount: guardianRetryCount,
    isManualMode: guardianIsManualMode,
    canEnableManualMode: guardianCanEnableManualMode,
    setDni: setGuardianDni,
    searchDNI: searchGuardianDNI,
    validateIdentity: validateGuardianIdentity,
    cleanDNI: cleanGuardianDNI,
    enableManualMode: enableGuardianManualMode,
    handleKeyPress: handleGuardianDniKeyPress
  } = useDNIValidation({ 
    type: 'guardian', 
    participantDNI: participantData.dni 
  });

  // Estados para el apoderado
  const [guardianFirstName, setGuardianFirstName] = useState("");
  const [guardianLastName, setGuardianLastName] = useState("");
  const [guardianRelationship, setGuardianRelationship] = useState("");
  const [guardianAuthorized, setGuardianAuthorized] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

  // Validar que tenga al menos dos apellidos
  const validateLastNames = (lastName: string) => {
    const apellidos = lastName.trim().split(/\s+/);
    return apellidos.length >= 2 && apellidos.every(apellido => apellido.length > 0);
  };

  const handleValidateGuardianIdentity = () => {
    validateGuardianIdentity(guardianFirstName, guardianLastName);
  };

  const handleGuardianDniClean = () => {
    cleanGuardianDNI();
    setGuardianFirstName("");
    setGuardianLastName("");
    setGuardianRelationship("");
    setGuardianAuthorized(false);
  };

  const handleEnableGuardianManualMode = () => {
    enableGuardianManualMode();
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // Validaciones específicas para apoderado
    if (!guardianDni || guardianDni.length !== 8) {
      setError("Debes ingresar el DNI del apoderado (8 dígitos).");
      return;
    }

    if (!guardianIsValidated) {
      setError("Por favor valida la identidad del apoderado primero.");
      return;
    }

    if (!guardianFirstName.trim() || !guardianLastName.trim()) {
      setError("Debes ingresar el nombre completo del apoderado.");
      return;
    }

    if (!validateLastNames(guardianLastName)) {
      setError("El apoderado debe tener al menos dos apellidos (paterno y materno).");
      return;
    }

    if (!guardianRelationship) {
      setError("Debes seleccionar la relación con el apoderado.");
      return;
    }

    if (!guardianAuthorized) {
      setError("El apoderado debe autorizar la participación del menor.");
      return;
    }

    setLoading(true);

    setTimeout(() => {
      onNext({
        dni: guardianDni,
        firstName: guardianFirstName,
        lastName: guardianLastName,
        relationship: guardianRelationship,
        authorized: guardianAuthorized
      });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <div className="text-center mb-6">
        <div className="flex items-center justify-center space-x-2 mb-4">
          <Baby className="text-orange-600" size={24} />
          <h1 className="text-3xl font-bold text-gray-800">
            Información del Apoderado
          </h1>
        </div>
        
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 mb-6">
          <div className="flex items-center justify-center space-x-2 mb-2">
            <Users className="text-orange-600" size={20} />
            <h3 className="font-semibold text-orange-800">Participante Menor de Edad</h3>
          </div>
          <p className="text-sm text-orange-700">
            <strong>{capitalizeText(participantData.firstName)} {capitalizeText(participantData.lastName)}</strong> 
            {' '}({calculateAge(participantData.birthDate)} años) requiere autorización de un apoderado para participar.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* DNI del apoderado */}
        <div>
          <label htmlFor="guardianDni" className="block text-sm font-medium text-gray-700">
            DNI del Apoderado
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              id="guardianDni"
              value={guardianDni}
              disabled={guardianApiData !== null || guardianIsValidated}
              onChange={(e) => setGuardianDni(e.target.value)}
              onKeyPress={handleGuardianDniKeyPress}
              className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
              placeholder="DNI del apoderado"
              maxLength={8}
              required
            />
            <button
              type="button"
              onClick={handleGuardianDniClean}
              className="mt-1 flex items-center justify-center w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-md transition-colors"
              aria-label="Limpiar DNI del apoderado"
            >
              <X size={20} />
            </button>
          </div>
          
          {loadingGuardianDni && (
            <p className="text-gray-500 text-center mt-1">
              Consultando DNI del apoderado... {guardianRetryCount > 0 && `(Intento ${guardianRetryCount + 1})`}
            </p>
          )}
          
          {guardianDniError && (
            <div className="mt-2">
              <p className="text-red-500 text-center">{guardianDniError}</p>
              {guardianCanEnableManualMode && (
                <div className="mt-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <AlertTriangle className="text-yellow-600 mt-0.5" size={20} />
                    <div>
                      <p className="text-sm text-yellow-800 mb-2">
                        No pudimos validar el DNI del apoderado automáticamente. Puedes continuar manualmente.
                      </p>
                      <button
                        type="button"
                        onClick={handleEnableGuardianManualMode}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md text-sm transition-colors"
                      >
                        Continuar manualmente
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
          
          {guardianDniExistsError && (
            <p className="text-red-500 text-center mt-1">{guardianDniExistsError}</p>
          )}

          {guardianIsManualMode && (
            <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Shield className="text-blue-600" size={16} />
                <p className="text-sm text-blue-800">
                  Modo manual activado para el apoderado
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Campos de nombre del apoderado */}
        <div className={guardianApiData == null ? "hidden" : ""}>
          <div className="flex gap-x-2">
            <div>
              <label htmlFor="guardianFirstName" className="block text-sm font-medium text-gray-700">
                Nombre(s) del Apoderado
              </label>
              <input
                type="text"
                id="guardianFirstName"
                value={capitalizeText(guardianFirstName)}
                disabled={!guardianApiData || (guardianIsValidated && !guardianIsManualMode)}
                onChange={(e) => setGuardianFirstName(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
                placeholder="Nombre del apoderado"
                required
              />
            </div>
            <div>
              <label htmlFor="guardianLastName" className="block text-sm font-medium text-gray-700">
                Apellidos del Apoderado
              </label>
              <input
                type="text"
                id="guardianLastName"
                value={capitalizeText(guardianLastName)}
                disabled={!guardianApiData || (guardianIsValidated && !guardianIsManualMode)}
                onChange={(e) => setGuardianLastName(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none disabled:opacity-50"
                placeholder="Apellidos del apoderado"
                required
              />
            </div>
          </div>
          <p className="text-gray-700 text-sm justify-center align-middle text-center mt-1">
            *Ingrese nombre completo y ambos apellidos del apoderado*
          </p>
        </div>

        {/* Botón de validación del apoderado */}
        <button
          type="button"
          onClick={!guardianApiData ? searchGuardianDNI : handleValidateGuardianIdentity}
          className={`w-full px-4 py-2 ${
            !guardianApiData
              ? "bg-orange-500 hover:bg-orange-600"
              : guardianIsValidated
                ? "bg-green-500 cursor-not-allowed opacity-75"
                : "bg-green-500 hover:bg-green-600"
          } text-white rounded-md transition-colors`}
          disabled={
            !guardianDni ||
            (!guardianApiData && guardianDni.length !== 8) ||
            (guardianApiData && (!guardianFirstName || !guardianLastName)) ||
            guardianIsValidated
          }
        >
          {loadingGuardianDni
            ? "Consultando DNI..."
            : !guardianApiData
              ? "Consultar DNI del Apoderado"
              : guardianIsValidated
                ? "Datos del apoderado validados ✓"
                : "Validar datos del apoderado"}
        </button>

        {guardianValidationError && (
          <p className="text-red-500 text-sm text-center">{guardianValidationError}</p>
        )}
        {guardianIsValidated && (
          <p className="text-green-500 text-sm text-center">
            Datos del apoderado validados correctamente ✓
          </p>
        )}

        {/* Campos adicionales del apoderado - solo después de validar */}
        {guardianIsValidated && (
          <>
            {/* Relación con el menor */}
            <div>
              <label htmlFor="guardianRelationship" className="block text-sm font-medium text-gray-700">
                Relación con el participante
              </label>
              <select
                id="guardianRelationship"
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                required
              >
                <option value="">Selecciona la relación</option>
                <option value="Padre">Padre</option>
                <option value="Madre">Madre</option>
                <option value="Abuelo">Abuelo</option>
                <option value="Abuela">Abuela</option>
                <option value="Tío">Tío</option>
                <option value="Tía">Tía</option>
                <option value="Tutor">Tutor Legal</option>
                <option value="Otro">Otro</option>
              </select>
            </div>

            {/* Autorización del apoderado */}
            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl">
              <div className="flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="guardianAuthorization"
                  checked={guardianAuthorized}
                  onChange={(e) => setGuardianAuthorized(e.target.checked)}
                  className="mt-1 h-5 w-5 text-orange-600 focus:ring-orange-500 border-orange-300 rounded"
                />
                <div className="flex-1">
                  <label htmlFor="guardianAuthorization" className="text-sm text-gray-800 cursor-pointer leading-relaxed">
                    <strong className="text-orange-800">Autorización del Apoderado:</strong><br />
                    Yo, <strong className="text-gray-900">{capitalizeText(guardianFirstName)} {capitalizeText(guardianLastName)}</strong>, 
                    autorizo que <strong className="text-gray-900">{capitalizeText(participantData.firstName)} {capitalizeText(participantData.lastName)}</strong> se registre 
                    en <strong className="text-red-600">Concursia</strong>, teniendo conocimiento que será inscrito y participará en concursos de marinera.
                  </label>
                  
                  {guardianAuthorized && (
                    <div className="mt-2 flex items-center text-green-600">
                      <Check size={16} className="mr-1" />
                      <span className="text-xs font-medium">Autorización confirmada</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Información legal adicional */}
            <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Información Legal</h4>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• El apoderado es responsable de la veracidad de la información proporcionada</li>
                <li>• Esta autorización permite al menor participar en concursos organizados por Concursia</li>
                <li>• Los datos del apoderado serán almacenados de forma segura y encriptada</li>
              </ul>
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
                className="w-1/2 bg-gradient-to-r from-orange-500 to-red-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={
                  !guardianRelationship || 
                  !guardianAuthorized || 
                  loading
                }
              >
                {loading ? "Cargando..." : "Continuar"}
              </button>
            </div>
          </>
        )}
      </form>
    </>
  );
}