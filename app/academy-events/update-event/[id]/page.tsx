'use client';

import { useState, useEffect, use } from "react";
import { db } from "@/app/firebase/config";
import useUser from "@/app/firebase/functions";
import { doc, getDoc, Timestamp, updateDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import { Event } from "@/app/types/eventType";
import { fetchUbigeoINEI, Ubigeo } from "@/app/ubigeo/ubigeoService";

const categoriesList = ["Seriado", "Individual", "Novel Novel", "Novel Abierto A", "Novel Abierto B", "Nacional"];
const levelsList = ["Baby", "Pre-Infante", "Infante", "Juvenil", "Adulto"];

const EditEvent = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
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
  const [selectedCategories, setSelectedCategories] = useState<{ category: string; price: string }[]>([]);
  const [selectedLevels, setSelectedLevels] = useState([""]);


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

  const handleAddCategory = (category: string) => {
    if (!selectedCategories.some((item) => item.category === category)) {
      setSelectedCategories([...selectedCategories, { category, price: "" }]);
    }
  };

  const handleRemoveCategory = (index: number) => {
    const updatedCategories = selectedCategories.filter((_, i) => i !== index);
    setSelectedCategories(updatedCategories); // Actualiza el estado con las categorías restantes
  };

  const handlePriceChange = (index: number, value: string) => {
    const updatedCategories = [...selectedCategories];
    const price = parseFloat(value);
    updatedCategories[index].price = isNaN(price) || price <= 0 ? '' : value; // Prevent invalid input
    setSelectedCategories(updatedCategories);
  };

  const handleLevelChange = (levelName: string) => {
    // Ensure selectedLevels is always an array
    setSelectedLevels((prev) => {
      if (Array.isArray(prev)) {
        return prev.includes(levelName) ? prev.filter((l) => l !== levelName) : [...prev, levelName];
      }
      // If it's not an array, reset it to an empty array and add the level
      return [levelName];
    });
  };

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
          setEventType(eventData.eventType);
          setCapacity(eventData.capacity);
          setStreet(eventData.location?.street);
          setLatitude(eventData.location?.coordinates?.latitude);
          setLongitude(eventData.location?.coordinates?.longitude);
          setDepartment(eventData.location?.department);
          setProvince(eventData.location?.province);
          setDistrict(eventData.location?.district);
          setPlaceName(eventData.location?.placeName);
          setSelectedCategories(
            eventData.settings?.categories
              ? Object.entries(eventData.settings.categories).map(([category, price]) => ({
                category,
                price: price.toString()  // Convierte el precio a string
              }))
              : [] // Retorna un array vacío si categoriesPrices es undefined o null
          );

          setSelectedLevels(Object.keys(eventData.settings?.levels || []));

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

    // Buscar el nombre completo del departamento, provincia y distrito
    const departmentName = ubigeoData.find(
      (item) => item.departamento === department && item.provincia === "00" && item.distrito === "00"
    )?.nombre || department;

    const provinceName = ubigeoData.find(
      (item) => item.departamento === department && item.provincia === province && item.distrito === "00"
    )?.nombre || province;

    const districtName = ubigeoData.find(
      (item) => item.departamento === department && item.provincia === province && item.distrito === district
    )?.nombre || district;


    try {
      // Actualizar el evento en Firestore
      const eventRef = doc(db, "eventos", id);
      await updateDoc(eventRef, {
        name,
        description,
        startDate: Timestamp.fromDate(new Date(startDate)),
        endDate: Timestamp.fromDate(new Date(endDate)),
        academyName,
        smallImage,
        bannerImage,
        location: {
          street,
          district: districtName,  // Usar nombre de distrito
          province: provinceName,  // Usar nombre de provincia
          department: departmentName,  // Usar nombre de departamento
          placeName,
          coordinates: {
            latitude,
            longitude,
          },
        },
        eventType,
        capacity,
        status: "pendiente",
        settings: {
          categoriesPrices: selectedCategories.reduce(
            (acc, item) => ({ ...acc, [item.category]: parseFloat(item.price) || 0 }),
            {}
          ),
          levels: selectedLevels,
          registrationType: [],
        },
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        lastUpdatedBy: `${user?.firstName} ${user?.lastName}`,
      });

      router.push("/academy-events"); // Redirigir a la página de eventos después de la actualización
    } catch (err) {
      setError("Error al actualizar el evento.");
      console.error("Error al actualizar el evento: ", err);
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-2xl font-semibold text-white mb-6 py-2 px-4 rounded-xl bg-yellow-600">Editar Evento</h1>

      {error && <p className="text-yellow-600 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="w-full max-w-7xl bg-white p-6 border border-gray-300 shadow-md rounded">
        {/* Información del Evento */}
        <h2 className="text-xl font-semibold mb-4 text-yellow-600 border border-transparent border-b-yellow-600">Información del Evento</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[{ label: "Nombre del Evento", id: "name", value: name, setValue: setName, type: "text" },
          { label: "Imagen Pequeña", id: "smallImage", value: smallImage, setValue: setSmallImage, type: "text" },
          { label: "Banner del Evento", id: "bannerImage", value: bannerImage, setValue: setBannerImage, type: "text" },
          { label: "Fecha de Inicio", id: "startDate", value: startDate, setValue: setStartDate, type: "datetime-local" },
          { label: "Fecha de Finalización", id: "endDate", value: endDate, setValue: setEndDate, type: "datetime-local" },
          { label: "Descripción", id: "description", value: description, setValue: setDescription, type: "textarea" },
          { label: "Tipo de Evento", id: "eventType", value: eventType, setValue: setEventType, type: "text" },
          { label: "Capacidad", id: "capacity", value: capacity, setValue: setCapacity, type: "number" },
          ].map(({ label, id, value, setValue, type }) => (
            <div key={id} className="mb-4">
              <label htmlFor={id} className="block font-medium mb-1">{label}</label>
              {type === "textarea" ? (
                <textarea
                  id={id}
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                  className="w-full px-3 py-2 border rounded focus:ring-yellow-600 focus:border-yellow-600"
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
                  className="w-full px-3 py-2 border rounded focus:ring-yellow-600 focus:border-yellow-600"
                  placeholder={`ej: ${label}`}
                  required
                />
              )}
            </div>
          ))}
        </div>

        {/* Información del Lugar */}
        <h2 className="text-xl font-semibold mt-8 mb-4 text-yellow-600 border border-transparent border-b-yellow-600">Información del Lugar</h2>
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
                  className="w-full px-3 py-2 border rounded focus:ring-yellow-600 focus:border-yellow-600"
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
                  className="w-full px-3 py-2 border rounded focus:ring-yellow-600 focus:border-rojo"
                  placeholder={`ej: ${label}`}
                  required
                />

              )}
            </div>
          ))}

          {/* Formulario para editar categorías, niveles y precios */}
          <div className="col-span-1 sm:col-span-2 lg:col-span-3">
            <h2 className="text-lg font-semibold mb-2">Editar Categorías y Precios</h2>

            <h2 className="text-lg font-semibold mb-2">Seleccionar Categorías</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {categoriesList.map((category) => (
                <button
                  type="button"  // Asegúrate de que no sea un botón de tipo submit
                  key={category}
                  onClick={() => handleAddCategory(category)}
                  className="bg-blue-500 text-white py-1 px-3 rounded hover:bg-blue-400 transition-all"
                >
                  {category}
                </button>
              ))}
            </div>

            {selectedCategories.length > 0 ? (
              <ul className="space-y-2 mb-4">
                {selectedCategories.map((item, index) => (
                  <li key={item.category} className="ml-1 pl-5 flex items-center gap-4 py-2 px-2 rounded-full bg-yellow-200 hover:bg-red-200">
                    <span className="text-gray-700">{item.category}</span>
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
                      onClick={() => handleRemoveCategory(index)}
                      className="text-rojo px-2 rounded-full hover:bg-rojo hover:text-white"
                    >
                      X
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-600 mb-4">No hay categorías seleccionadas.</p>
            )}

            <h2 className="text-lg font-semibold mb-2">Editar Niveles</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {levelsList.map((level) => (
                <button
                  key={level}
                  onClick={() => handleLevelChange(level)}
                  className={`py-1 px-3 rounded transition-all ${selectedLevels && Array.isArray(selectedLevels) && selectedLevels.includes(level)}
                    ? "bg-green-500 text-white hover:bg-green-400"
                    : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Botones */}
        <div className="mt-8 flex">
          <button
            type="submit"
            className={`mx-auto w-4/5 px-6 py-2 text-white font-semibold rounded ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            disabled={loading}
          >
            {loading ? "Creando..." : "Guardar Evento"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditEvent;
