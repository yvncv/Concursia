// utils/generadorEventos.ts
import { fakerES as faker } from "@faker-js/faker";
import { Timestamp } from "firebase/firestore";
import { v4 as uuidv4 } from "uuid";
import { CustomEvent, LevelData, CompetitionPhase } from "@/app/types/eventType";
import { Academy } from "@/app/types/academyType";
import { User } from "@/app/types/userType";
import { useState } from "react";
import useAcademies from "@/app/hooks/useAcademies";
import useUsers from "@/app/hooks/useUsers";
import { db } from "@/app/firebase/config";
import { addDoc, collection } from "firebase/firestore";
import { doc, setDoc } from "firebase/firestore";

// Generar datos base para niveles
const generarLevel = (categorias: string[]): LevelData => ({
  selected: true,
  categories: categorias,
  price: faker.number.int({ min: 10, max: 50 }),
  couple: faker.datatype.boolean(),
});

// Generar un evento para una academia
export const generarEventoPorAcademia = (
  academy: Academy,
  organizerId: string
): CustomEvent => {
  const startDate = Timestamp.fromDate(faker.date.soon({ days: 15 }));
  const endDate = Timestamp.fromDate(
    faker.date.soon({ days: 17, refDate: startDate.toDate() })
  );

  return {
    id: uuidv4(),
    name: `Festival ${faker.location.city()} de Marinera`,
    description:
      "Acompáñanos en [nombre del evento], una jornada dedicada a [objetivo o tema principal: e.g., “la creatividad gastronómica” / “la innovación tecnológica” / “la música andina”]. Será una oportunidad para [actividad principal: e.g., “degustar platos de autor” / “conocer las últimas tendencias” / “disfrutar de presentaciones en vivo”] y conectar con [público objetivo: e.g., “amantes de la cocina” / “profesionales del sector” / “familias y amigos”].",
    startDate,
    endDate,
    academyId: academy.id,
    academyName: "Tusuy Perú",
    organizerId: organizerId,
    createdBy: organizerId,
    lastUpdatedBy: organizerId,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
    bannerImage: "https://firebasestorage.googleapis.com/v0/b/next-proj-216fd.firebasestorage.app/o/events%2FbannerImages%2F1740355803523?alt=media&token=948c4852-f531-4d27-8e10-fafb998682eb",
    smallImage: "https://firebasestorage.googleapis.com/v0/b/next-proj-216fd.firebasestorage.app/o/events%2FsmallImages%2F1740355803523?alt=media&token=dd8bf7c5-8945-4054-a7fc-32555775cf78",
    location: {
      coordinates: {
        latitude: "-12.0833635",
        longitude: "-76.9852257",
      },
      department: "16",
      district: "01",
      province: "01",
      placeName: "Avenida Javier Prado Este",
      street: "Av. Javier Prado Este, Lima, Perú",
    },
    capacity: "124",
    eventType: "Concurso",
    status: "active",
    dance: {
      levels: {
        Seriado: {
          categories: ["Junior", "Juvenil", "Adulto"],
          couple: false,
          price: 12,
          selected: true,
        },
      },
    },
    settings: {
      inscription: {
        groupEnabled: false,
        individualEnabled: true,
        onSiteEnabled: true,
      },
      pullCouple: {
        enabled: false,
        criteria: "Category",
        difference: 0,
      },
      phases: {
        semifinalThreshold: 12,
        finalParticipantsCount: 6,
        timePerParticipant: {
          Eliminatoria: 3,
          Semifinal: 4,
          Final: 5,
        },
      },
    },
    schedule: {
      dayCount: 1,
      items: [
        {
          id: faker.string.uuid(),
          category: "Junior",
          levelId: "Seriado",
          day: 1,
          order: 1,
          phase: "Final",
          estimatedTime: 0,
        },
        {
          id: faker.string.uuid(),
          category: "Juvenil",
          levelId: "Seriado",
          day: 1,
          order: 2,
          phase: "Final",
          estimatedTime: 0,
        },
        {
          id: faker.string.uuid(),
          category: "Adulto",
          levelId: "Seriado",
          day: 1,
          order: 3,
          phase: "Final",
          estimatedTime: 0,
        },
      ],
    },
  };
};

// Crear eventos para N academias a partir de usuarios organizadores
export const generarEventosParaAcademias = (
  academias: Academy[],
  organizadores: User[],
  eventosPorAcademia: number
): CustomEvent[] => {
  const academiasFiltradas = academias.slice(0, organizadores.length);
  const eventos: CustomEvent[] = [];

  academiasFiltradas.forEach((academia, i) => {
    const organizerId = organizadores[i].id;
    for (let j = 0; j < eventosPorAcademia; j++) {
      eventos.push(generarEventoPorAcademia(academia, organizerId));
    }
  });

  return eventos;
};

export default function GeneradorEventosPorAcademia() {
  const { academies, loadingAcademies } = useAcademies();
  const { users, loadingUsers } = useUsers();

  const [cantidadEventos, setCantidadEventos] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [creados, setCreados] = useState<number>(0);

  const handleGenerar = async () => {
    if (loadingAcademies || loadingUsers) return;

    setLoading(true);
    setCreados(0);

    const organizadores = users.filter((u) => u.roleId === "organizer");

    if (organizadores.length === 0 || academies.length === 0) {
      alert("No hay organizadores o academias disponibles.");
      setLoading(false);
      return;
    }

    const eventos: CustomEvent[] = generarEventosParaAcademias(
      academies,
      organizadores,
      cantidadEventos
    );

    let successCount = 0;

    for (const evento of eventos) {
      try {
        await setDoc(doc(db, "eventos", evento.id), evento); // 🔥 Usar setDoc con el id definido
        successCount++;
      } catch (err) {
        console.error("Error al guardar evento:", err);
      }
    }

    setCreados(successCount);
    setLoading(false);
  };

  return (
    <div className="max-w-md mx-auto bg-white shadow-xl rounded-xl p-8 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800 text-center mb-4">
        Generador de Eventos por Academia
      </h1>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          Cantidad de eventos por academia
        </label>
        <input
          type="number"
          min={1}
          max={3}
          value={cantidadEventos}
          onChange={(e) => setCantidadEventos(Number(e.target.value))}
          className="w-full border-2 border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg px-4 py-3 text-gray-700"
        />
      </div>

      <button
        onClick={handleGenerar}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
        disabled={loading || loadingAcademies || loadingUsers}
      >
        {loading ? "Generando..." : "Generar Eventos"}
      </button>

      <div className="text-center text-gray-700">
        Eventos creados:{" "}
        <span className="font-bold text-blue-600 text-lg">{creados}</span>
      </div>
    </div>
  );
}
