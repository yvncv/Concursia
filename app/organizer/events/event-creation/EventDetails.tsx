interface EventDetailsProps {
  data: {
    capacity: number;
    eventType: string;
  }
  updateData: (data: any) => void;
}

export default function EventDetails({ data, updateData }: EventDetailsProps) {
  const eventTypes = [
    { value: '', label: 'Selecciona el tipo de evento' },
    { value: 'competition', label: 'Concurso' },
    { value: 'exhibition', label: 'Ensayo con banda' },
    { value: 'workshop', label: 'Celebración' }
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
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
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
          className="w-full px-4 py-2 border-b-2 border-[var(--gris-claro)] placeholder:text-[var(--gris-oscuro)] focus:ring-0 focus:border-transparent focus:outline-none focus:shadow-[0px_4px_0px_0px_rgba(22,163,74,0.3)] transition-all resize-none"
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
