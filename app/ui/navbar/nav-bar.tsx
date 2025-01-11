"use client";

import Link from "next/link";
import useUser from "@/app/firebase/functions";
import { useState } from "react";
import CalendarIcon from "../icons/calendar";
import { HomeIcon } from "../icons/home";
import { LoginIcon } from "../icons/login";
import { ProfileIcon } from "../icons/profile";
import { MenuIcon } from "../icons/menu";
import { CloseIcon } from "../icons/close";

export default function Navbar() {
  const { user, loadingUser } = useUser();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const enlaces = [
    { href: "/", label: "Home", icon: HomeIcon, requiresAuth: false },
    { href: "/login", label: "Iniciar Sesión", icon: LoginIcon, requiresAuth: false },
    { href: "/academy-events", label: "Eventos Academia", icon: CalendarIcon, requiresAuth: true, requiresRole: "organizer" },
    { href: `/user/${user?.id}`, label: "Perfil", icon: ProfileIcon, requiresAuth: true },
  ];

  if (loadingUser) {
    return (
      <div className="flex h-16 items-center justify-center bg-rojo">
        <div className="animate-pulse text-white">Cargando...</div>
      </div>
    );
  }

  const filteredLinks = enlaces.filter((link) => {
    if (link.href === "/login" && user) return false;
    if (link.requiresAuth) {
      if (!user) return false;
      if (link.requiresRole) {
        return user.roleId === link.requiresRole;
      }
      return true;
    }
    return true;
  });

  return (
    <nav className="fixed left-0 top-0 z-50 w-full bg-rojo shadow-lg">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="text-2xl font-bold text-white hover:text-gray-200">
              Tusuy Perú
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:block">
            <ul className="flex space-x-8">
              {filteredLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-2 text-white hover:text-gray-200 transition-colors duration-200 text-lg"
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-200 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <ul className="space-y-4 px-2 pb-4 pt-2">
              {filteredLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="flex items-center space-x-3 text-white hover:text-gray-200 transition-colors duration-200 text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <link.icon className="w-5 h-5" />
                    <span>{link.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}