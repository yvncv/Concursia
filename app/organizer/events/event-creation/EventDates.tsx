import { Timestamp } from "firebase/firestore";

interface EventData {
  startDate: Timestamp;
  endDate: Timestamp;
}

interface EventDatesProps {
  data: EventData;
  updateData: (data: EventData) => void;
  isOnlyRead: boolean; // 🔹 Agregado para solo lectura
}

export default function EventDates({ data, updateData, isOnlyRead }: EventDatesProps) {
  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-4">
          Fecha y Hora de Inicio
        </label>
        <input
          type="datetime-local"
          id="startDate"
          value={data.startDate.toDate().toISOString().slice(0, 16)} // Convertir Timestamp a string
          onChange={(e) =>
            updateData({ ...data, startDate: Timestamp.fromDate(new Date(e.target.value)) })
          } // Convertir string a Timestamp
          disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] 
            focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
            ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
        />
      </div>

      <div>
        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-4">
          Fecha y Hora de Finalización
        </label>
        <input
          type="datetime-local"
          id="endDate"
          value={data.endDate.toDate().toISOString().slice(0, 16)} // Convertir Timestamp a string
          onChange={(e) =>
            updateData({ ...data, endDate: Timestamp.fromDate(new Date(e.target.value)) })
          } // Convertir string a Timestamp
          disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] 
            focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
            ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
        />
      </div>
    </div>
  );
}
