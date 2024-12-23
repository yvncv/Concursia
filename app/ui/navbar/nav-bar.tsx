'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

const enlaces = [
  { href: '/', label: 'Home' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/profile', label: 'Profile' },
  { href: '/login', label: 'Iniciar Sesión' },
  { href: '/crear-evento', label: 'Registrar Evento' },
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
        {enlaces.map((link) => (
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
