"use client";
//Customizacion de email
//https://support.google.com/firebase/answer/7000714?hl=en&ref_topic=6386702&sjid=12877986704270570936-SA

import { useState, useEffect, useRef } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MarineraImage from "@/public/marinera.jpg";

export default function RecoverPassword() {
  const [email, setEmail] = useState("");

  const [timer, setTimer] = useState(60);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>(undefined);

  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const handleSubmitSendEmail = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await sendPasswordResetEmail(auth, email);
      startTimer();
    } catch (error) {
      console.error("Error al enviar el correo de recuperación:", error);
    }
  };

  // Inicia el temporizador al enviar el correo electrónico y no enviarlo de nuevo en 60 segundos
  const startTimer = () => {
    setLoading(true);
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev === 0) {
          setLoading(false);
          setIsRunning(false);
          return 60;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Elimina el event listener al desmontar el componente
  useEffect(() => {
    if (!isRunning) return;
    return () => clearInterval(intervalRef.current);
  }, [isRunning]);

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
            <button
              type="submit"
              className="w-4/5 mx-auto block text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-4 px-4 rounded-2xl hover:shadow-2xl hover:cursor-pointer transition-all disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (
                <span>Revisa tu correo electrónico. {timer}</span>
              ) : (
                "Enviar confirmación"
              )}
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
