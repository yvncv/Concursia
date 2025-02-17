import { Timestamp } from "firebase/firestore";

interface EventDatesProps {
  data: {
    startDate: Timestamp;
    endDate: Timestamp;
  };
  updateData: (data: any) => void;
}

export default function EventDates({ data, updateData }: EventDatesProps) {
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
              onChange={(e) => updateData({ ...data, startDate: Timestamp.fromDate(new Date(e.target.value)) })} // Convertir string a Timestamp
              className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
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
              onChange={(e) => updateData({ ...data, endDate: Timestamp.fromDate(new Date(e.target.value)) })} // Convertir string a Timestamp
              className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
          />
        </div>
      </div>
  );
}