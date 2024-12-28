"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import TusuyImage from "@/app/TusuyPeru.jpg";

export default function RegisterForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [contacto, setContacto] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!validateEmail(email)) {
      setError("Por favor ingresa un correo válido.");
      setLoading(false);
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await setDoc(doc(db, "users", user.uid), {
        name,
        contacto,
        email,
        role: "user",
        createdAt: new Date(),
      });
      alert("Registro exitoso");
      router.push("/");
    } catch (err) {
      setError("No se pudo registrar. Por favor, intenta nuevamente.");
      console.error("Error al registrarse:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#d9c0c0]">
      <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg overflow-hidden max-w-4xl w-full">
        {/* Contenedor del formulario */}
        <div className="md:w-1/2 p-8">
          <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Regístrate aquí</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="text-red-500">{error}</p>}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                placeholder="Tu nombre"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Correo electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                placeholder="Correo electrónico"
                required
              />
            </div>
            <div>
              <label htmlFor="contacto" className="block text-sm font-medium text-gray-700">Teléfono</label>
              <input
                type="tel"
                id="contacto"
                value={contacto}
                onChange={(e) => setContacto(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                placeholder="Tu número de contacto"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-rose-500 focus:border-rose-500"
                placeholder="Contraseña"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full block mb-0 mt-4 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/login")}
              className="w-full text-sm text-rose-500 hover:underline mt-2"
            >
              ¿Ya tienes cuenta? Inicia sesión.
            </button>
          </form>
        </div>

        {/* Contenedor de la imagen */}
        <div className="hidden md:block md:w-1/2">
          <Image
            src={TusuyImage}
            alt="Imagen de marinera"
            width={800}
            height={600}
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </div>
  );
}
