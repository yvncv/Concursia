"use client";

import Link from "next/link";
import useUser from "@/app/firebase/functions";
import UserIcon from "@/app/ui/icons/user";

const enlaces = [
  { href: "/login", label: "Iniciar Sesión", requiresAuth: false },
  { href: "/academy-events", label: "Eventos Academia", requiresAuth: true, requiresRole: "organizer" },
  { href: "/my-profile", label: <div className="w-10 h-10 border-2 border-white rounded-full flex justify-center items-center"><UserIcon width={24} height={24} /></div>, requiresAuth: true },
];

export default function Navbar() {
  const { user, loadingUser } = useUser();

  // Mientras el estado de usuario está cargando, mostramos un mensaje
  if (loadingUser) {
    return <div>Cargando...</div>;
  }

  return (
    <nav className="items-center flex text-white text-xl w-full p-4 bg-rojo fixed top-0 left-0 z-50">
      <div className="mx-auto">
        <Link href="/">Tusuy Perú</Link>
      </div>
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
                return user.roleId === link.requiresRole; // Mostrar solo si coincide el rol
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
      </ul>
    </nav>
  );
}
