"use client";
import React, { useState, useEffect } from "react";
import AdminSideBar from "./adminSideBar/AdminSideBar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);

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

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSideBar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      <main className="transition-all duration-300 overflow-x-auto flex-1">
        <div
          className={`transition-all duration-300 ${
            isCollapsed ? "pl-16" : "pl-64"
          }`}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
