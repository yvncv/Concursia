'use client'

import { useState, useEffect } from "react";
import Link from "next/link";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, User } from "firebase/auth";

const enlaces = [
  { href: '/', label: 'Home', requiresAuth: false },
  { href: '/login', label: 'Iniciar Sesión', requiresAuth: false },
  // { href: '/profile', label: 'Profile', requiresAuth: true },
  // { href: '/dashboard', label: 'Dashboard', requiresAuth: true },
  { href: '/crear-evento', label: 'Registrar Evento', requiresAuth: true },
];

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return unsubscribe;
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
    <nav className="flex text-white text-xl w-full items-center justify-between p-4 bg-bgTitle text-title bg-rojo">
      <div className="mx-auto">Tusuy Perú</div>
      <ul className="flex space-x-6 mx-auto justify-center align-middle">
        {enlaces
          .filter((link) => {
            // Mostrar enlaces dependiendo del estado de autenticación
            if (link.requiresAuth && !user) {
              return false; // Ocultar si requiere autenticación y no hay usuario
            }
            if (link.href === '/' || (!link.requiresAuth && !user) || (link.requiresAuth && user)) {
              return true; // Mostrar siempre "Home", enlaces públicos o privados según el estado
            }
            return false;
          })
          .map((link) => (
            <li className="hidden sm:list-item" key={link.href}>
              <Link href={link.href}>
                {link.label}
              </Link>
            </li>
          ))}
        {user && (
          <li>
            <button
              onClick={handleSignOut}
              className="bg-gradient-to-t from-rojo to-black px-1 rounded-xl px-2"
            >
              Salir
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
