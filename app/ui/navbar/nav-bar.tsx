"use client";

import Link from "next/link";
import useUser from "@/app/firebase/functions";
import UserIcon from "@/app/ui/icons/user";
import { useState } from "react";
import { auth } from "@/app/firebase/config";
import { useRouter } from "next/navigation";

const enlaces = [
  { href: "/", label: "Home", requiresAuth: false },
  { href: "/login", label: "Iniciar Sesión", requiresAuth: false },
  { href: "/academy-events", label: "Eventos Academia", requiresAuth: true, requiresRole: "organizer" },
];

export default function Navbar() {
  const { user, loadingUser } = useUser();
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await auth.signOut();
      router.push("/login");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  if (loadingUser) {
    return <div>Cargando...</div>;
  }

  return (
    <nav className="flex text-white text-xl w-full p-4 bg-rojo fixed top-0 left-0 z-50">
      <div className="flex mx-auto items-center" onClick={router.p}>Tusuy Perú</div>
      <ul className="flex space-x-6 mx-auto justify-center items-center">
        {enlaces
          .filter((link) => {
            if (link.href === "/login" && user) return false;

            if (link.requiresAuth) {
              if (!user) return false;
              if (link.requiresRole) {
                return user.roleId === link.requiresRole;
              }
              return true;
            }

            return true;
          })
          .map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}

        {user && (
          <li className="relative">
            <div
              className="w-10 h-10 border-2 border-white rounded-full flex justify-center items-center cursor-pointer"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <UserIcon width={24} height={24} />
            </div>
            {menuOpen && (
              <div className="absolute top-full right-0 mt-2 bg-white text-black rounded shadow-lg">
                <Link href="/my-profile">
                  <div className="p-2 cursor-pointer hover:bg-gray-200">Perfil</div>
                </Link>
                <div
                  onClick={handleSignOut}
                  className="p-2 cursor-pointer hover:bg-gray-200"
                >
                  Cerrar Sesión
                </div>
              </div>
            )}
          </li>
        )}
      </ul>
    </nav>
  );
}
