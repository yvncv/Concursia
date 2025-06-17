"use client";

import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import OrganizerSideBar from "./organizerSideBar/OrganizerSideBar";

type SidebarState = "hidden" | "collapsed" | "expanded";

export default function OrganizerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [sidebarState, setSidebarState] = useState<SidebarState>("expanded");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setSidebarState("hidden");
      } else if (window.innerWidth < 1024) {
        setSidebarState("collapsed");
      } else {
        setSidebarState("expanded");
      }
    };

    handleResize(); // Inicialización
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Si estamos en una ruta de eventos específica, no mostrar sidebar
  if (pathname.startsWith("/organize/events/")) {
    return <>{children}</>;
  }

  const getMainStyles = () => {
    const baseClasses = "transition-all duration-300 ease-in-out";
    
    switch (sidebarState) {
      case "collapsed":
        return `${baseClasses} ml-16`;
      case "expanded":
        return `${baseClasses} ml-0`;
      case "hidden":
        return `${baseClasses} ml-0`;
      default:
        return `${baseClasses} ml-0`;
    }
  };

  return (
    <div className="relative min-h-screen bg-gray-50">
      {/* Botón hamburguesa para móvil */}
      {sidebarState === "hidden" && (
        <button
          onClick={() => setSidebarState("expanded")}
          className="fixed top-4 left-4 z-50 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 md:hidden hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <svg className="w-3 h-3 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
      )}

      {/* Overlay para móviles cuando el sidebar está visible */}
      {sidebarState !== "hidden" && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarState("hidden")}
        />
      )}
      
      <OrganizerSideBar 
        sidebarState={sidebarState} 
        setSidebarState={setSidebarState} 
      />
      
      <main className={getMainStyles()}>
        <div className="p-4 md:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}