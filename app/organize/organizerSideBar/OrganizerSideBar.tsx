"use client";

import React, { useCallback } from "react";
import {
  LayoutDashboard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Building2 as Academy,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import useUser from "@/app/hooks/useUser";

type SidebarState = "hidden" | "collapsed" | "expanded";

interface OrganizerSideBarProps {
  sidebarState: SidebarState;
  setSidebarState: React.Dispatch<React.SetStateAction<SidebarState>>;
}

const OrganizerSideBar: React.FC<OrganizerSideBarProps> = ({
  sidebarState,
  setSidebarState,
}) => {
  const pathname = usePathname();
  const { user } = useUser();

  // Verificar si el usuario es organizador de la academia específica autorizada
  const isAuthorizedAcademyOrganizer = user?.roleId === "organizer" && 
                                      user?.marinera?.academyId === "SSHmOq0voJb1rJFsoTXA";

  const toggleSidebar = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    
    if (isMobile) {
      // En mobile, toggle entre hidden y expanded
      setSidebarState((prev) => prev === "hidden" ? "expanded" : "hidden");
    } else {
      // En desktop, toggle entre collapsed y expanded
      setSidebarState((prev) => prev === "collapsed" ? "expanded" : "collapsed");
    }
  }, [setSidebarState]);

  const closeSidebar = useCallback(() => {
    setSidebarState("hidden");
  }, [setSidebarState]);

  const handleLinkClick = useCallback(() => {
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      closeSidebar();
    }
  }, [closeSidebar]);

  // Detectar si es mobile para mostrar overlay
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  // Definir los elementos del menú dinámicamente
  const getMenuItems = () => {
    const baseItems = [
      { label: "Dashboard", href: "/organize", icon: <LayoutDashboard size={20} /> },
      { label: "Academia", href: "/organize/academy", icon: <Academy size={20} /> },
    ];

    // Solo agregar "Eventos" si es organizador de la academia específica autorizada
    if (isAuthorizedAcademyOrganizer) {
      baseItems.push({
        label: "Eventos",
        href: "/organize/events",
        icon: <Calendar size={20} />
      });
    }

    return baseItems;
  };

  const menuItems = getMenuItems();

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
          ${
            sidebarState === "hidden"
              ? "-translate-x-full"
              : sidebarState === "expanded"
              ? "w-16 sm:w-20"
              : "w-64 sm:w-72"
          }
          ${sidebarState !== "hidden" ? "translate-x-0" : ""}
          border-r border-gray-200 dark:border-gray-700
        `}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarState === "collapsed" && (
            <h1 className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 truncate">
              {user?.roleId === "organizer" ? "Organizador" : "Personal (Staff)"}
            </h1>
          )}
          
          {/* Indicador de academia asignada */}
          {sidebarState === "collapsed" && user?.marinera?.academyName && (
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate">
              {user.marinera.academyName}
            </div>
          )}
          
          {/* Botón de cerrar (X) - visible en mobile cuando está expandido */}
          {isMobile && sidebarState === "collapsed" && (
            <button
              onClick={closeSidebar}
              className="p-1 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* Botón colapsar/expandir - solo visible en desktop */}
        {!isMobile && (
          <button
            onClick={toggleSidebar}
            className="absolute -right-3 top-6 bg-white dark:bg-gray-800 rounded-full p-1.5 shadow-md border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors z-50"
          >
            {sidebarState === "expanded" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {/* Contenido del sidebar */}
        <div className="p-3 sm:p-4 pt-2">
          <nav>
            <ul className="space-y-1 sm:space-y-2">
              {menuItems.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group ${
                      pathname === item.href
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    } ${
                      sidebarState === "expanded" 
                        ? "justify-center" 
                        : "justify-start"
                    }`}
                    title={sidebarState === "expanded" ? item.label : ""}
                  >
                    <div className={`flex-shrink-0 transition-transform duration-200 ${
                      sidebarState === "expanded" ? "" : "group-hover:scale-110"
                    }`}>
                      {item.icon}
                    </div>
                    {sidebarState === "collapsed" && (
                      <span className="ml-3 text-sm sm:text-base font-medium truncate">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Indicador activo para estado collapsed */}
                    {sidebarState === "expanded" && pathname === item.href && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-red-600 dark:bg-red-400 rounded-r"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Mensaje informativo si no es organizador de la academia autorizada */}
            {!isAuthorizedAcademyOrganizer && sidebarState === "collapsed" && (
              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="text-xs text-yellow-600 dark:text-yellow-400">
                  <strong>Nota:</strong> La gestión de eventos está disponible solo para academias autorizadas.
                </div>
              </div>
            )}
          </nav>
        </div>

        {/* Footer del sidebar */}
        {sidebarState === "collapsed" && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {user?.firstName || "Usuario"}
            </div>
            {user?.marinera?.academyName && (
              <div className="text-xs text-blue-600 dark:text-blue-400 text-center mt-1">
                {user.marinera.academyName}
              </div>
            )}
          </div>
        )}
      </aside>
    </>
  );
};

export default OrganizerSideBar;