"use client";

import { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/app/firebase/config";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function RegisterForm() {
  const [name, setName] = useState("");
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await assignRole(user.uid); 
      alert("Registro exitoso");
      router.push("/"); 
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intenta nuevamente.");
      console.error("Error al registrarse:", err);
    } finally {
      setLoading(false);
    }
  };

  const assignRole = async (userId: string) => {
    try {
      const userRef = doc(db, "users", userId);
      if (email.includes("@admin.")) {
        await setDoc(userRef, {
          name: name,
          email: email,
          role: "admin",
          createdAt: new Date(),
        });
      } else {
        await setDoc(userRef, {
          name: name,
          email: email,
          role: "user",
          createdAt: new Date(),
        });
      }
      console.log("Rol asignado correctamente");
    } catch (err) {
      console.error("Error al asignar rol:", err);
      throw new Error("No se pudo asignar el rol.");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background">
      <div className="max-w-md p-4 bg-background rounded shadow-md border border-cyan-50">
        <h1 className="text-2xl font-bold text-center mb-6 text-foreground">Registro</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-foreground">Nombre</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded border-foreground shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="John Doe"
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground">Correo electrónico</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded border-foreground shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="tu@correo.com"
              required
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded border-foreground shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="********"
              required
            />
          </div>
          <div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-foreground py-2 px-4 rounded hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? "Cargando..." : "Registrarse"}
            </button>
          </div>
          <button
            className="mt-4 text-blue-500 hover:underline"
            onClick={() => router.push("/login")}
          >
            ¿Ya tienes cuenta? Inicia sesión.
          </button>
        </form>
      </div>
    </div>
  );
}
