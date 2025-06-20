"use client";
import { usePathname } from "next/navigation";
import OrganizerSideBar from "./organizerSideBar/OrganizerSideBar";
import { useState, useEffect } from "react";

export default function OrganizerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Establecer el estado inicial basado en el tamaño de la pantalla
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsCollapsed(true); // Colapsar en pantallas pequeñas
    } else {
      setIsCollapsed(false); // No colapsar en pantallas grandes
    }

    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Excluir layout en rutas específicas (como detalle de eventos)
  if (pathname.startsWith("/organize/events/")) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-100">
      <OrganizerSideBar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />
      <main className="transition-all duration-300 overflow-x-auto flex-1">
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "w-[calc(100vw-4rem)]" : "w-[calc(100vw-16rem)]"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
