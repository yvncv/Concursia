"use client";

import { useState } from "react";
import { db } from "@/app/firebase/config";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { Event } from "@/app/types/eventType"; // Ajusta la ruta según tu estructura de archivos

const CreateEvent = () => {
  const [nombre, setNombre] = useState<string>("");
  const [imagen, setImagen] = useState<string>("");
  const [fecha, setFecha] = useState<string>("");
  const [lugar, setLugar] = useState<string>("");
  const [descripcion, setDescripcion] = useState<string>("");
  const [tipoEvento, setTipoEvento] = useState<string>("");
  const [calle, setCalle] = useState<string>("");
  const [coordenadas, setCoordenadas] = useState<string>("");
  const [departamento, setDepartamento] = useState<string>("");
  const [distrito, setDistrito] = useState<string>("");
  const [provincia, setProvincia] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventId = new Date().getTime().toString();

      // Crear el objeto del evento según el tipo Event
      const event: Event = {
        id: eventId,
        nombre,
        imagen,
        descripcion,
        fecha: Timestamp.fromDate(new Date(fecha)),// Timestamp de Firestore
        tipoEvento,
        lugar: {
          calle,
          coordenadas,
          distrito,
          provincia,
          departamento,
          nombreLugar: lugar,
        },
      };

      await setDoc(doc(db, "eventos", eventId), event);

      alert("Evento creado exitosamente");
      // Limpiar el formulario
      setNombre("");
      setImagen("");
      setFecha("");
      setLugar("");
      setDescripcion("");
      setTipoEvento("");
      setCalle("");
      setCoordenadas("");
      setDepartamento("");
      setDistrito("");
      setProvincia("");
    } catch (err) {
      console.error("Error creando el evento: ", err);
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
        {/* Mapeo dinámico de campos del formulario */}
        {[
          { label: "Nombre del Evento", id: "nombre", value: nombre, setValue: setNombre, type: "text" },
          { label: "Imagen URL", id: "imagen", value: imagen, setValue: setImagen, type: "text" },
          { label: "Fecha y Hora", id: "fecha", value: fecha, setValue: setFecha, type: "datetime-local" },
          { label: "Nombre del lugar", id: "lugar", value: lugar, setValue: setLugar, type: "text" },
          { label: "Calle", id: "calle", value: calle, setValue: setCalle, type: "text" },
          { label: "Coordenadas", id: "coordenadas", value: coordenadas, setValue: setCoordenadas, type: "text" },
          { label: "Departamento", id: "departamento", value: departamento, setValue: setDepartamento, type: "text" },
          { label: "Provincia", id: "provincia", value: provincia, setValue: setProvincia, type: "text" },
          { label: "Distrito", id: "distrito", value: distrito, setValue: setDistrito, type: "text" },
          { label: "Descripción", id: "descripcion", value: descripcion, setValue: setDescripcion, type: "textarea" },
          { label: "Tipo de Evento", id: "tipoEvento", value: tipoEvento, setValue: setTipoEvento, type: "text" },
        ].map(({ label, id, value, setValue, type }) => (
          <div key={id} className="mb-4">
            <label htmlFor={id} className="block font-medium mb-1">{label}</label>
            {type === "textarea" ? (
              <textarea
                id={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                rows={4}
                placeholder={`ej: ${label}`}
                required
              ></textarea>
            ) : (
              <input
                type={type}
                id={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                placeholder={`ej: ${label}`}
                required
              />
            )}
          </div>
        ))}

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
