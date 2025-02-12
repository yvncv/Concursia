"use client";

import { useState, useEffect } from "react";
import useUser from "@/app/firebase/functions"; // Asegúrate de que esta ruta sea correcta
import { db } from "@/app/firebase/config";
import { setDoc, doc, Timestamp, getDoc } from "firebase/firestore";
import { Event } from "@/app/types/eventType"; // Ajusta la ruta según tu estructura de archivos
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService"; // Asegúrate de que esta ruta sea correcta

const levelsList = ["Seriado", "Individual", "Novel Novel", "Novel Abierto","Novel Abierto A", "Novel Abierto B", "Nacional"];
const categoriesList = ["Baby", "Pre-Infante", "Infante", "Juvenil", "Adulto"];

const CreateEvent = () => {
  const { user } = useUser();
  const [name, setName] = useState<string>("");
  const [smallImage, setSmallImage] = useState<string>("");
  const [bannerImage, setBannerImage] = useState<string>("");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [eventType, setEventType] = useState<string>("");
  const [capacity, setCapacity] = useState<string>("");
  const [street, setStreet] = useState<string>("");
  const [latitude, setLatitude] = useState<string>("");
  const [longitude, setLongitude] = useState<string>("");
  const [department, setDepartment] = useState<string>("");
  const [province, setProvince] = useState<string>("");
  const [district, setDistrict] = useState<string>("");
  const [placeName, setPlaceName] = useState<string>("");
  const [academyName, setAcademyName] = useState<string>("");
  const [selectedLevels, setSelectedLevels] = useState<{ level: string; price: string; couple: boolean }[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

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

  // Obtener el nombre de la academia utilizando academyId
  useEffect(() => {
    const fetchAcademyName = async () => {
      if (user && user.academyId) {
        const academyRef = doc(db, "academias", user.academyId);
        const academySnap = await getDoc(academyRef);
        if (academySnap.exists()) {
          setAcademyName(academySnap.data().name); // Asegúrate de que el campo del nombre de la academia es 'name'
        } else {
          console.error("Academia no encontrada.");
          setAcademyName(""); // Asegúrate de que el campo del nombre de la academia es 'name'
        }
      }
    };

    fetchAcademyName();
  }, [user]);

  // Filtrar provincias según departamento seleccionado
  const filteredProvinces = ubigeoData.filter(
    (item) => item.departamento === department && item.provincia !== "00" && item.distrito === "00"
  );

  // Filtrar distritos según provincia seleccionada
  const filteredDistricts = ubigeoData.filter(
    (item) => item.departamento === department && item.provincia === province && item.distrito !== "00"
  );

  const handleAddLevel = (level: string) => {
    // Define los valores fijos de "couple" según el nivel
    const coupleMapping: { [key: string]: boolean } = {
      "Seriado": false,
      "Novel Novel": true,
      "Novel Abierto": true,
      "Novel Abierto A": true,
      "Novel Abierto B": true,
      "Nacional": true,
      "Individual": false,
    };
  
    // Verifica si el nivel existe en el mapeo
    const couple = coupleMapping[level] ?? false;
  
    if (!selectedLevels.some((item) => item.level === level)) {
      setSelectedLevels((prev) => [
        ...prev,
        { level, price: "", couple }, // El precio se inicializa con ""
      ]);
    }
  };

  const handleRemoveLevel = (index: number) => {
    const updatedLevels = selectedLevels.filter((_, i) => i !== index);
    setSelectedLevels(updatedLevels); // Actualiza el estado con las categorías restantes
  };

  const handlePriceChange = (index: number, value: string) => {
    const updatedLevels = [...selectedLevels];
    updatedLevels[index].price = value;
    setSelectedLevels(updatedLevels);
  };

  const handleLevelChange = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((l) => l !== category) : [...prev, category]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error("Usuario no autenticado");
      }

      // Buscar los nombres de departamento, provincia y distrito
      const departmentName = ubigeoData.find(
        (item) => item.departamento === department && item.provincia === "00" && item.distrito === "00"
      )?.nombre || department;

      const provinceName = ubigeoData.find(
        (item) => item.departamento === department && item.provincia === province && item.distrito === "00"
      )?.nombre || province;

      const districtName = ubigeoData.find(
        (item) => item.departamento === department && item.provincia === province && item.distrito === district
      )?.nombre || district;

      const eventId = new Date().getTime().toString();

      const event: Event = {
        id: eventId,
        name,
        description,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        academyId: user.academyId,
        academyName: user.academyName,
        organizerId: user.uid,
        smallImage,
        bannerImage,
        location: {
          street,
          district: districtName,  // Usar nombre de distrito
          province: provinceName,  // Usar nombre de provincia
          department: departmentName,  // Usar nombre de departamento
          placeName,
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
        },
        eventType,
        capacity,
        status: "pendiente",
        settings: {
          categories: selectedCategories, // Ahora es un array de strings
          levels: selectedLevels.reduce(
            (acc, item) => ({
              ...acc,
              [item.level]: { price: parseFloat(item.price) || 0, couple: item.couple },
            }),
            {}
          ),
          registrationType: [], // Esto permanece vacío o lo que corresponda según tu lógica
        },
        createdBy: `${user?.firstName} ${user?.lastName}`,
        lastUpdatedBy: `${user?.firstName} ${user?.lastName}`,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db, "eventos", eventId), event);

      alert("Evento creado exitosamente");
      setName("");
      setSmallImage("");
      setBannerImage("");
      setStartDate("");
      setEndDate("");
      setDescription("");
      setEventType("");
      setStreet("");
      setLatitude("");
      setLongitude("");
      setDepartment("");
      setProvince("");
      setDistrict("");
      setPlaceName("");
    } catch (err) {
      console.error("Error creando el evento: ", err);
      setError("Hubo un error al crear el evento. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-semibold text-white mb-6 py-2 px-4 rounded-xl bg-green-600">Crear Evento</h1>

      {error && <p className="text-green-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-7xl bg-white p-6 border border-gray-300 shadow-md rounded">
        {/* Información del Evento */}
        <h2 className="text-xl font-semibold mb-4 text-green-600 border border-transparent border-b-green-600">Información del Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[{ label: "Nombre del Evento", id: "name", value: name, setValue: setName, type: "text" },
          { label: "Imagen Pequeña", id: "smallImage", value: smallImage, setValue: setSmallImage, type: "text" },
          { label: "Banner del Evento", id: "bannerImage", value: bannerImage, setValue: setBannerImage, type: "text" },
          { label: "Fecha de Inicio", id: "startDate", value: startDate, setValue: setStartDate, type: "datetime-local" },
          { label: "Fecha de Finalización", id: "endDate", value: endDate, setValue: setEndDate, type: "datetime-local" },
          { label: "Descripción", id: "description", value: description, setValue: setDescription, type: "textarea" },
          { label: "Capacidad", id: "capacity", value: capacity, setValue: setCapacity, type: "number" },
          { label: "Tipo de Evento", id: "eventType", value: eventType, setValue: setEventType, type: "text" },
          ].map(({ label, id, value, setValue, type }) => (
            <div key={id} className="mb-4">
              <label htmlFor={id} className="block font-medium mb-1">{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={id}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-green-600 focus:border-green-600"
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
                  className="w-full px-3 py-2 border rounded focus:ring-green-600 focus:border-green-600"
                  placeholder={`ej: ${label}`}
                  required
                />
              )}
            </div>
          ))}
        </div>

        {/* Información del Lugar */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-green-600 border border-transparent border-b-green-600">Información del Lugar</h2>
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
                  className="w-full px-3 py-2 border rounded focus:ring-green-600 focus:border-green-600"
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
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-green-600 focus:border-green-600"
                  placeholder={`ej: ${label}`}
                  required
                />
              )}
            </div>
          ))}

          {/* Formulario para editar categorías, niveles y precios */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-semibold mb-2">Editar Niveles y Categorías</h2>

            <h2 className="text-lg font-semibold mb-2">Seleccionar Niveles</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {levelsList.map((level) => (
                <button
                  type="button"  // Asegúrate de que no sea un botón de tipo submit
                  key={level}
                  onClick={() => handleAddLevel(level)}
                  className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-400 transition-all"
                >
                  {level}
                </button>
              ))}
            </div>

            {selectedLevels.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {selectedLevels.map((item, index) => (
                  <li key={item.level} className="ml-1 pl-5 flex items-center gap-4 py-2 px-2 rounded-full bg-green-200 hover:bg-red-200">
                    <span className="text-gray-700">{item.level}</span>
                    <div>
                      <span className="hidden md:visible px-2 py-1 w-20 rounded-full bg-white text-md">S/.</span>
                      <span className="hidden md:visible px-2 py-1 w-20 rounded-full bg-white text-md"> = </span>
                      <input
                        type="number"
                        placeholder="Precio"
                        value={item.price}
                        onChange={(e) => handlePriceChange(index, e.target.value)}
                        className="px-2 py-1 w-20 rounded-full text-md"
                      />
                    </div>
                    <button
                      onClick={() => handleRemoveLevel(index)}
                      className="text-rojo px-2 rounded-full hover:bg-rojo hover:text-white"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mb-4">No hay niveles seleccionados.</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Seleccionar Categorías</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {categoriesList.map((category) => (
                <button
                  type="button"  // Asegúrate de que no sea un botón de tipo submit
                  key={category}
                  onClick={() => handleLevelChange(category)}
                  className={`py-1 px-3 rounded transition-all ${selectedCategories.includes(category)
                    ? "bg-green-500 text-white hover:bg-green-400"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex">
          <button
            type="submit"
            className={`mx-auto w-4/5 px-6 py-2 text-white font-semibold rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700"
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

export default CreateEvent;
