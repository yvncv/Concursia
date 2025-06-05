import useEvents from "@/app/hooks/useEvents";
import { Timestamp } from "firebase/firestore";
import { useEffect, useState } from "react";

interface EventData {
  startDate: Timestamp;
  endDate: Timestamp;
}

interface EventDatesProps {
  data: EventData;
  updateData: (data: EventData) => void;
  isOnlyRead: boolean; // 🔹 Agregado para solo lectura
}

export default function EventDates({
  data,
  updateData,
  isOnlyRead,
}: EventDatesProps) {
  const [eventsOnDate, setEventsOnDate] = useState<CustomEvent[]>([]);
  const { events } = useEvents();
useEffect(() => {

  if (!data.startDate) {
    setEventsOnDate([]);
    return;
  }
  // Obtener la fecha seleccionada en UTC (año, mes, día)
  const selected = data.startDate.toDate();
  const selectedYear = selected.getFullYear();
  const selectedMonth = selected.getMonth();
  const selectedDay = selected.getDate();

  const filtered = events?.filter((event: CustomEvent) => {
    const eventDate = event?.startDate.toDate();
    console.log(eventDate)
    return (
      eventDate.getFullYear() === selectedYear &&
      eventDate.getMonth() === selectedMonth &&
      eventDate.getDate() === selectedDay
    );
  });
  setEventsOnDate(filtered);
  console.log(filtered)
}, [data.startDate, events]);
  return (
    <div className="space-y-4">
      <div>
        <label
          htmlFor="startDate"
          className="block text-sm font-medium text-gray-700 mb-4"
        >
          Fecha y Hora de Inicio
        </label>
        <input
  type="datetime-local"
  id="startDate"
  value={
    data.startDate
      ? new Date(
          data.startDate.seconds * 1000 - new Date().getTimezoneOffset() * 60000
        )
          .toISOString()
          .slice(0, 16)
      : ""
  }
  onChange={(e) => {
    // Convertir el valor del input a fecha local correctamente
    const localDate = new Date(e.target.value);
    updateData({
      ...data,
      startDate: Timestamp.fromDate(localDate),
    });
  }}
  disabled={isOnlyRead}
  className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] 
    focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
    ${
      isOnlyRead
        ? "bg-gray-200 cursor-not-allowed opacity-50"
        : "focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]"
    }`}
/>
      </div>

      <div>
        <label
          htmlFor="endDate"
          className="block text-sm font-medium text-gray-700 mb-4"
        >
          Fecha y Hora de Finalización
        </label>
        <input
          type="datetime-local"
          id="endDate"
          value={data.endDate.toDate().toISOString().slice(0, 16)} // Convertir Timestamp a string
          onChange={(e) =>
            updateData({
              ...data,
              endDate: Timestamp.fromDate(new Date(e.target.value)),
            })
          } // Convertir string a Timestamp
          disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] 
            focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
            ${
              isOnlyRead
                ? "bg-gray-200 cursor-not-allowed opacity-50"
                : "focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]"
            }`}
        />
      </div>

      <div>
        {eventsOnDate.length > 0 && (
          <div className="mt-6">
            <div className="flex items-center gap-2 mb-4 text-lg font-semibold">
              <span className="text-blue-600">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="inline w-5 h-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </span>
              Eventos programados para{" "}
              {data.endDate.toDate().toLocaleDateString("es-ES", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
            <div className="space-y-3">
              {eventsOnDate.map((event, idx) => (
                <div
                  key={idx}
                  className="border rounded-lg p-4 flex flex-col gap-2 shadow-sm"
                >
                  <div className="font-semibold text-base">
                    {event.name || "Evento sin título"}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="inline w-4 h-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      {event.startDate
                        .toDate()
                        .toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}{" "}
                      -{" "}
                      {event.endDate
                        .toDate()
                        .toLocaleTimeString("es-ES", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                    </span>
                    <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded text-xs">
                      {event.type || "Evento"}
                    </span>
                    <span className="bg-black text-white px-2 py-0.5 rounded text-xs">
                      Activo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
