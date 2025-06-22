"use client";

import { useState } from "react";
import useUsers from "@/app/hooks/useUsers";
import useEvents from "@/app/hooks/useEvents";
import useAcademies from "@/app/hooks/useAcademies";
import useCreateTicket from "../hooks/tickets/useCreateTicket";

export default function GeneradorVisual() {
  const { users, loadingUsers } = useUsers();
  const { events, loadingEvents } = useEvents();
  const { academies, loadingAcademies } = useAcademies();
  const { createTicket } = useCreateTicket();

  const [step, setStep] = useState(0);
  const [cantidad, setCantidad] = useState(5);
  const [ticketsCreados, setTicketsCreados] = useState<string[]>([]);
  const [progreso, setProgreso] = useState(0);
  const [log, setLog] = useState<string[]>([]);
  const [procesando, setProcesando] = useState(false);

 const handleGenerar = async () => {
  if (loadingUsers || loadingEvents || loadingAcademies) return;

  console.log("▶️ Iniciando generación de tickets...");

  const validUsers = users.filter(
    (u) =>
      u.roleId === "user" &&
      // u.marinera?.academyId &&
      u.marinera?.participant?.category &&
      u.email
  );

  if (validUsers.length === 0 || events.length === 0) {
    alert("No hay usuarios o eventos válidos disponibles.");
    console.log("⚠️ No hay usuarios válidos o eventos.");
    return;
  }

  const academiesMap: Record<string, string> = {};
  academies.forEach((a) => {
    academiesMap[a.id] = a.name;
  });

  setStep(1);
  setProcesando(true);
  setTicketsCreados([]);
  setLog([]);
  const inscritosPorEvento = new Map<string, Set<string>>();

  for (let i = 0; i < cantidad; i++) {
    const event = events[Math.floor(Math.random() * events.length)];
    const inscritos = inscritosPorEvento.get(event.id) || new Set<string>();
    const posiblesUsuarios = validUsers.filter((u) => !inscritos.has(u.id));

    console.log(`🎯 Iteración ${i + 1} | Evento: ${event.name}`);
    console.log("Usuarios disponibles:", posiblesUsuarios.length);

    if (posiblesUsuarios.length === 0) {
      setLog((prev) => [...prev, `⚠️ No quedan usuarios disponibles para ${event.name}`]);
      console.log("⚠️ Saltando iteración: no hay usuarios disponibles para este evento.");
      continue;
    }

    const user = posiblesUsuarios[Math.floor(Math.random() * posiblesUsuarios.length)];
    inscritos.add(user.id);
    inscritosPorEvento.set(event.id, inscritos);

    const selectedCategory = user.marinera!.participant!.category;
    const selectedAcademy = user.marinera!.academyId!;
    const selectedAcademyName = academiesMap[selectedAcademy] || "Desconocida";

    console.log(`👤 Usuario seleccionado: ${user.firstName} ${user.lastName}`);
    console.log(`📂 Categoría: ${selectedCategory} | Academia: ${selectedAcademyName}`);

    // Validar si la categoría existe en el evento
    if (!event.dance?.levels || !(selectedCategory in event.dance.levels)) {
      const msg = `❌ ${user.firstName} tiene categoría "${selectedCategory}" no válida en ${event.name}`;
      setLog((prev) => [...prev, msg]);
      console.log(msg);
      continue;
    }

    try {
      console.log("📩 Llamando a createTicket...");
      const ticketId = await createTicket({
        event,
        user,
        pareja: null,
        selectedCategory,
        selectedAcademy,
        selectedAcademyName,
        coupleSelectedAcademy: "",
        coupleSelectedAcademyName: "",
      });

      if (ticketId) {
        setTicketsCreados((prev) => [...prev, ticketId]);
        const msg = `✅ ${user.firstName} ${user.lastName} inscrito en ${event.name} (${selectedCategory})`;
        setLog((prev) => [...prev, msg]);
        console.log("🟢 Ticket creado con ID:", ticketId);
      } else {
        console.log("❗ createTicket no devolvió ID");
      }
    } catch (error) {
      const msg = `❌ Error al inscribir ${user.firstName} en ${event.name}`;
      setLog((prev) => [...prev, msg]);
      console.error(msg, error);
    }

    setProgreso(Math.floor(((i + 1) / cantidad) * 100));
  }

  console.log("✅ Proceso de generación completado.");
  setProcesando(false);
  setStep(2);
};



  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6 bg-white shadow rounded-xl">
      <h1 className="text-2xl font-bold text-center">Generador Visual de Tickets</h1>

      {step === 0 && (
        <>
          <label className="block text-sm font-medium text-gray-700">Cantidad a generar</label>
          <input
            type="number"
            value={cantidad}
            min={1}
            max={3}
            onChange={(e) => setCantidad(Number(e.target.value))}
            className="w-full px-4 py-2 border rounded-md"
          />
          <button
            onClick={handleGenerar}
            className="w-full bg-blue-600 text-white py-3 rounded-md"
            disabled={procesando}
          >
            Iniciar Generación
          </button>
        </>
      )}

      {step === 1 && (
        <div>
          <p className="mb-4 text-center text-gray-700">Generando tickets... {progreso}%</p>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all"
              style={{ width: `${progreso}%` }}
            />
          </div>
          <ul className="mt-4 text-sm max-h-64 overflow-y-auto space-y-1">
            {log.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        </div>
      )}

      {step === 2 && (
        <div className="text-center">
          <p className="text-lg font-semibold text-green-600">
            ✅ {ticketsCreados.length} tickets creados exitosamente
          </p>
          <button
            onClick={() => setStep(0)}
            className="mt-4 px-6 py-2 bg-gray-200 rounded-md"
          >
            Generar Nuevamente
          </button>
        </div>
      )}
    </div>
  );
}
