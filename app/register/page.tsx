"use client";

import { useState, useEffect } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc, Timestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TusuyImage from "@/public/TusuyPeru.jpg";

export default function RegisterForm() {
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");  // Nuevo estado para confirmar la contraseña
  const [error1, setError1] = useState("");
  const [error2, setError2] = useState("");
  const [passwordError, setPasswordError] = useState("");  // Estado para mostrar el error de contraseñas no coincidentes
  const [loading, setLoading] = useState(false);
  const [dni, setDni] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [category, setCategory] = useState("");
  const [gender, setGender] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [step, setStep] = useState(1);
  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateNumber = (telephoneNumber: string) => /^(9\d{8}|[1-8]\d{7})$/.test(telephoneNumber);

  useEffect(() => {
    if (birthDate) {
      const birthYear = new Date(birthDate).getFullYear();
      determineCategory(birthYear);
    }
  }, [birthDate]);

  const determineCategory = (birthYear: number) => {
    if (birthYear >= 2021) setCategory('Baby');
    else if (birthYear >= 2018) setCategory('Pre Infante');
    else if (birthYear >= 2015) setCategory('Infante');
    else if (birthYear >= 2011) setCategory('Infantil');
    else if (birthYear >= 2007) setCategory('Junior');
    else if (birthYear >= 2003) setCategory('Juvenil');
    else if (birthYear >= 1990) setCategory('Adulto');
    else if (birthYear >= 1975) setCategory('Senior');
    else if (birthYear >= 1963) setCategory('Master');
    else setCategory('Oro');
  };

  const handleSubmitStep1 = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setError1("Por favor ingresa un correo válido.");
      return;
    }
    if (password !== confirmPassword) {  // Validación de contraseñas
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

    e.preventDefault();
    setPasswordError("");  // Limpiar el error de contraseña en este paso
    setLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        roleId: "user",
        dni,
        fullName: `${firstName} ${lastName}`,
        firstName,
        lastName,
        birthDate: Timestamp.fromDate(new Date(`${birthDate}T00:00:00`)),
        gender,
        category: category,
        email: [email, ""],
        phoneNumber: [phoneNumber, ""],
        attendedEvents: [""],
        participatedEvents: [""],
        level: "",
        academyId: "",
        createdAt: new Date(),
      });
      alert("Registro exitoso");
      router.push("/");
    } catch (err) {
      console.error("Error al registrarse:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--rosado-claro)] px-4 py-8">
      <div className="flex flex-col md:flex-row bg-[var(--blanco)] rounded-3xl shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Contenedor del formulario */}
        <div className="md:w-1/2 p-8">
          <button
            onClick={() => router.push("/")}
            className="text-rose-500 hover:underline mb-4"
          >
            ← Inicio
          </button>
          <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">Regístrate aquí</h1>
          <div className="flex justify-center space-x-4 mb-6">
            {[1, 2].map((num) => (
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
              <div className="flex gap-x-2">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">Nombre</label>
                  <input
                    type="text"
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Juan"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Apellido(s)</label>
                  <input
                    type="text"
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                    placeholder="Perez Prado"
                    required
                  />
                </div>
              </div>
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Correo electrónico"
                  required
                />
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
              {passwordError && <p className="text-red-500">{passwordError}</p>}  {/* Mostrar el error si las contraseñas no coinciden */}
              <button
                type="submit"
                className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
                disabled={!firstName || !lastName || !email || !password || !confirmPassword} // Habilitar solo si los campos están llenos
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
                <input
                  type="text"
                  id="dni"
                  value={dni}
                  onChange={(e) => setDni(e.target.value)}
                  className="w-full mt-1 px-4 py-4 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                  placeholder="Número de DNI"
                  required
                />
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
              <div>
                <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">Fecha de nacimiento</label>
                <input
                  type="date"
                  id="birthDate"
                  min={`${new Date().getFullYear() - 120}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`}
                  max={`${new Date().getFullYear() - 1}-${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${new Date().getDate().toString().padStart(2, '0')}`}
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)} // Método actualizado
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
              <button
                type="submit"
                className="w-4/5 mx-auto block mb-0 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
              >
                {loading ? "Cargando..." : "Registrarse"}
              </button>
            </form>
          ) : null}
        </div>
        <div className="hidden md:block md:w-1/2">
          <Image src={TusuyImage} alt="Tusuy Perú" className="w-full h-full object-cover" />
        </div>
      </div>
    </div>
  );
}
