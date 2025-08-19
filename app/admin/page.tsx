"use client";
import { useState } from "react";
import { Shield } from "lucide-react";
import CreacionMasivaDeUsuarios from "./creacionMasivaDeUsuarios";
import GeneradorTickets from "./generadorTickets";
import CreacionMasivaDeAcademias from "./creacionMasivaDeAcademias";
import CreacionMasivaDeEventos from "./creacionMasivaDeEventos";
import EncriptarDNI from "./encriptarDni";
import ListaUsuarios from "./listaUsuarios";
import ListaAcademias from "./ListaAcademias";

const modules = [
  { key: "encriptarDNI", label: "Encriptar DNI", component: <EncriptarDNI /> },
  { key: "academias", label: "Crear Academias", component: <CreacionMasivaDeAcademias /> },
  { key: "usuarios", label: "Crear Usuarios", component: <CreacionMasivaDeUsuarios /> },
  { key: "eventos", label: "Crear Eventos", component: <CreacionMasivaDeEventos /> },
  { key: "tickets", label: "Generar Tickets", component: <GeneradorTickets /> },
  { key: "listaUsuarios", label: "Lista de Usuarios", component: <ListaUsuarios /> },
  { key: "listaAcademias", label: "Lista de Academias", component: <ListaAcademias /> },
];

export default function AdminPage() {
  const [selected, setSelected] = useState("encriptarDNI");

  const selectedModule = modules.find((m) => m.key === selected);

  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8 flex gap-8">
          {/* Barra lateral */}
          <aside className="w-64 bg-white dark:bg-slate-800 rounded-2xl shadow-lg p-6 h-fit">
            <div className="flex items-center mb-8">
              <Shield className="w-8 h-8 text-blue-600 mr-2" />
              <span className="font-bold text-lg text-gray-900 dark:text-white">Admin</span>
            </div>
            <nav className="space-y-2">
              {modules.map((mod) => (
                  <button
                      key={mod.key}
                      onClick={() => setSelected(mod.key)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selected === mod.key
                              ? "bg-blue-600 text-white font-semibold"
                              : "bg-gray-100 dark:bg-slate-700 text-gray-800 dark:text-gray-200 hover:bg-blue-100 dark:hover:bg-blue-900"
                      }`}
                  >
                    {mod.label}
                  </button>
              ))}
            </nav>
          </aside>
          {/* Contenido principal */}
          <main className="flex-1 mx-auto">
            <div className="mb-8 text-center">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Herramientas de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Administra la seguridad y datos del sistema
              </p>
            </div>
            {selectedModule?.component}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Solo usuarios administradores pueden acceder a estas herramientas
              </p>
            </div>
          </main>
        </div>
      </div>
  );
}