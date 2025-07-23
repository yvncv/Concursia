"use client";

import { useState } from "react";
import { collection, doc, setDoc, Timestamp, getDocs, updateDoc, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { Academy } from "@/app/types/academyType";
import { v4 as uuidv4 } from "uuid";

type CreateAcademyData = {
  id: string;
  organizerId: string;
  name: string;
  email: string[];
  phoneNumber: string[];
  profileImage: string;
  coverImage: string;
  description: string;
  website: string;
  socialMedia: {
    facebook: string;
    instagram: string;
    tiktok: string;
    youtube: string;
    whatsapp: string;
    twitter: string;
  };
  location: {
    street: string;
    district: string;
    province: string;
    department: string;
    placeName: string;
    coordinates: {
      latitude: string;
      longitude: string;
    };
  };
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function generateRandomAcademy(index: number): CreateAcademyData {
  const departments = [
    { name: "Lima", provinces: ["Lima", "Callao"], districts: ["Miraflores", "San Isidro", "Barranco"] },
    { name: "La Libertad", provinces: ["Trujillo", "Pacasmayo"], districts: ["Trujillo", "Laredo", "Huanchaco"] },
    { name: "Arequipa", provinces: ["Arequipa"], districts: ["Cayma", "Yanahuara", "Cerro Colorado"] },
    { name: "Piura", provinces: ["Piura", "Sullana"], districts: ["Piura", "Castilla", "Catacaos"] },
    { name: "Cusco", provinces: ["Cusco"], districts: ["San Blas", "Santiago", "Wanchaq"] }
  ];

  const streets = [
    "Av. Larco 123",
    "Jr. Pizarro 456",
    "Av. Grau 789",
    "Calle Real 321",
    "Av. Bolívar 654",
    "Jr. Junín 987",
    "Av. España 147",
    "Calle Lima 258",
    "Av. Arequipa 369",
    "Jr. Cusco 741"
  ];

  const placeNames = [
    "Centro Cultural Municipal",
    "Casa de la Cultura",
    "Auditorio Principal",
    "Centro de Convenciones",
    "Coliseo Municipal",
    "Teatro Municipal",
    "Centro Recreacional",
    "Club Social",
    "Instituto Cultural",
    "Academia Principal"
  ];

  const selectedDepartment = departments[Math.floor(Math.random() * departments.length)];
  const selectedProvince = selectedDepartment.provinces[Math.floor(Math.random() * selectedDepartment.provinces.length)];
  const selectedDistrict = selectedDepartment.districts[Math.floor(Math.random() * selectedDepartment.districts.length)];
  const selectedStreet = streets[Math.floor(Math.random() * streets.length)];
  const selectedPlaceName = placeNames[Math.floor(Math.random() * placeNames.length)];

  // Nombre numerado simple
  const academyName = `Academia ${index + 1}`;
  const emailLocal = `academia${index + 1}`;
  const email = `${emailLocal}@academias.com`;
  const phone = "9" + Math.floor(10000000 + Math.random() * 90000000).toString();

  // Generar coordenadas aproximadas para Perú
  const latitudes = {
    "Lima": -12.0464,
    "La Libertad": -8.1116,
    "Arequipa": -16.4090,
    "Piura": -5.1945,
    "Cusco": -13.5319
  };
  
  const longitudes = {
    "Lima": -77.0428,
    "La Libertad": -79.0287,
    "Arequipa": -71.5375,
    "Piura": -80.6328,
    "Cusco": -71.9675
  };

  const baseLat = latitudes[selectedDepartment.name as keyof typeof latitudes];
  const baseLng = longitudes[selectedDepartment.name as keyof typeof longitudes];
  
  // Añadir variación pequeña para simular diferentes ubicaciones
  const latitude = (baseLat + (Math.random() - 0.5) * 0.1).toFixed(6);
  const longitude = (baseLng + (Math.random() - 0.5) * 0.1).toFixed(6);

  return {
    id: uuidv4(),
    organizerId: "temp-organizer-id", // Se puede actualizar después con un organizador real
    name: academyName,
    email: [email],
    phoneNumber: [phone],
    profileImage: "",
    coverImage: "",
    description: `Academia especializada en marinera norteña ubicada en ${selectedDistrict}, ${selectedDepartment.name}. Enseñamos tradición, técnica y pasión por la danza peruana.`,
    website: `https://www.${emailLocal}.com`,
    socialMedia: {
      facebook: `https://facebook.com/${emailLocal}`,
      instagram: `https://instagram.com/${emailLocal}`,
      tiktok: `https://tiktok.com/@${emailLocal}`,
      youtube: `https://youtube.com/c/${emailLocal}`,
      whatsapp: `https://wa.me/51${phone}`,
      twitter: `https://twitter.com/${emailLocal}`
    },
    location: {
      street: selectedStreet,
      district: selectedDistrict,
      province: selectedProvince,
      department: selectedDepartment.name,
      placeName: selectedPlaceName,
      coordinates: {
        latitude: latitude,
        longitude: longitude
      }
    },
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
}

export default function CreacionMasivaDeAcademias() {
  const [cantidad, setCantidad] = useState(5);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [assigningOrganizers, setAssigningOrganizers] = useState(false);
  const [assignedCount, setAssignedCount] = useState(0);

  const handleCreate = async () => {
    setLoading(true);
    setSuccessCount(0);

    for (let i = 0; i < cantidad; i++) {
      const newAcademy = generateRandomAcademy(i);

      try {
        await setDoc(doc(db, "academias", newAcademy.id), newAcademy);
        setSuccessCount((prev) => prev + 1);
        console.log(`✅ Academia creada: ${newAcademy.name}`);
      } catch (error) {
        console.error(`❌ Error al crear academia ${newAcademy.name}:`, error);
      }
    }

    setLoading(false);
  };

  const handleAssignOrganizers = async () => {
    setAssigningOrganizers(true);
    setAssignedCount(0);

    try {
      // Obtener todos los usuarios con rol "organizer"
      const organizersQuery = query(
        collection(db, "users"),
        where("roleId", "==", "organizer")
      );
      const organizersSnapshot = await getDocs(organizersQuery);
      const organizers = organizersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (organizers.length === 0) {
        alert("No se encontraron usuarios con rol 'organizer'. Crea algunos usuarios primero.");
        setAssigningOrganizers(false);
        return;
      }

      // Obtener todas las academias
      const academiesSnapshot = await getDocs(collection(db, "academias"));
      const academies = academiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      if (academies.length === 0) {
        alert("No se encontraron academias. Crea algunas academias primero.");
        setAssigningOrganizers(false);
        return;
      }

      // Asignar organizadores a academias de forma aleatoria
      for (const academy of academies) {
        const randomOrganizer = organizers[Math.floor(Math.random() * organizers.length)];
        
        try {
          await updateDoc(doc(db, "academias", academy.id), {
            organizerId: randomOrganizer.id,
            updatedAt: Timestamp.now()
          });
          await updateDoc(doc(db, "users", randomOrganizer.id), {
            marinera: {academyId: academy.id},
            updatedAt: Timestamp.now()
          });
          
          setAssignedCount(prev => prev + 1);
          console.log(`✅ Organizador ${randomOrganizer.firstName} asignado a academia ${academy.name}`);
        } catch (error) {
          console.error(`❌ Error al asignar organizador a academia ${academy.name}:`, error);
        }
      }

      console.log(`🎉 Proceso completado: ${academies.length} academias actualizadas`);
    } catch (error) {
      console.error("❌ Error en el proceso de asignación:", error);
      alert("Error al asignar organizadores. Revisa la consola para más detalles.");
    }

    setAssigningOrganizers(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6 mt-8">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Creación Masiva de Academias
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de academias
        </label>
        <input
          type="number"
          min={1}
          max={10}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full border-2 border-gray-300 focus:border-green-500 focus:ring-2 focus:ring-green-200 rounded-lg px-4 py-3 text-gray-700 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">
          Se crearán academias numeradas (Academia 1, Academia 2, etc.) con datos realistas de diferentes departamentos del Perú
        </p>
      </div>

      <button
        onClick={handleCreate}
        disabled={loading || assigningOrganizers}
        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Creando academias...</span>
          </div>
        ) : (
          "Crear Academias"
        )}
      </button>

      <button
        onClick={handleAssignOrganizers}
        disabled={loading || assigningOrganizers}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition duration-200"
      >
        {assigningOrganizers ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Asignando organizadores...</span>
          </div>
        ) : (
          "Asignar Organizadores"
        )}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700">
          <span className="font-medium">Academias creadas:</span>
          <span className="text-green-600 font-bold text-lg ml-2">
            {successCount}
          </span>
        </p>
        {assignedCount > 0 && (
          <p className="text-gray-700 mt-2">
            <span className="font-medium">Organizadores asignados:</span>
            <span className="text-blue-600 font-bold text-lg ml-2">
              {assignedCount}
            </span>
          </p>
        )}
      </div>

      {(successCount > 0 || assignedCount > 0) && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <p className="text-sm text-green-700">
              {successCount > 0 && assignedCount === 0 && 
                "Las academias han sido creadas exitosamente. Usa el botón 'Asignar Organizadores' para asignar organizadores automáticamente."
              }
              {assignedCount > 0 && 
                "¡Proceso completado! Las academias tienen organizadores asignados. Ahora puedes crear usuarios."
              }
            </p>
          </div>
        </div>
      )}
    </div>
  );
}