'use client';

import { useState, useEffect, use } from "react";
import { db } from "@/app/firebase/config";
import useUser from "@/app/firebase/functions";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Event } from "@/app/types/eventType";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService"; // Asegúrate de que esta ruta sea correcta

const EditEvent = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user } = useUser()
  const [name, setName] = useState<string>("");
  const [smallImage, setSmallImage] = useState<string>("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [placeName, setPlaceName] = useState<string>("");

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
    (item) => item.departamento === department && item.provincia !== "00" && item.distrito === "00"
  );

  // Filtrar distritos según provincia seleccionada
  const filteredDistricts = ubigeoData.filter(
    (item) => item.departamento === department && item.provincia === province && item.distrito !== "00"
  );

  const router = useRouter();

  // Use the effect to fetch event data
  useEffect(() => {
    if (!id) {
      setError("No se ha encontrado el ID del evento");
      return;
    }
  
    setLoading(true);
    const fetchEvent = async () => {
      try {
        const eventDoc = await getDoc(doc(db, "eventos", id));
        if (eventDoc.exists()) {
          const eventData = eventDoc.data() as Event;
          setName(eventData.name || "");
          setSmallImage(eventData.smallImage || "");
          setBannerImage(eventData.bannerImage || "");
          setStartDate(eventData.startDate ? eventData.startDate.toDate().toISOString().slice(0, 16) : "");
          setEndDate(eventData.endDate ? eventData.endDate.toDate().toISOString().slice(0, 16) : "");
          setDescription(eventData.description);
          setType(eventData.type);
          setStreet(eventData.location?.street);
          setLatitude(eventData.location?.coordinates?.latitude);
          setLongitude(eventData.location?.coordinates?.longitude);
          setDepartment(eventData.location?.department);
          setProvince(eventData.location?.province);
          setDistrict(eventData.location?.district);
          setPlaceName(eventData.location?.placeName);

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
  }, [id]);

  // Handle the form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update the event in Firestore
      const eventRef = doc(db, "eventos", id);
      await updateDoc(eventRef, {
        name,
        description,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        smallImage,
        bannerImage,
        location: {
          street,
          district,
          province,
          department,
          placeName,
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
        },
        type,
        capacity: {
          day1: 0,
        },
        status: "pendiente",
        settings: {
          categories: [],
          levels: [],
          registrationType: [],
          prices: {},
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastUpdateBy: user?.fullName
      },
      );
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
      <h1 className="text-2xl font-semibold text-rojo m-6">Crear Evento</h1>

      {error && <p className="text-rojo mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-7xl bg-white p-6 border border-gray-300 shadow-md rounded">
        {/* Información del Evento */}
        <h2 className="text-xl font-semibold mb-4 text-rojo border border-transparent border-b-rojo">Información del Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[{ label: "Nombre del Evento", id: "name", value: name, setValue: setName, type: "text" },
          { label: "Imagen Pequeña", id: "smallImage", value: smallImage, setValue: setSmallImage, type: "text" },
          { label: "Banner del Evento", id: "bannerImage", value: bannerImage, setValue: setBannerImage, type: "text" },
          { label: "Fecha de Inicio", id: "startDate", value: startDate, setValue: setStartDate, type: "datetime-local" },
          { label: "Fecha de Finalización", id: "endDate", value: endDate, setValue: setEndDate, type: "datetime-local" },
          { label: "Descripción", id: "description", value: description, setValue: setDescription, type: "textarea" },
          { label: "Tipo de Evento", id: "type", value: type, setValue: setType, type: "text" },
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
                  value={value || ""}  // Asegúrate de que el valor nunca sea undefined
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
          {[{ label: "Nombre del Lugar", id: "placeName", value: placeName, setValue: setPlaceName, type: "text" },
          { label: "Calle", id: "street", value: street, setValue: setStreet, type: "text" },
          { label: "Latitud", id: "latitude", value: latitude, setValue: setLatitude, type: "text" },
          { label: "Longitud", id: "longitude", value: longitude, setValue: setLongitude, type: "text" },
          { label: "Departamento", id: "department", value: department, setValue: setDepartment, type: "select" },
          { label: "Provincia", id: "province", value: province, setValue: setProvince, type: "select" },
          { label: "Distrito", id: "district", value: district, setValue: setDistrict, type: "select" },
          ].map(({ label, id, value, setValue, type }) => (
            <div key={id} className="mb-4">
              <label htmlFor={id} className="block font-medium mb-1">{label}</label>
              {type === "select" ? (
                <select
                  id={id}
                  value={value}
                  onChange={(e) => {
                    setValue(e.target.value);
                    if (id === "department") {
                      setProvince("");
                      setDistrict("");
                    } else if (id === "province") {
                      setDistrict("");
                    }
                  }}
                  className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                  required
                >
                  <option value="">Selecciona {label.toLowerCase()}</option>
                  {id === "department"
                    ? ubigeoData
                      .filter((item) => item.provincia === "00" && item.distrito === "00")
                      .map((dep) => (
                        <option key={`${dep.departamento}-00-00`} value={dep.departamento}>
                          {dep.nombre}
                        </option>
                      ))
                    : id === "province"
                      ? filteredProvinces.map((prov) => (
                        <option key={`${department}-${prov.provincia}-00`} value={prov.provincia}>
                          {prov.nombre}
                        </option>
                      ))
                      : filteredDistricts.map((dist) => (
                        <option key={`${department}-${province}-${dist.distrito}`} value={dist.distrito}>
                          {dist.nombre}
                        </option>
                      ))}
                </select>
              ) : (
                <input
                  type={type}
                  id={id}
                  value={value || ""}  // Asegúrate de que el valor nunca sea undefined
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-rojo focus:border-rojo"
                  placeholder={`ej: ${label}`}
                  required
                />

              )}
            </div>
          ))}
        </div>

        {/* Botones */}
        <div className="mt-8 flex justify-end">
          <button
            type="submit"
            className={`px-6 py-2 text-white font-semibold rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-rojo hover:bg-red-700"
              }`}
            disabled={loading}
          >
            {loading ? "Creando..." : "Crear Evento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
