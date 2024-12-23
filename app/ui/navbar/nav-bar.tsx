'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

// Arreglo con los enlaces, separados por tipo de usuario
const enlaces = [
  { href: '/login', label: 'Iniciar Sesión', requiresAuth: false },
  { href: '/profile', label: 'Profile', requiresAuth: true },
  { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/crear-evento', label: 'Registrar Evento', requiresAuth: true },
]

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Escuchar cambios en el estado de autenticación
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Actualiza el estado del usuario
    });
    return unsubscribe; // Limpia el listener cuando el componente se desmonta
  }, []);

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push('/login');
      console.log("Sesión cerrada exitosamente");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="flex items-center justify-between p-4 bg-bgTitle text-title">
      <div className="text-lg font-bold">Tusuy Perú</div>
      <ul className="flex space-x-6">
        <li className='hidden sm:list-item'>
          <Link href='/'>
            Home
          </Link>
        </li>
        {enlaces
          .filter((link) => {
            // Mostrar enlaces dependiendo si el usuario está logueado o no
            if (link.requiresAuth && !user) {
              return false; // Ocultar si requiere autenticación y no hay usuario
            }
            if (!link.requiresAuth && user) {
              return false; // Ocultar si no requiere autenticación pero hay usuario
            }
            return true; // Mostrar todos los demás enlaces
          })
          .map((link) => (
            <li className='hidden sm:list-item' key={link.href}>
              <Link href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        {user && (
          <li>
            <button
              onClick={handleSignOut}
              className="bg-red-600 p-1 border rounded-lg"
            >
              Salir
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
