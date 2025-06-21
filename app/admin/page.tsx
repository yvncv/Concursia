"use client";
import { encryptAllDnisIfNeeded } from "../utils/encryptAllDnisIfNeeded";
import { decryptAllDnis } from "../utils/decryptAllDnis";
import { hashAllDnis } from "../utils/hashAllDnis";
import { useState } from "react";
import { Shield, ShieldCheck, Lock, Unlock, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import { findUserByDni } from "./findUserByDni";

export default function AdminDniEncrypter() {
  const [status, setStatus] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [operation, setOperation] = useState<"encrypt" | "decrypt" | "hash" | null>(null);

  const handleEncrypt = async () => {
    setIsLoading(true);
    setOperation("encrypt");
    setStatus("Iniciando proceso de encriptación...");

    try {
      await encryptAllDnisIfNeeded();
      setStatus("Todos los DNIs han sido encriptados exitosamente");
    } catch {
      setStatus("Error al encriptar los DNIs");
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const handleDecrypt = async () => {
    setIsLoading(true);
    setOperation("decrypt");
    setStatus("Iniciando proceso de desencriptación...");

    try {
      await decryptAllDnis();
      setStatus("Todos los DNIs han sido desencriptados exitosamente");
    } catch {
      setStatus("Error al desencriptar los DNIs");
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const handleHash = async () => {
    setIsLoading(true);
    setOperation("hash");
    setStatus("Iniciando proceso de hasheo de DNIs...");

    try {
      await hashAllDnis();
      setStatus("Todos los DNIs han sido hasheados exitosamente");
    } catch {
      setStatus("Error al hashear los DNIs");
    } finally {
      setIsLoading(false);
      setOperation(null);
    }
  };

  const getStatusIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-5 h-5 animate-spin" />;
    }
    if (status.includes("exitosamente")) {
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    }
    if (status.includes("Error")) {
      return <AlertTriangle className="w-5 h-5 text-red-500" />;
    }
    return null;
  };

  const [dni, setDni] = useState("")
  const [user, setUser] = useState<any>(null)

  const handleSearch = async () => {
    const result = await findUserByDni(dni)
    setUser(result)
  }

  const getStatusColor = () => {
    if (status.includes("exitosamente")) return "text-green-700 bg-green-50 border-green-200";
    if (status.includes("Error")) return "text-red-700 bg-red-50 border-red-200";
    if (isLoading) return "text-blue-700 bg-blue-50 border-blue-200";
    return "text-gray-700 bg-gray-50 border-gray-200";
  };

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
              Herramienta de Encriptación DNI
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Administra la seguridad de los datos sensibles del sistema
            </p>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-semibold text-amber-800 dark:text-amber-200 mb-1">
                  ⚠️ Operación Crítica
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Esta herramienta modifica datos sensibles en la base de datos. Asegúrate de tener respaldos antes de proceder.
                </p>
              </div>
            </div>
          </div>
          {/* //////////////////////////////////////////////// */}
          <div className="max-w-md mx-auto bg-gray-800 shadow-lg rounded-lg p-6 space-y-6 m-8">
            <input
              type="text"
              placeholder="Ingresa DNI"
              value={dni}
              onChange={(e) => setDni(e.target.value)}
              className="border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-3 rounded-lg w-full text-gray-700 placeholder-gray-400 transition-all duration-200"
            />

            <button
              onClick={handleSearch}
              className="bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white font-medium px-6 py-3 rounded-lg w-full transition-colors duration-200 shadow-md hover:shadow-lg"
            >
              Buscar
            </button>

            {user && (
              <div className="mt-6 border-2 border-gray-200 bg-gray-50 p-4 rounded-lg shadow-sm">
                <p className="text-gray-700 mb-2">
                  <strong className="text-gray-900">Nombre:</strong> {user.firstName}
                </p>
                <p className="text-gray-700">
                  <strong className="text-gray-900">Correo:</strong> {user.email}
                </p>
                {/* ...otros datos */}
              </div>
            )}
          </div>
          {/* //////////////////////////////////////////////// */}

          {/* Action Cards */}
          <div className="grid gap-6 md:grid-cols-2 mb-8">

            {/* Encrypt Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                    <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Encriptar DNIs
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Protege los documentos de identidad
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleEncrypt}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isLoading && operation === "encrypt"
                    ? "bg-blue-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 active:scale-95 hover:shadow-lg"
                    } text-white disabled:opacity-70`}
                >
                  {isLoading && operation === "encrypt" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Encriptando...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Encriptar Todos los DNIs</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Decrypt Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Unlock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Desencriptar DNIs
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Revierte la encriptación aplicada
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDecrypt}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isLoading && operation === "decrypt"
                    ? "bg-emerald-400 cursor-not-allowed"
                    : "bg-emerald-600 hover:bg-emerald-700 active:scale-95 hover:shadow-lg"
                    } text-white disabled:opacity-70`}
                >
                  {isLoading && operation === "decrypt" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Desencriptando...</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5" />
                      <span>Desencriptar Todos los DNIs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
            {/* Hash Card */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-lg border border-gray-100 dark:border-slate-700 overflow-hidden">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                    <ShieldCheck className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Generar Hash DNI
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Crea una firma segura del DNI desencriptado
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleHash}
                  disabled={isLoading}
                  className={`w-full flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${isLoading && operation === "hash"
                    ? "bg-purple-400 cursor-not-allowed"
                    : "bg-purple-600 hover:bg-purple-700 active:scale-95 hover:shadow-lg"
                    } text-white disabled:opacity-70`}
                >
                  {isLoading && operation === "hash" ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Hasheando...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Hashear todos los DNIs</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Status Display */}
          {status && (
            <div className={`rounded-xl border p-4 transition-all duration-300 ${getStatusColor()}`}>
              <div className="flex items-center space-x-3">
                {getStatusIcon()}
                <div className="flex-1">
                  <p className="font-medium">
                    {status}
                  </p>
                  {isLoading && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full animate-pulse" style={{ width: "60%" }}></div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Footer Info */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Solo usuarios administradores pueden acceder a esta herramienta
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}