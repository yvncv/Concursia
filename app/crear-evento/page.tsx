"use client";
import { useState } from "react";
import { db } from "../firebase/config";
import { setDoc, doc } from "firebase/firestore";

const CreateEvent = () => {
  // States to hold form data
  const [nombre, setNombre] = useState("");
  const [imagen, setImagen] = useState("");
  const [fecha, setFecha] = useState("");
  const [lugar, setLugar] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tipoEvento, setTipoEvento] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Function to handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(""); // Reset error message

    try {
      // Create a new document in the "eventos" collection
      const eventId = new Date().getTime().toString(); // You can use another ID generation strategy if needed
      await setDoc(doc(db, "eventos", eventId), {
        id: eventId,
        nombre,
        imagen,
        fecha: new Date(fecha),
        lugar,
        descripcion,
        tipoEvento,
      });

      alert("Evento creado exitosamente");
      setNombre("");
      setImagen("");
      setFecha("");
      setLugar("");
      setDescripcion("");
      setTipoEvento("");
    } catch (err) {
      console.error("Error creating event: ", err);
      setError("Hubo un error al crear el evento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-background text-center">
      <h1 className="text-4xl text-foreground mb-4">Crear Evento</h1>

      {/* Error message */}
      {error && <p className="text-red-500">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-foreground p-5">
        <div className="mb-4">
          <label htmlFor="nombre" className="block text-lg text-background">Nombre del Evento</label>
          <input
            type="text"
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="imagen" className="block text-lg text-background">Imagen URL</label>
          <input
            type="text"
            id="imagen"
            value={imagen}
            onChange={(e) => setImagen(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="fecha" className="block text-lg text-background">Fecha</label>
          <input
            type="datetime-local"
            id="fecha"
            value={fecha}
            onChange={(e) => setFecha(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="lugar" className="block text-lg text-background">Lugar</label>
          <input
            type="text"
            id="lugar"
            value={lugar}
            onChange={(e) => setLugar(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="descripcion" className="block text-lg text-background">Descripción</label>
          <textarea
            id="descripcion"
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            rows={4}
            required
          ></textarea>
        </div>

        <div className="mb-4">
          <label htmlFor="tipoEvento" className="block text-lg text-background">Tipo de Evento</label>
          <input
            type="text"
            id="tipoEvento"
            value={tipoEvento}
            onChange={(e) => setTipoEvento(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded text-background"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
          disabled={loading}
        >
          {loading ? "Creando..." : "Crear Evento"}
        </button>
      </form>
    </div>
  );
};

export default CreateEvent;
