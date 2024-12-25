"use client"
import React, { useState } from "react";
import useUser from "@/app/firebase/functions";

const PagoEvento = () => {
  const { user } = useUser();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [numeroTarjeta, setNumeroTarjeta] = useState("");
  const [fechaVencimiento, setFechaVencimiento] = useState("");
  const [codigoSeguridad, setCodigoSeguridad] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validación de los campos
    if (!nombre || !email || !numeroTarjeta || !fechaVencimiento || !codigoSeguridad) {
      setError("Todos los campos son obligatorios.");
      setIsSubmitting(false);
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      setError("Por favor ingresa un correo electrónico válido.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Enviando pago...", { nombre, email, numeroTarjeta, fechaVencimiento, codigoSeguridad });
      setTimeout(() => {
        alert("Pago realizado con éxito");
        setIsSubmitting(false);
      }, 1000);
    } catch (err) {
      setError("Hubo un error al procesar el pago. Intenta de nuevo.");
      console.error(err);
      setIsSubmitting(false);
    }
  };

  return user ? (
    <div className="mt-6">
      <h2 className="text-center text-xl font-semibold">Realiza el pago para tu inscripción</h2>
      <form className="mt-4" onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="nombre" className="block font-medium">Nombre</label>
          <input
            id="nombre"
            type="text"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
            placeholder="Escribe tu nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="email" className="block font-medium">Correo electrónico</label>
          <input
            id="email"
            type="email"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
            placeholder="Escribe tu correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label htmlFor="numeroTarjeta" className="block font-medium">Número de tarjeta</label>
          <input
            id="numeroTarjeta"
            type="text"
            className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
            placeholder="XXXX XXXX XXXX XXXX"
            value={numeroTarjeta}
            onChange={(e) => setNumeroTarjeta(e.target.value)}
          />
        </div>
        <div className="mb-4 flex gap-4">
          <div className="w-1/2">
            <label htmlFor="fechaVencimiento" className="block font-medium">Fecha de vencimiento</label>
            <input
              id="fechaVencimiento"
              type="text"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="MM/AA"
              value={fechaVencimiento}
              onChange={(e) => setFechaVencimiento(e.target.value)}
            />
          </div>
          <div className="w-1/2">
            <label htmlFor="codigoSeguridad" className="block font-medium">Código de seguridad</label>
            <input
              id="codigoSeguridad"
              type="text"
              className="w-full px-4 py-2 mt-2 border border-gray-300 rounded-lg"
              placeholder="CVC"
              value={codigoSeguridad}
              onChange={(e) => setCodigoSeguridad(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-red-500 text-center">{error}</p>}

        <div className="text-center">
          <button
            type="submit"
            className="px-6 py-3 mt-4 bg-red-600 text-white rounded-full hover:bg-red-700 transition duration-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Pagar"}
          </button>
        </div>
      </form>
    </div>
  ) : (
    <div className="mt-6">
      <h2 className="text-center text-lg">Debes iniciar sesión para realizar el pago</h2>
    </div>
  );
};

export default PagoEvento;
