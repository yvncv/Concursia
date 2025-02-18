interface EventDetailsProps {
  data: {
    capacity: string;
    eventType: string;
  };
  updateData: (data: any) => void;
  isOnlyRead: boolean; // 🔹 Agregado para solo lectura
}

export default function EventDetails({ data, updateData, isOnlyRead }: EventDetailsProps) {
  const eventTypes = [
    { value: '', label: 'Selecciona el tipo de evento' },
    { value: 'Concurso', label: 'Concurso' },
    { value: 'Ensayo con banda', label: 'Ensayo con banda' },
    { value: 'Celebración', label: 'Celebración' }
  ];

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-4">
          Capacidad
        </label>
        <input
          type="number"
          id="capacity"
          min="1"
          value={data.capacity}
          onChange={(e) => updateData({ ...data, capacity: e.target.value })}
          disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
            ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
          placeholder="Ingrese la capacidad del evento"
        />
      </div>

      <div>
        <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-4">
          Tipo de Evento
        </label>
        <select
          id="eventType"
          value={data.eventType}
          onChange={(e) => updateData({ ...data, eventType: e.target.value })}
          disabled={isOnlyRead} // 🔹 Deshabilitar en modo lectura
          className={`w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none transition-all resize-none 
            ${isOnlyRead ? 'bg-gray-200 cursor-not-allowed opacity-50' : 'focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)]'}`}
        >
          {eventTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
