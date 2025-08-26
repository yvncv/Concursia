"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase/config";

interface Step1Props {
  onNext: (data: { email: string; password: string }) => void;
}

interface PasswordStrength {
  level: 'Débil' | 'Media' | 'Fuerte' | 'Muy fuerte' | '';
  color: string;
  bg: string;
  hint: string;
}

export default function Step1BasicInfo({ onNext }: Step1Props) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [emailExistsError, setEmailExistsError] = useState("");
  const [emailExists, setEmailExists] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState<PasswordStrength>({
    level: "",
    color: "",
    bg: "",
    hint: ""
  });

  const router = useRouter();

  // Validaciones
  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const evaluatePassword = (pwd: string) => {
    let level: PasswordStrength['level'] = "";
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
    } else if (pwd.length >= 8 && !(hasNumber && (hasUpperCase || hasLowerCase))) {
      level = "Media";
      color = "text-yellow-700";
      bg = "bg-yellow-400";
      hint = "Considera números y letras para mayor seguridad.";
    } else if (pwd.length >= 8 && hasNumber && (hasUpperCase || hasLowerCase)) {
      level = "Fuerte";
      color = "text-green-700";
      bg = "bg-green-400";
      hint = "¡Contraseña fuerte!";
    } else if (pwd.length >= 8 && hasNumber && hasUpperCase && hasLowerCase && hasSpecialChar) {
      level = "Muy fuerte";
      color = "text-cyan-700";
      bg = "bg-cyan-500";
      hint = "¡Contraseña muy fuerte!";
    }

    setPasswordStrength({ level, color, bg, hint });
  };

  const checkEmailExistsInFirestore = async (emailToCheck: string) => {
    try {
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("email", "array-contains", emailToCheck));
      const querySnapshot = await getDocs(q);
      return !querySnapshot.empty;
    } catch (error) {
      console.error("Error al verificar email:", error);
      return false;
    }
  };

  // Verificar email cuando se pierde el foco
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setPasswordError("");

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo válido.");
      return;
    }

    if (password !== confirmPassword) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    if (!(passwordStrength.level === "Fuerte" || passwordStrength.level === "Muy fuerte")) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres, una letra y un número.");
      return;
    }

    if (emailExists) {
      setError("Este correo electrónico ya está registrado.");
      return;
    }

    setLoading(true);
    
    // Simular delay para UX
    setTimeout(() => {
      onNext({ email, password });
      setLoading(false);
    }, 500);
  };

  return (
    <>
      <button
        onClick={() => router.push("/calendario")}
        className="text-rose-500 hover:underline mb-4"
      >
        ← Inicio
      </button>

      <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
        Regístrate Aquí
      </h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <p className="text-red-500 text-center">{error}</p>}

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Correo electrónico
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full border-1 ${
              email !== "" && validateEmail(email) && (!emailExistsError 
                ? "border-green-500 shadow-[0_0_10px_#22c55e]" 
                : "border-red-500 shadow-[0_0_10px_#ef4444]")
            } mt-1 mb-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none`}
            placeholder="Correo electrónico"
            required
          />
          {emailExistsError && (
            <p className="text-red-500 text-sm mt-1">{emailExistsError}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Contraseña
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                evaluatePassword(e.target.value);
              }}
              className={`w-full border-1 ${
                password !== "" && (
                  passwordStrength.level === "Fuerte" 
                    ? "text-green-700 shadow-[0_0_10px_#22c55e]" 
                    : passwordStrength.level === "Muy fuerte"
                      ? "text-cyan-700 shadow-[0_0_10px_#06b6d4]"
                      : passwordStrength.level === "Media" 
                        ? "text-yellow-700 shadow-[0_0_10px_#facc14]" 
                        : "text-red-700 shadow-[0_0_10px_#ef4444]"
                )
              } mt-1 mb-1 px-4 py-4 pr-12 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden`}
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
              placeholder="Contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          
          {/* Indicador de seguridad */}
          {password && (
            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-2 rounded bg-gray-200 overflow-hidden">
                <div
                  className={`h-2 rounded ${passwordStrength.bg}`}
                  style={{
                    width:
                      passwordStrength.level === "Muy fuerte"
                        ? "100%"
                        : passwordStrength.level === "Fuerte"
                          ? "80%"
                          : passwordStrength.level === "Media"
                            ? "60%"
                            : passwordStrength.level === "Débil"
                              ? "30%"
                              : "0%",
                  }}
                />
              </div>
              <span
                className={`text-sm font-semibold ${
                  passwordStrength.level === "Muy fuerte"
                    ? "text-cyan-600"
                    : passwordStrength.level === "Fuerte"
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
          {passwordStrength.hint && (
            <p className={`text-xs ${passwordStrength.color} mt-1`}>
              {passwordStrength.hint}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Contraseña
          </label>
          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full border-1 ${
                confirmPassword !== "" && confirmPassword === password && (
                  passwordStrength.level === "Fuerte" 
                    ? "text-green-500 shadow-[0_0_10px_#22c55e]" 
                    : passwordStrength.level === "Muy fuerte"
                      ? "text-cyan-500 shadow-[0_0_10px_#06b6d4]"
                      : "text-red-500 shadow-[0_0_10px_#ef4444]"
                )
              } mt-1 mb-1 px-4 py-4 pr-12 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 transition-all outline-none [&::-ms-reveal]:hidden [&::-webkit-password-reveal-button]:hidden`}
              style={{
                WebkitAppearance: 'none',
                MozAppearance: 'textfield'
              }}
              placeholder="Confirmar Contraseña"
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
            >
              {showConfirmPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {passwordError && <p className="text-red-500 text-center">{passwordError}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={
            !email ||
            !password ||
            !confirmPassword ||
            emailExists ||
            passwordStrength.level === "Débil" ||
            passwordStrength.level === "Media" ||
            passwordStrength.level === "" ||
            loading
          }
        >
          {loading ? "Cargando..." : "Siguiente"}
        </button>

        {/* Login Link */}
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="w-full text-sm text-rose-500 hover:underline mt-2"
        >
          ¿Ya tienes una cuenta? Inicia Sesión.
        </button>
      </form>
    </>
  );
}