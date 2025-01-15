import React, { useState } from "react";
import { MenuIcon } from "lucide-react";
import { CloseIcon } from "@/app/ui/icons/close";

interface AdminSideBarProps {
  setActiveComponent: (component: string) => void;
}

const AdminSideBar: React.FC<AdminSideBarProps> = ({ setActiveComponent }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const enlaces = [ "Dashboard",  "Users", "Events" ];

  return (
    <>
      {/* Botón para abrir/cerrar sidebar en pantallas pequeñas */}
      <div className="md:hidden fixed top-10 left-4 z-50">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white bg-black/50 p-2 rounded-full hover:bg-white hover:text-black"
          aria-label="Toggle sidebar"
        >
          {isMenuOpen ? <CloseIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed h-full bg-black/60 text-white shadow-lg transform transition-transform duration-300 ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:w-64`}
      >
        <div className="p-6">
          <h1 className="text-2xl font-bold mb-6">Panel de Administrador</h1>
          <nav>
            <ul className="space-y-4">
              {enlaces.map((enlace) => (
                <li key={enlace}>
                  <button
                    onClick={() => {
                      setActiveComponent(enlace);
                      setIsMenuOpen(false); // Cierra el menú en pantallas pequeñas
                    }}
                    className="block w-full text-left px-4 py-2 rounded-md hover:bg-white hover:text-black transition"
                  >
                    {enlace}
                  </button>
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
