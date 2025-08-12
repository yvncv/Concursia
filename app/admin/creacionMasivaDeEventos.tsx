"use client";

import { useState } from "react";
import { collection, doc, setDoc, Timestamp, getDocs, query, where } from "firebase/firestore";
import { db } from "@/app/firebase/config";
import { CustomEvent, CompetitionPhase, LevelData, EventSettings } from "@/app/types/eventType";
import { v4 as uuidv4 } from "uuid";

type CreateEventData = Omit<CustomEvent, 'createdAt' | 'updatedAt'> & {
  createdAt: Timestamp;
  updatedAt: Timestamp;
};

function generateRandomEvent(index: number, academies: any[], organizers: any[]): CreateEventData {

  const eventTypes = ["Concurso", "Festival", "Campeonato", "Encuentro Cultural"];
  const statuses = ["active", "draft", "published"];
  const capacities = ["100", "200", "300", "500", "800", "1000"];

  const departments = [
    { name: "Lima", provinces: ["Lima", "Callao"], districts: ["Miraflores", "San Isidro", "Barranco", "Surco", "La Molina"] },
    { name: "La Libertad", provinces: ["Trujillo", "Pacasmayo"], districts: ["Trujillo", "Laredo", "Huanchaco", "Moche"] },
    { name: "Arequipa", provinces: ["Arequipa"], districts: ["Cayma", "Yanahuara", "Cerro Colorado", "Paucarpata"] },
    { name: "Piura", provinces: ["Piura", "Sullana"], districts: ["Piura", "Castilla", "Catacaos", "Paita"] },
    { name: "Cusco", provinces: ["Cusco"], districts: ["San Blas", "Santiago", "Wanchaq", "San Sebastián"] }
  ];

  const venues = [
    "Centro de Convenciones",
    "Coliseo Municipal",
    "Teatro Nacional",
    "Auditorio Principal",
    "Casa de la Cultura",
    "Centro Cultural",
    "Polideportivo Municipal",
    "Gran Teatro",
    "Centro de Espectáculos",
    "Complejo Cultural"
  ];

  // Selección aleatoria de datos
  const selectedDepartment = departments[Math.floor(Math.random() * departments.length)];
  const selectedProvince = selectedDepartment.provinces[Math.floor(Math.random() * selectedDepartment.provinces.length)];
  const selectedDistrict = selectedDepartment.districts[Math.floor(Math.random() * selectedDepartment.districts.length)];
  const selectedVenue = venues[Math.floor(Math.random() * venues.length)];
  const selectedAcademy = academies[Math.floor(Math.random() * academies.length)];
  const selectedOrganizer = organizers[Math.floor(Math.random() * organizers.length)];

  // Nombres y descripciones numerados (más simple)
  const eventName = `Evento ${index + 1}`;
  const description = `Descripción ${index + 1}`;
  const eventType = "Concurso";
  const status = "active";
  const capacity = "200";

  // Generar fechas (eventos entre 1 mes atrás y 6 meses adelante)
  const baseDate = new Date();
  const startDate = new Date(baseDate.getTime() + (Math.random() * 210 - 30) * 24 * 60 * 60 * 1000); // Entre -30 y +180 días
  const endDate = new Date(startDate.getTime() + (Math.random() * 3 + 1) * 24 * 60 * 60 * 1000); // 1-4 días después

  // Generar coordenadas
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
  
  const latitude = (baseLat + (Math.random() - 0.5) * 0.1).toFixed(6);
  const longitude = (baseLng + (Math.random() - 0.5) * 0.1).toFixed(6);

  // Generar nivel seriado único (como en el ejemplo)
  const danceLevels = {
    "Seriado": {
      selected: true,
      categories: ["Baby", "Pre-Infante", "Master", "Infante", "Infantil", "Junior", "Oro", "Senior", "Adulto", "Juvenil"],
      price: 20,
      couple: false,
      config: {
        blocks: 1,
        tracksPerBlock: 4,
        judgesCount: 5,
        notes: "Seriado - Sin fases, tanda única"
      }
    }
  };

  // Configuración simplificada del evento (sin configuración compleja de fases)
  const eventSettings: EventSettings = {
    inscription: {
      groupEnabled: true,
      individualEnabled: true,
      onSiteEnabled: true
    },
    registration: {
      grupalCSV: true,
      individualWeb: true,
      sameDay: true
    },
    pullCouple: {
      enabled: false,
      criteria: "Category",
      difference: 2
    }
  };

  return {
    id: (Date.now() + index).toString(), // ID seriado como timestamp + índice
    name: eventName,
    description: description,
    startDate: Timestamp.fromDate(startDate),
    endDate: Timestamp.fromDate(endDate),
    academyId: selectedAcademy?.id || "",
    academyName: selectedAcademy?.name || "Academia Independiente",
    organizerId: selectedOrganizer?.id || "temp-organizer-id",
    staff: [
      {
        userId: selectedOrganizer?.id || "temp-organizer-id",
        permissions: ["overview", "judge", "live"],
        juradoInicia: false
      }
    ],
    smallImage: "",
    bannerImage: "",
    location: {
      street: `Av. Principal ${Math.floor(Math.random() * 999 + 100)}`,
      district: selectedDistrict,
      province: selectedProvince,
      department: selectedDepartment.name,
      placeName: selectedVenue,
      coordinates: {
        latitude: latitude,
        longitude: longitude
      }
    },
    eventType: eventType,
    capacity: capacity,
    status: status,
    dance: {
      levels: danceLevels
    },
    participants: {},
    settings: eventSettings,
    completedCompetitions: [],
    createdBy: selectedOrganizer?.firstName + " " + selectedOrganizer?.lastName || "temp-organizer",
    lastUpdatedBy: selectedOrganizer?.firstName + " " + selectedOrganizer?.lastName || "temp-organizer",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now()
  };
}

export default function CreacionMasivaDeEventos() {
  const [cantidad, setCantidad] = useState(5);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [loadingData, setLoadingData] = useState(false);
  const [academies, setAcademies] = useState<any[]>([]);
  const [organizers, setOrganizers] = useState<any[]>([]);

  const loadRequiredData = async () => {
    setLoadingData(true);
    
    try {
      // Cargar academias
      const academiesSnapshot = await getDocs(collection(db, "academias"));
      const academiesData = academiesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setAcademies(academiesData);

      // Cargar organizadores
      const organizersQuery = query(
        collection(db, "users"),
        where("roleId", "==", "organizer")
      );
      const organizersSnapshot = await getDocs(organizersQuery);
      const organizersData = organizersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrganizers(organizersData);

      console.log(`📊 Datos cargados: ${academiesData.length} academias, ${organizersData.length} organizadores`);
      
    } catch (error) {
      console.error("❌ Error al cargar datos:", error);
      alert("Error al cargar los datos necesarios. Revisa la consola.");
    }
    
    setLoadingData(false);
  };

  const handleCreate = async () => {
    setLoading(true);
    setSuccessCount(0);

    // Verificar que tenemos los datos necesarios
    if (academies.length === 0 || organizers.length === 0) {
      alert("Necesitas cargar los datos primero (academias y organizadores)");
      setLoading(false);
      return;
    }

    for (let i = 0; i < cantidad; i++) {
      const newEvent = generateRandomEvent(i, academies, organizers);

      try {
        await setDoc(doc(db, "eventos", newEvent.id), newEvent);
        setSuccessCount((prev) => prev + 1);
        console.log(`✅ Evento creado: ${newEvent.name} (ID: ${newEvent.id})`);
      } catch (error) {
        console.error(`❌ Error al crear evento ${newEvent.name}:`, error);
      }
    }

    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-lg rounded-xl p-8 space-y-6 mt-8">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-6">
        Creación Masiva de Eventos
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de eventos
        </label>
        <input
          type="number"
          min={1}
          max={15}
          value={cantidad}
          onChange={(e) => setCantidad(Number(e.target.value))}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-gray-700 transition-all duration-200"
        />
        <p className="text-xs text-gray-500">
          Se crearán eventos seriados simples: Evento 1, Evento 2, etc. con modalidad única "Seriado"
        </p>
      </div>

      <button
        onClick={loadRequiredData}
        disabled={loading || loadingData}
        className="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition duration-200"
      >
        {loadingData ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Cargando datos...</span>
          </div>
        ) : (
          `Cargar Datos (${academies.length} academias, ${organizers.length} organizadores)`
        )}
      </button>

      <button
        onClick={handleCreate}
        disabled={loading || loadingData || academies.length === 0 || organizers.length === 0}
        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-medium px-6 py-3 rounded-lg transition duration-200"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
            <span>Creando eventos...</span>
          </div>
        ) : (
          "Crear Eventos"
        )}
      </button>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
        <p className="text-gray-700">
          <span className="font-medium">Eventos creados:</span>
          <span className="text-blue-600 font-bold text-lg ml-2">
            {successCount}
          </span>
        </p>
      </div>

      {successCount > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
            <p className="text-sm text-blue-700">
              ¡Eventos creados exitosamente! Cada evento incluye:
              <br />• Modalidad "Seriado" con 10 categorías estándar
              <br />• Configuración simple: 1 bloque, 4 pistas, 5 jurados
              <br />• Precio fijo de 20 soles, sin parejas
              <br />• Nombres numerados: Evento 1, Evento 2, etc.
            </p>
          </div>
        </div>
      )}

      {(academies.length === 0 || organizers.length === 0) && !loadingData && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
            <p className="text-sm text-yellow-700">
              ⚠️ Necesitas cargar los datos primero. Asegúrate de tener academias y usuarios con rol "organizer" en tu base de datos.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}