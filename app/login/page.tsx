"use client";

import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

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
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Usuario autenticado:", userCredential.user);
      router.push('/');
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intenta nuevamente.");
      console.error("Error al iniciar sesión:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="max-w-md w-full bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold text-center mb-6 text-rojo">Iniciar Sesión</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-rojo">{error}</p>}
          <div>
            <label htmlFor="email" className="block font-medium text-gray-700">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rojo focus:border-rojo"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-rojo focus:border-rojo"
              placeholder="********"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full block mb-0 mt-4 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
            disabled={loading}
          >
            {loading ? "Cargando..." : "Iniciar sesión"}
          </button>
        </form>
        <button
          className="w-full text-sm text-rojo hover:underline mt-2"
          onClick={() => router.push('/register')}
        >
          ¿No tienes cuenta? Regístrate aquí.
        </button>
      </div>
    </div>
  );
}
