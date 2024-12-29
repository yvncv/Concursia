"use client";

import { useState } from "react";
import { db } from "../firebase/config";
import { setDoc, doc } from "firebase/firestore";

const CreateEvent = () => {
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [direccion, setDireccion] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [calle, setCalle] = useState("");
  const [coordenadas, setCoordenadas] = useState("");
  const [departamento, setDepartamento] = useState("");
  const [distrito, setDistrito] = useState("");
  const [provincia, setProvincia] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventId = new Date().getTime().toString();
      await setDoc(doc(db, "eventos", eventId), {
        id: eventId,
        nombre,
        imagen,
        fecha: new Date(fecha),
        lugar,
        direccion,
        descripcion,
        tipoEvento,
        calle,
        coordenadas,
        departamento,
        distrito,
        provincia,
      });

      alert("Evento creado exitosamente");
      setNombre("");
      setImagen("");
      setFecha("");
      setLugar("");
      setDireccion("");
      setDescripcion("");
      setTipoEvento("");
      setCalle("");
      setCoordenadas("");
      setDepartamento("");
      setDistrito("");
      setProvincia("");
    } catch (err) {
      console.error("Error creating event: ", err);
      setError("Hubo un error al crear el evento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-rojo mb-6">Crear Evento</h1>

      {error && <p className="text-rojo mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 border border-gray-300 shadow-md rounded">
        <div className="mb-4">
          <label htmlFor="nombre" className="block font-medium mb-1">Nombre del Evento</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Evento de Marinera"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="imagen" className="block font-medium mb-1">Imagen URL</label>
          <input
            type="text"
            id="imagen"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="Seleccione una imagen para el evento."
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="fecha" className="block font-medium mb-1">Fecha y hora</label>
          <input
            type="datetime-local"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            // required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="lugar" className="block font-medium mb-1">Nombre del lugar</label>
          <input
            type="text"
            id="lugar"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Plaza de Mayor"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="direccion" className="block font-medium mb-1">Dirección</label>
          <input
            type="text"
            id="direccion"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Jr. Angamos 789, Lima"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="calle" className="block font-medium mb-1">Calle</label>
          <input
            type="text"
            id="calle"
            value={calle}
            onChange={(e) => setCalle(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Jirón Batalla de Ayacucho"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="coordenadas" className="block font-medium mb-1">Coordenadas</label>
          <input
            type="text"
            id="coordenadas"
            value={coordenadas}
            onChange={(e) => setCoordenadas(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: -12.144941652304556, -77.00457760142407"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="departamento" className="block font-medium mb-1">Departamento</label>
          <input
            type="text"
            id="departamento"
            value={departamento}
            onChange={(e) => setDepartamento(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Lima"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="provincia" className="block font-medium mb-1">Provincia</label>
          <input
            type="text"
            id="provincia"
            value={provincia}
            onChange={(e) => setProvincia(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Lima"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="distrito" className="block font-medium mb-1">Distrito</label>
          <input
            type="text"
            id="distrito"
            value={distrito}
            onChange={(e) => setDistrito(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Santiago de Surco"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="descripcion" className="block font-medium mb-1">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            rows={4}
            placeholder="ej: Presentación de marinera en la plaza de armas, no te lo pierdas."
            required
          ></textarea>
        </div>
        <div className="mb-4">
          <label htmlFor="tipoEvento" className="block font-medium mb-1">Tipo de Evento</label>
          <input
            type="text"
            id="tipoEvento"
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
            placeholder="ej: Campeonato, Concurso, Presentación, etc."
            required
          />
        </div>
        <button
          type="submit"
          className="w-full block mb-0 mt-4 text-center bg-gradient-to-r from-rojo to-pink-500 text-white py-2 px-4 rounded-lg hover:shadow-lg transition-all"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Evento"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
