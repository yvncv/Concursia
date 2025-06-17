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

  // Removemos la lógica de handleResize que interfería con el control manual
  // El resize ahora se maneja completamente desde el layout padre

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

  return (
    <>
      <aside
        className={`fixed top-0 left-0 z-50 h-full bg-white dark:bg-gray-800 shadow-lg transition-all duration-300 ease-in-out
          ${
            sidebarState === "hidden"
              ? "-translate-x-full"
              : sidebarState === "collapsed"
              ? "w-16 sm:w-20"
              : "w-64 sm:w-72"
          }
          ${sidebarState !== "hidden" ? "translate-x-0" : ""}
          border-r border-gray-200 dark:border-gray-700
        `}
      >
        {/* Header del sidebar */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-gray-200 dark:border-gray-700">
          {sidebarState === "expanded" && (
            <h1 className="text-lg sm:text-xl font-bold text-red-700 dark:text-red-400 truncate">
              {user?.roleId === "organizer" ? "Organizador" : "Staff"}
            </h1>
          )}
          
          {/* Botón de cerrar (X) - visible en mobile cuando está expandido */}
          {isMobile && sidebarState === "expanded" && (
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
            {sidebarState === "collapsed" ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}

        {/* Contenido del sidebar */}
        <div className="p-3 sm:p-4 pt-2">
          <nav>
            <ul className="space-y-1 sm:space-y-2">
              {[
                { label: "Dashboard", href: "/organize", icon: <LayoutDashboard size={20} /> },
                { label: "Academia", href: "/organize/academy", icon: <Academy size={20} /> },
                { label: "Eventos", href: "/organize/events", icon: <Calendar size={20} /> },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleLinkClick}
                    className={`flex items-center px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all duration-200 group ${
                      pathname === item.href
                        ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 font-semibold shadow-sm"
                        : "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
                    } ${
                      sidebarState === "collapsed" 
                        ? "justify-center" 
                        : "justify-start"
                    }`}
                    title={sidebarState === "collapsed" ? item.label : ""}
                  >
                    <div className={`flex-shrink-0 transition-transform duration-200 ${
                      sidebarState === "collapsed" ? "" : "group-hover:scale-110"
                    }`}>
                      {item.icon}
                    </div>
                    {sidebarState === "expanded" && (
                      <span className="ml-3 text-sm sm:text-base font-medium truncate">
                        {item.label}
                      </span>
                    )}
                    
                    {/* Indicador activo para estado collapsed */}
                    {sidebarState === "collapsed" && pathname === item.href && (
                      <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-red-600 dark:bg-red-400 rounded-r"></div>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        {/* Footer del sidebar (opcional) */}
        {sidebarState === "expanded" && (
          <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {user?.firstName || "Usuario"}
            </div>
          </div>
        )}
      </aside>
    </>
  );
};

export default OrganizerSideBar;