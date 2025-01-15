"use client";

import React, { useState } from "react";
import { Menu as MenuIcon } from "lucide-react";
import { CloseIcon } from "@/app/ui/icons/close";
import Link from "next/link";
import { usePathname } from 'next/navigation'

const AdminSideBar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname()

  const enlaces = [
    { label: "Dashboard", href: "/admin" },
    { label: "Users", href: "/admin/users" },
    { label: "Events", href: "/admin/events" },
  ];

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  return (
    <>
      {/* Botón para abrir/cerrar sidebar en pantallas pequeñas */}
      <div className="md:hidden fixed top-10 left-4 z-50">
        <button
          onClick={toggleMenu}
          className="text-white bg-black/50 p-2 rounded-full hover:bg-white hover:text-black"
          aria-label="Toggle sidebar"
        >
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed h-full bg-black/60 text-white shadow-lg transform transition-transform duration-300 ${isMenuOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 md:w-64`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1>
          <nav>
            <ul className="space-y-4">
              {enlaces.map((enlace) => (
                <li key={enlace.href}>
                  <Link
                    href={enlace.href}
                    className={`block w-full px-4 py-2 rounded-md transition ${pathname === enlace.href
                        ? "bg-white text-black font-bold"
                        : "hover:bg-white/80 hover:text-black"
                      }`}
                    onClick={() => setIsMenuOpen(false)} // Cierra el menú en pantallas pequeñas
                  >
                    {enlace.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </>
  );
};

export default AdminSideBar;
