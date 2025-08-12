"use client";
import { Shield } from "lucide-react";
import CreacionMasivaDeUsuarios from "./creacionMasivaDeUsuarios";
import GeneradorTickets from "./generadorTickets";
import CreacionMasivaDeAcademias from "./creacionMasivaDeAcademias";
import CreacionMasivaDeEventos from "./creacionMasivaDeEventos";
import EncriptarDNI from "./encriptarDni";

export default function AdminPage() {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Herramientas de Administración
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Administra la seguridad y datos del sistema
              </p>
            </div>

            {/* Herramientas */}
            <EncriptarDNI />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <CreacionMasivaDeAcademias />
              <CreacionMasivaDeUsuarios />
              <CreacionMasivaDeEventos />
              <GeneradorTickets />
            </div>
            {/* Footer Info */}
            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Solo usuarios administradores pueden acceder a estas herramientas
              </p>
            </div>

          </div>
        </div>


      </div>
  );
}