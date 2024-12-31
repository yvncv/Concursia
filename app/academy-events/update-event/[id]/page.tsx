'use client';

import { useState, useEffect, use } from "react";
import { db } from "@/app/firebase/config";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Event } from "@/app/types/eventType";

const EditEvent = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
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

  const router = useRouter();

  // Use the effect to fetch event data
  useEffect(() => {
    const fetchEvent = async () => {
      if (!id) {
        setError("No se ha encontrado el ID del evento");
        return;
      }

      setLoading(true);
      try {
        // Fetch the event from Firestore using the ID
        const eventDoc = await getDoc(doc(db, "eventos", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as Event;
          setNombre(eventData.nombre);
          setImagen(eventData.imagen);
          setFecha(eventData.fecha.toDate().toISOString().slice(0, 16));
          setLugar(eventData.lugar.nombreLugar);
          setDescripcion(eventData.descripcion);
          setTipoEvento(eventData.tipoEvento);
          setCalle(eventData.lugar.calle);
          setCoordenadas(eventData.lugar.coordenadas);
          setDepartamento(eventData.lugar.departamento);
          setDistrito(eventData.lugar.distrito);
          setProvincia(eventData.lugar.provincia);
        } else {
          setError("Evento no encontrado.");
        }
      } catch (err) {
        setError("Hubo un error al cargar el evento.");
        console.error("Error al obtener el evento: ", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]); // Depend on `id` to re-run when it changes

  // Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the event in Firestore
      const eventRef = doc(db, "eventos", id);
      await updateDoc(eventRef, {
        nombre,
        imagen,
        fecha: Timestamp.fromDate(new Date(fecha)),
        descripcion,
        tipoEvento,
        lugar: {
          nombreLugar: lugar,
          calle,
          coordenadas,
          departamento,
          distrito,
          provincia,
        },
      });
      router.push("/academy-events"); // Redirect to events page after update
    } catch (err) {
      setError("Error al actualizar el evento.");
      console.error("Error al actualizar el evento: ", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-semibold text-rojo mb-6">Editar Evento</h1>

      {error && <p className="text-rojo mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-lg bg-white p-6 border border-gray-300 shadow-md rounded">
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
          { label: "Tipo de Evento", id: "tipoEvento", value: tipoEvento, setValue: setTipoEvento, type: "text" }
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
          {loading ? "Actualizando..." : "Actualizar Evento"}
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
