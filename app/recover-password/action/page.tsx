"use client";
//Customizacion de email
//https://support.google.com/firebase/answer/7000714?hl=en&ref_topic=6386702&sjid=12877986704270570936-SA

import { useState, useEffect } from "react";
import {
  confirmPasswordReset
} from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import MarineraImage from "@/public/marinera.jpg";

export default function RecoverPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode');
  const oobCode = searchParams.get('oobCode');
  const handleSubmitSendPassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (!oobCode) throw Error('oobCode requerido');
      if (!mode) throw Error('mode requerido');

      if (password !== confirmPassword) throw Error('Las contraseñas deben ser iguales')

      await confirmPasswordReset(auth, oobCode, password);
    } catch (error) {
      console.error("Error al realizar el cambio de contraseña:", error);
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
            Ingresa tu nueva contraseña
          </h1>
          <form onSubmit={handleSubmitSendPassword} className="space-y-4">
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-5 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
              placeholder="Contraseña"
              required
            />

            <input
              type="password"
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-5 rounded-2xl bg-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:shadow-[0_0_20px_var(--rosado-claro)] transition-all outline-none"
              placeholder="Confirmar contraseña"
              required
            />

            <button
              type="submit"
              className="w-4/5 mx-auto block text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? 'Cargando' : "Actualizar contraseña"}
            </button>
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
