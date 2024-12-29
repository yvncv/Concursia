"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { auth } from "@/app/firebase/config";
import useUser from "@/app/firebase/functions";

const enlaces = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/login", label: "Iniciar Sesión", requiresAuth: false },
  { href: "/create-event", label: "Registrar Evento", requiresAuth: true, requiresRole: "organizador" },
];

export default function Navbar() {
  const { user, loadingUser } = useUser();
  const router = useRouter();

  // Mientras el estado de usuario está cargando, mostramos un mensaje
  if (loadingUser) {
    return <div>Cargando...</div>;
  }

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <nav className="flex text-white text-xl w-full items-center justify-between p-4 bg-rojo fixed top-0 left-0 z-50">
      <div className="mx-auto">Tusuy Perú</div>
      <ul className="flex space-x-6 mx-auto justify-center">
        {enlaces
          .filter((link) => {
            // Ocultar "Iniciar Sesión" si el usuario está autenticado
            if (link.href === "/login" && user) return false;

            // Si requiere autenticación
            if (link.requiresAuth) {
              if (!user) return false; // Ocultar si no hay usuario autenticado

              // Si requiere un rol específico
              if (link.requiresRole) {
                return user.role === link.requiresRole; // Mostrar solo si coincide el rol
              }

              return true; // Mostrar si no requiere rol
            }

            return true; // Mostrar rutas públicas
          })
          .map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        {user && (
          <li>
            <button
              onClick={handleSignOut}
              className="bg-gray-800 hover:bg-gray-700 px-4 rounded"
            >
              Salir
            </button>
          </li>
        )}
      </ul>
    </nav>
  );
}
