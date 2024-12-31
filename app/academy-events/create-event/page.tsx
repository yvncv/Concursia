"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/firebase/config";
import { setDoc, doc, Timestamp } from "firebase/firestore";
import { Event } from "@/app/types/eventType"; // Ajusta la ruta según tu estructura de archivos
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService"; // Asegúrate de que esta ruta sea correcta

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
  const [provincia, setProvincia] = useState<string>("");
  const [distrito, setDistrito] = useState<string>("");

  const [ubigeoData, setUbigeoData] = useState<Ubigeo[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Cargar datos de Ubigeo al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data: Ubigeo[] = await fetchUbigeoINEI();
        setUbigeoData(data);
      } catch (error) {
        console.error("Error al cargar los datos de Ubigeo:", error);
      }
    };

    fetchData();
  }, []);

  // Filtrar provincias según departamento seleccionado
  const filteredProvinces = ubigeoData.filter(
    (item) => item.departamento === departamento && item.provincia !== "00" && item.distrito === "00"
  );

  // Filtrar distritos según provincia seleccionada
  const filteredDistricts = ubigeoData.filter(
    (item) => item.departamento === departamento && item.provincia === provincia && item.distrito !== "00"
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const eventId = new Date().getTime().toString();

      const event: Event = {
        id: eventId,
        nombre,
        imagen,
        descripcion,
        fecha: Timestamp.fromDate(new Date(fecha)),
        tipoEvento,
        lugar: {
          calle,
          coordenadas,
          distrito: distrito || "", // Valor predeterminado
          provincia,
          departamento,
          nombreLugar: lugar,
        },
      };

      await setDoc(doc(db, "eventos", eventId), event);

      alert("Evento creado exitosamente");
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
      <h1 className="text-2xl font-semibold text-rojo m-6">Crear Evento</h1>

      {error && <p className="text-rojo mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-7xl bg-white p-6 border border-gray-300 shadow-md rounded">
        {/* Información del Evento */}
        <h2 className="text-xl font-semibold mb-4 text-rojo border border-transparent border-b-rojo">Información del Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Nombre del Evento", id: "nombre", value: nombre, setValue: setNombre, type: "text" },
            { label: "Imagen URL", id: "imagen", value: imagen, setValue: setImagen, type: "text" },
            { label: "Fecha y Hora", id: "fecha", value: fecha, setValue: setFecha, type: "datetime-local" },
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
        </div>

        {/* Información del Lugar */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-rojo border border-transparent border-b-rojo">Información del Lugar</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Nombre del Lugar", id: "lugar", value: lugar, setValue: setLugar, type: "text" },
            { label: "Calle", id: "calle", value: calle, setValue: setCalle, type: "text" },
            { label: "Coordenadas", id: "coordenadas", value: coordenadas, setValue: setCoordenadas, type: "text" },
          ].map(({ label, id, value, setValue, type }) => (
            <div key={id} className="mb-4">
              <label htmlFor={id} className="block font-medium mb-1">{label}</label>
              <input
                type={type}
                id={id}
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                placeholder={`ej: ${label}`}
                required
              />
            </div>
          ))}
        </div>

        {/* Selección de Ubigeo (Departamento, Provincia, Distrito) */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-rojo border border-transparent border-b-rojo">Ubicación</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { label: "Departamento", id: "departamento", value: departamento, setValue: setDepartamento, type: "select" },
            { label: "Provincia", id: "provincia", value: provincia, setValue: setProvincia, type: "select" },
            { label: "Distrito", id: "distrito", value: distrito, setValue: setDistrito, type: "select" },
          ].map(({ label, id, value, setValue, type }) => (
            <div key={id} className="mb-4">
              <label htmlFor={id} className="block font-medium mb-1">{label}</label>
              {type === "select" ? (
                <select
                  id={id}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (id === "departamento") {
                      setProvincia("");
                      setDistrito("");
                    } else if (id === "provincia") {
                      setDistrito("");
                    }
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                  required
                >
                  <option value="">Selecciona {label.toLowerCase()}</option>
                  {id === "departamento"
                    ? ubigeoData
                      .filter((item) => item.provincia === "00" && item.distrito === "00")
                      .map((dep) => (
                        <option key={`${dep.departamento}-00-00`} value={dep.departamento}>
                          {dep.nombre}
                        </option>
                      ))
                    : id === "provincia"
                      ? filteredProvinces.map((prov) => (
                        <option key={`${departamento}-${prov.provincia}-00`} value={prov.provincia}>
                          {prov.nombre}
                        </option>
                      ))
                      : filteredDistricts.map((dist) => (
                        <option key={`${departamento}-${provincia}-${dist.distrito}`} value={dist.distrito}>
                          {dist.nombre}
                        </option>
                      ))}
                </select>
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
        </div>

        {/* Botón de Envío */}
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
