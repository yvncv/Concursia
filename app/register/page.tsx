"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

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
      setError("Credenciales inválidas. Intenta nuevamente.");
      console.error("Error al registrarse.", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-6 bg-white shadow-md rounded-lg">
        <h1 className="text-2xl font-semibold text-center mb-4 text-rojo">Registro</h1>
        {error && <p className="text-rojo text-center">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block font-medium mb-1">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-rojo focus:border-rojo"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block font-medium mb-1">Correo Electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-rojo focus:border-rojo"
              required
            />
          </div>
          <div>
            <label htmlFor="contacto" className="block font-medium mb-1">Teléfono</label>
            <input
              type="tel"
              id="contacto"
              value={contacto}
              onChange={(e) => setContacto(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-rojo focus:border-rojo"
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium mb-1">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-rojo focus:border-rojo"
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
            className="w-full text-sm text-rojo hover:underline mt-2"
          >
            ¿Ya tienes cuenta? Inicia sesión.
          </button>
        </form>
      </div>
    </div>
  );
}
