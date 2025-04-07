"use client";
//Customizacion de email
//https://support.google.com/firebase/answer/7000714?hl=en&ref_topic=6386702&sjid=12877986704270570936-SA

import { useState } from "react";
import {
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MarineraImage from "@/public/marinera.jpg";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("Usuario autenticado:", userCredential.user);
      router.push("/calendario");
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intenta nuevamente.");
      console.error("Error al iniciar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      console.log("Correo de recuperación enviado a:", email);
    } catch (error) {
      console.error("Error al enviar el correo de recuperación:", error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 py-8">
      <div className="flex flex-col md:flex-row bg-white rounded-3xl shadow-lg overflow-hidden max-w-3xl w-full">
        {/* Contenedor del formulario */}
        <div className="md:w-1/2 p-8">
          <button
            onClick={() => router.push("/calendario")}
            className="text-rose-500 hover:underline mb-4"
          >
            ← Inicio
          </button>
          <h1 className="text-3xl font-bold mb-12 mt-10 text-center text-gray-800">
            Recupera tu contraseña
          </h1>
          {/* <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-5 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                placeholder="Correo electrónico"
                required
              />
            </div>
            <div>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-3 mb-8 px-4 py-5 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
                placeholder="Contraseña"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <a
                href="#"
                className="mb-8 text-sm text-rose-500 hover:underline"
              >
                ¿Olvidaste la contraseña?
              </a>
            </div>
            <button
              type="submit"
              className="w-4/5 mx-auto block text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Iniciar Sesión"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/register")}
              className="w-full text-sm text-rose-500 hover:underline mt-2"
            >
              ¿No tienes cuenta? Regístrate.
            </button>
          </form> */}
          <form onSubmit={handleSubmitSendEmail} className="space-y-4">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-5 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
              placeholder="Correo electrónico"
              required
            />
          </form>
        </div>

        {/* Contenedor de la imagen */}
        <div className="hidden md:block md:w-1/2">
          <Image
            src={MarineraImage}
            alt="Imagen de marinera"
            width={800}
            height={600}
            className="h-full w-full object-cover"
            loader={({ src }) => src}
          />
        </div>
      </div>
    </div>
  );
}
